---
title: "The Migration Nobody Noticed"
description: "The best migrations are invisible. Treat coexistence as the product, measure divergence instead of progress, and make the change boring enough to forget."
pubDate: 2026-11-21
tags: ["architecture", "devops"]
featured: false
draft: false
---

The best review I ever got on a migration was four words long: "I didn't notice."

We had moved the billing ledger from one schema to another over eleven weeks. For most of that time, two systems wrote the same rows, read the same data, and disagreed in ways we measured every morning. On cutover day, the visible event was a Tuesday deploy and a finance report that ran two minutes late. A customer asked about it a month later, and only because the invoice PDF had changed a font.

That is the standard I now hold migrations to. Not "it worked." Not "we hit the date." Just: nobody outside the team could tell.

## Visible migrations are usually in trouble

When users notice a migration, they are usually noticing a symptom. Pages look different. Two numbers disagree. Confirmation emails arrive twice. A dashboard that loaded in 300 ms now takes 900. None of these are launch moments. They are incidents with a project plan attached.

The industry teaches the opposite. Migrations get kickoff decks, countdown channels, and an all-hands slide with a finish line on it. The attention is aimed at the switch. But the switch is the cheapest part of the work. The expensive part is the long middle, where both systems are live and neither is allowed to be wrong.

There is a second reason to distrust a visible migration. If users have to know about it, you have probably asked them to change something: a URL, a permission, a report format, a habit. Sometimes that is unavoidable. Often it is a sign that the migration was scoped around the new system's convenience instead of the old system's behavior. The people who notice are the people you failed to keep whole.

## Coexistence is the product

I have written elsewhere about the decision to migrate instead of rewrite, and why that distinction matters in [What I Learned Rewriting a Monolith](/blog/rewriting-the-monolith). This essay is about the part after the decision: what you operate while two systems hold the same truth.

Coexistence has three jobs. Keep serving correct reads. Keep accepting writes without losing one. Keep the difference between the two systems measurable at all times. The new schema, the service boundary, the deploy pipeline — all of it exists to support those three jobs, not the other way around.

The most useful artifact we built was not the new service. It was a router in front of both.

```ts
// One decision point, scoped small enough to reverse in a deploy.
export function route(request: Request, tenant: Tenant) {
  const target = flags.migrationTarget(tenant.id, request.route);
  if (target === 'shadow') return shadow(request, legacyHandler);
  if (target === 'new') return newHandler(request);
  return legacyHandler(request);
}
```

Twenty lines. It let us move one tenant and one route at a time, and move them back without a deploy. We picked the dullest seam we could find, for the reason I gave in [The Case for Boring Architecture](/blog/boring-architecture): a seam is something you will operate for months, not something you demo once.

## The order that keeps you out of the incident channel

Every phase below adds exactly one new risk. That constraint matters more than the sequence itself. Teams get into trouble when they enable dual writes, backfill history, and shift reads in the same week, then spend Friday untangling which change caused the mismatch.

| Phase | What users see | What is live | Exit condition |
| --- | --- | --- | --- |
| Inventory | Nothing | Old system only | Every reader and writer has a name |
| Shadow | Nothing | Old serves; new evaluates a sample | Latency and error parity within tolerance |
| Read canary | Nothing, if you are lucky | 1 to 5 percent of reads | No divergence for a week |
| Dual write | Nothing | Both stores receive writes | Every write path is idempotent |
| Backfill | Nothing | History copied in chunks | Re-running changes nothing |
| Cut over | Nothing | New writes, old mirrored | Rollback window elapsed |
| Retire | Nothing | Old read-only, then off | No callers for thirty days |

The table looks calm. The work is in the exit conditions, which are the only places where a team can honestly say "yes" or "not yet."

## Shadow traffic is not free

Shadow reads are the best trick in the toolkit and the easiest way to cause the outage you were trying to avoid. The new path does the same work as the old one, against the same database, for every sampled request. If you shadow everything, you have just doubled your read load during the exact week you are least able to absorb it.

The failure mode is rarely CPU. It is queues. Shadow queries compete for the same connection pool as production traffic, and the pool does not know which query is allowed to be slow. Average latency stays flat while the tail quietly fills up, which is the pattern I described in [A Field Guide to Slow APIs](/blog/slow-apis): the average is a rumor, and the p99 is where the complaints come from.

What worked for us:

- Sample by request, not by user, so no single tenant gets doubled.
- Cap shadow concurrency separately from production concurrency.
- Give shadow reads their own pool or replica when the budget allows.
- Put a deadline on the experiment. A shadow path that runs for a year is production traffic with extra steps.

## Divergence is the metric

Progress is a percentage on a slide. Divergence is a number you can act on. Pick the columns that matter, compare them continuously, and break the result down by tenant, route, and hour.

A global mismatch rate of 0.01 percent sounds excellent until you learn that it is 4 percent for one tenant and zero for everyone else. That tenant is either your most important customer or your best bug report. Either way, the average hid it.

Do not chase zero. Some divergence is structural: clock skew, formatting, a column the old system rounded and the new one truncates. What you want is a known floor with a named cause for every category. When the floor moves, you investigate. When it stays put, you ship the next phase.

Reconciliation deserves the same treatment. I once watched a team compare row counts every night for a month and feel good about it. Then a report came in low by a few percent, and the missing rows turned out to be records the old system had soft-deleted but never removed. Counting rows cannot see a value that changed. Compare sums, null counts, and a hash of a sampled set of columns.

## The write cutover is the only real cutover

Reads are reversible. A wrong read is a bad page view. A wrong write is a reconciliation project with a customer attached.

The rules that kept us out of trouble:

- One writer per table at a time, with a named owner and a written start time.
- Every write carries a stable idempotency key; retries are normal, duplicates are not.
- Writes go through an outbox or a log, not a best-effort second call that swallows exceptions.
- Backfill chunks by a stable key, never by an offset; offsets move when writes continue.
- Reconciliation is a gate on the next phase, not a report someone reads on Monday.

The bug that taught me the fourth rule was a backfill batched by `created_at` between midnight boundaries. A payment at 23:59:58 landed in two batches when the job re-ran, and the duplicate was invisible in row counts because the new table had a different primary key. We caught it because a daily sum per currency disagreed by one transaction. That is the kind of error a human notices and a dashboard does not, unless you ask the dashboard the right question.

## Rollback has an expiry date

Everyone says rollback must be rehearsed. Fewer people say when rollback stops being possible.

There are two kinds. Early on, rollback means pointing traffic back at the old system while the data is still compatible. Later, it means asking the old system to read rows it has never seen, or discarding writes it cannot represent. The second kind is not a rollback. It is a data loss decision wearing a runbook.

Find the date when that changes, write it down, and put it in the cutover plan next to the stop criteria. If the answer is "we cannot go back after Tuesday at noon," say that out loud in the review. Teams make better decisions when the one-way door is labeled.

## Saying nothing, on purpose

Most migration communication is written for the project, not the reader. Status updates, percentage-complete charts, a banner on the login page. Users do not need a progress bar. They need their work to keep working.

Our rule was simple. Support got the facts: what is changing, what someone might see if it goes wrong, who to ask, and the three sentences to send back. Users got nothing unless there was an impact worth explaining. The status page stayed for incidents.

This is not secrecy. It is a recognition that "we are migrating" is an internal sentence. The external version is "nothing has changed," and it should be true.

## The log nobody asked for

Write the migration log while you are in it, not after. What you tried, what you turned off, which divergence categories you accepted, what is still living on the old system and why.

The person who inherits this will not have your thread, your dashboard, or your memory of the Tuesday when a single route misbehaved. They will have a file, and twenty minutes. That is the audience I described in [Designing for the Second Reader](/blog/the-second-reader), and a migration is one of the few projects where the second reader is guaranteed to exist.

## Before you call it done

- [ ] The old path is still deployed, warm, and reachable.
- [ ] Every route has a default-off flag and a named owner.
- [ ] Divergence has a baseline, a tolerance, and a known cause per category.
- [ ] Backfill can be re-run without creating duplicates.
- [ ] Reconciliation compares values, not just counts.
- [ ] Rollback was rehearsed this week, and its expiry date is written down.
- [ ] Alerts page a person, not a channel.
- [ ] Support has three sentences and a name to escalate to.
- [ ] The migration log is current enough for someone who was not there.

A migration is finished when the old system can be turned off without a meeting. Until then, the work is to be unremarkable: no banners, no surprises, no charts that celebrate activity instead of stability. The best outcome is the one your users discover in a changelog months later, shrug at, and forget.

This essay belongs with the other notes on [architecture](/tags/architecture).

## Further reading

- [Martin Fowler — ParallelChange](https://martinfowler.com/bliki/ParallelChange.html)
- [Google SRE Workbook — Canarying Releases](https://sre.google/workbook/canarying-releases/)
- [AWS Prescriptive Guidance — Strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

---
title: "What I Learned Rewriting a Monolith"
description: "A rewrite is a bet that you understand the old system better than its builders. The safer path is a migration with a clean seam and a rehearsed rollback."
pubDate: 2026-07-20
tags: ["architecture", "devops"]
featured: true
draft: false
---

We called it a rewrite. It was a migration, and the difference cost us about six weeks. The old application was a monolith with a single Postgres database, a pile of Express routes, and a cron directory that had accumulated eleven years of good intentions. The plan was to rebuild the worst third of it behind a cleaner service boundary. The plan did not survive contact with the admin scripts.

## A rewrite is usually a migration

If data survives, it is a migration. A true rewrite kills the old system and starts over with an empty database, which almost nobody can afford. What most teams mean is: build the new thing, move the data, keep the business running during the move. That is a migration, and migrations are won or lost on coexistence, not on code quality.

The bet at the center of every rewrite is that you understand the old system better than the people who built it. Sometimes that is true because the builders are gone and the code is genuinely incomprehensible. Often it is only partially true: you understand the parts you have debugged, and the rest is a rumor with a schema.

Before writing code, we listed every route and asked: do we understand its behavior well enough to reproduce it, including the weird parts? Three routes got a "no." Those three took longer than the other thirty combined, which is the normal distribution of migrations.

## The strangler pattern, in practice

The strangler pattern works if you pick the seam carefully: the smallest place where you can route traffic without changing either side. For us it was the HTTP route, proxied through a tiny switch keyed by tenant and route name.

```ts
const handler = flags.useNewOrders(tenantId)
  ? newOrdersHandler
  : legacyOrdersHandler;

return handler(req, res);
```

That twenty-line switch did more for the migration than the new service design did. It let us send one internal tenant to the new code, watch it, and send it back without a deploy. It also forced us to keep the old handler runnable for the whole migration, which was the most valuable constraint we had.

Start with a read endpoint. Reads are reversible; writes are not. A wrong read is a bad page view. A wrong write is a reconciliation project, a customer email, and a very long Tuesday.

> The old system has to keep working longer than you want it to. Plan for that, not around it.

## Dual writes and the reconciliation problem

Once reads are split, writes become the hard part. We wrote to both systems for three months. Dual writes sound simple; there is no transaction spanning the two stores.

The rules that saved us:

- Write to the new system first, then the old, so the old remains the source of truth for anything not yet migrated.
- Make every write idempotent with a stable key, because retries will happen.
- Wrap each write in an outbox and a retry worker; never let a silent exception decide which store wins.
- Reconcile on more than row counts. Compare sums, null counts, and a hash of a sampled set of columns.

Our mistake was treating reconciliation as a nightly report instead of a gate. For a month we compared daily counts and felt good. Soft-deleted rows were never copied, because the backfill query filtered on `deleted_at IS NULL` and the old system's "delete" was actually a status column. We found out when a report that aggregated historical orders came in low by a few percent.

## The contracts nobody documented

The real interface of a monolith is not its API. It is everything that reads its database.

We inventoried the obvious callers and still missed things. The list that eventually mattered:

- Cron jobs living in three different crontabs, two of which nobody owned.
- CSV exports that finance imported manually every Monday.
- A read replica serving a BI tool with hand-written SQL.
- Admin scripts with hardcoded table names and no tests.
- Old mobile clients pinned to response shapes we had already stopped generating.

The one that caught us was an internal admin page everyone believed was read-only. It had a single button that reset an account flag by direct SQL. Someone used it monthly. When we moved writes to the new schema, the button kept writing to the old one, and the two systems disagreed for eleven days before a support ticket surfaced it.

That is what I would change: inventory readers and writers by watching actual database traffic for a week, not by asking people what they use. People describe the system they intend to use.

## What not to rewrite

The most useful decision was narrowing the scope. A partial rewrite is not a compromise; it is the correct default. The instinct to replace everything at once is usually [a convenience purchase with a deferred bill](/blog/cost-of-convenience).

| Phase | Reads to new | Writes | Data state | Exit condition |
| --- | --- | --- | --- | --- |
| Inventory | 0% | Old | Unchanged | Every reader and writer named |
| Shadow | 0% (compare only) | Old | Backfill running | Mismatch rate within tolerance for a week |
| Canary | 5%, internal tenants | Dual | Backfill complete | Error and latency parity |
| Expand | 5% to 50% | Dual | Nightly reconciliation | No unexplained drift for two weeks |
| Cut over | 100% | New, old mirrored | Old read-only | Rollback window elapsed |
| Retire | 100% | New | Old kept for audit | No callers for thirty days |

We left four things on the old system permanently: a reporting query with regulatory meaning, a batch job that ran twice a year, a legacy import path, and the admin button. Rewriting them would have added risk without adding value. This is the same argument I made in [The Case for Boring Architecture](/blog/boring-architecture): the goal is not a clean diagram, it is a system you can operate.

## Rollout and rollback

A rollout plan is a product, with users, failure modes, and a support story. Ours was a checklist we reviewed before every traffic change. I have come to think of it the same way I think about [the build pipeline as a product](/blog/build-pipeline-as-product): it is infrastructure someone has to own, not a document you write once.

- [ ] Each route has a flag scoped by tenant, defaulting off.
- [ ] The old path is still deployed, warmed, and reachable.
- [ ] Rollback has been rehearsed in staging within the last week.
- [ ] Backfill jobs are idempotent and can be re-run safely.
- [ ] Dual-write lag and mismatch alerts page a named owner.
- [ ] Stop criteria are written down before the change window.
- [ ] Someone with authority is present for the cutover.

The rollout sequence matters less than the ability to stop. We cut over writes on a Tuesday morning and reverted one route by lunch. Nobody noticed, which is the highest praise a migration can receive.

The rewrite did not end. The old system still serves that twice-yearly batch job, and I suspect it will outlive the new service. That is fine. The win was not replacing the monolith; it was learning which parts of it were worth keeping, and building a seam that let us decide one route at a time. The mechanics of the move itself — the coexistence window, the divergence checks, the rollback expiry date — are in [The Migration Nobody Noticed](/blog/the-migration-nobody-noticed). If you take one thing from this, take the seam. The new code will be rewritten again. A good seam survives.

This essay belongs with the other notes on [architecture](/tags/architecture).

## Further reading

- [Martin Fowler — StranglerFigApplication](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [AWS Prescriptive Guidance — Strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)

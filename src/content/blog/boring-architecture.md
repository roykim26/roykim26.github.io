---
title: "The Case for Boring Architecture"
description: "Every team wants the interesting choice. The interesting choice is usually the one you pay for at 3 a.m., with interest."
pubDate: 2026-06-02
tags: ["architecture"]
featured: true
draft: false
---

The most interesting system I ever shipped was also the one that woke me up the most. That correlation took me embarrassingly long to notice. I used to think "boring" was an insult you paid a team when you could not think of anything nicer to say about their stack. Now I think it is the highest compliment I can pay an architecture, and I will explain why with a migration that went sideways for exactly the reason you would guess.

## The migration that made the argument for me

We had a job scheduler that was, by every measure I cared about, boring. It was a table in Postgres, a worker process, and a cron entry. It ran reminders, nightly exports, and a few cleanup tasks.

Then we decided to replace it with a workflow engine. The pitch was reasonable: retries, visibility, backoff, a UI where support could see what happened. We ran a migration over a long weekend. On Monday, a subset of reminder emails went out twice, and a small number of invoices were generated with a stale amount. Nothing catastrophic, but enough that I spent two days reconciling rows by hand while explaining to people that the new system was "mostly working."

The root cause was not a bug in the engine. It was a behavior nobody documented: the engine retried a step on timeout even when the underlying handler had already committed. Our old table-based worker had the same class of problem, but we knew it, because we had written the idempotency key ourselves and everyone on the team had read that twenty-line function. With the new engine, the behavior lived in someone else's source tree and someone else's changelog.

We ended up running the engine in a mode that effectively reproduced the old queue-and-cron design, plus a wrapper. We paid for a new dependency and kept the old mental model.

## The upgrade tax

Every dependency charges rent. The question is whether the rent is predictable.

Boring technology charges rent you can budget for. Postgres gets a minor release; you patch it. A queue table gets a new column; you write a migration. The failure modes are documented in a manual that many people have read, so when something breaks, the search results are from 2016 and they are still correct.

Interesting technology charges a different kind of rent. The changelog is a marketing page. A minor version rewrites the internals and calls it performance. The docs describe the happy path and leave the failure modes to your imagination and your on-call rotation. You are not just adopting a tool; you are adopting a second job maintaining your understanding of it.

> Novelty is a loan. The interest is paid by whoever is on call.

That is [the cost of convenience](/blog/cost-of-convenience) in one sentence: the purchase price shows up in the design review, and the carrying cost shows up later.

## Three questions before you adopt anything

I now ask three questions whenever someone proposes new infrastructure. They are not clever, and that is the point.

1. **Who debugs this at 3 a.m.?** Not "who owns it" in the RACI sense. I mean: can one of us open a terminal, read the logs, and form a hypothesis without opening a vendor support ticket? If the answer is "the vendor," you have outsourced your worst hour to someone with a queue.
2. **What does removal cost?** Every addition should have an exit price in engineer-days. If migrating off the thing is a quarter of work, you have not adopted a tool; you have adopted a decade.
3. **What does it replace, and does it actually beat that?** Compare it to the boring status quo, not to nothing. A new search engine beats "no search." Does it beat `ILIKE` plus a trigram index for the two thousand rows you actually have?

If those answers are uncomfortable, the interesting choice is probably not ready.

## Boring versus interesting, side by side

The table below is how I frame the trade in practice. The "boring" column is not always right, but it is the default that has to be argued against.

| Need | Boring choice | Interesting choice | What the interesting choice usually costs |
| --- | --- | --- | --- |
| Background jobs | A jobs table plus a cron worker | Managed workflow engine | New retry semantics, new dashboard, same idempotency work |
| Caching | In-process LRU with a TTL | Dedicated cache cluster | A second consistency model and a new outage mode |
| Search | Postgres full-text and trigram indexes | Separate search service | Dual writes and an indexing lag nobody budgeted for |
| Event delivery | Outbox table with a poller | Message broker | Ordering guarantees you now have to reason about |

Notice that the boring column is not "do nothing." It is "do the small version of the thing, in a place you already operate."

## What boring actually buys you

Boring buys debuggability. One database, one process, one log stream means a failure has exactly one place to hide. When the system is interesting, the first hour of every incident is spent figuring out which of six moving parts is lying to you.

It buys onboarding. A new engineer can read the schema and the cron file and understand the whole system in an afternoon. Teams that can absorb new people quickly can also absorb new incidents quickly.

It buys reversibility. Swapping a cron script takes an afternoon. Swapping an event platform takes a quarter. Reversibility is the thing you want most when you are wrong, and you will be wrong sometimes.

And it buys sleep. Not metaphorically. The boring system fails in ways you have seen before, which means you fix it in twenty minutes and go back to bed. The failure modes of a monolith are the ones I described in [What I Learned Rewriting a Monolith](/blog/rewriting-the-monolith): visible, local, and usually caused by something you can read.

A boring stack is not a small stack. It is a stack whose failures you have already met.

## An adoption checklist

Before adding anything to the stack, I run through this list. If more than one item is unchecked, the answer is "not yet."

- [ ] One engineer can explain the failure modes without opening the vendor dashboard.
- [ ] The rollback path is documented and does not require a support contract.
- [ ] The new tool removes a category of code rather than relocating it.
- [ ] We have run it in staging under production-like load for at least a week.
- [ ] The exit cost is written down in engineer-days.
- [ ] We would still choose it if the price doubled next year.
- [ ] At least one person on the team has operated it before, not just read about it.

The goal is not to be boring forever. The goal is to spend your novelty budget on the one or two places where it changes the product, and to make everywhere else as unremarkable as possible. Most systems do not need a more interesting architecture. They need a smaller one, with fewer ways to fail, run by people who can see all of it at once.

This essay belongs with the other notes on [architecture](/tags/architecture).

## Further reading

- [Martin Fowler — MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- [Dan McKinley — Choose Boring Technology](https://mcfunley.com/choose-boring-technology)

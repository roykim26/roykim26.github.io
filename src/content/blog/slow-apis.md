---
title: "A Field Guide to Slow APIs"
description: "Your API is not slow everywhere. It is slow for one query, one tenant, one hour. Find that hour, read the p95, and fix the tail instead of the average."
pubDate: 2026-06-16
tags: ["performance", "engineering"]
featured: true
draft: false
---

The first thing I do when someone tells me the API is slow is ask them to make it slow for me. The second thing I do is stop them from opening the query log until we agree on which request, for which account, at which hour. Almost every latency investigation I have been part of went wrong at the same place: someone optimized the average while the actual complaint was about a tail.

## The average is a rumor

Averages are the most comfortable number in performance work, which is why they are the least useful. If I serve nine requests in 20 ms and one in two seconds, the average is about 220 ms. That number describes no request that ever happened.

Percentiles describe request populations. p50 is the typical request. p95 is your busy or heavier requests. p99 is the tail that produces timeouts, retries, and angry messages. For an endpoint that fans out to ten downstream calls, if each call has a one percent chance of hitting its p99, the chance that at least one does is roughly ten percent. In my experience that arithmetic is why the p99 becomes the p50 of your users' complaints.

| Metric | What it answers | What it hides |
| --- | --- | --- |
| p50 | What a typical request feels like | Every bad experience, by definition |
| p95 | The worst case most users still see | Rare tenants with pathological data |
| p99 | What triggers retries and alerts | Whether the tail is one query or many |
| Max | The single worst request | How often it happens |

The first useful question is not "what is our average latency" but "which percentile is failing, and for whom."

> A slow endpoint is a measurement problem before it is an optimization problem.

## CPU-bound or queue-bound

Once you have a percentile and a population, the next split is whether the time is being computed or waited on. The fix is completely different, and guessing here is how teams spend a week adding indexes to a connection pool problem.

CPU-bound slowness looks like this: p50 is already elevated, CPU sits near its ceiling under load, and a profiler shows time inside your code — serialization, a tight loop, a regex, JSON encoding a large object graph. Adding capacity helps until it doesn't; the real fix is doing less work per request.

Queue-bound slowness looks the opposite: p50 is fine, p99 is ugly, CPU is bored, and the time is spent waiting. The wait has an address: a connection pool, a row lock, a thread pool, an event loop backlog, or a downstream service. You can often see it before you understand it, because latency rises with concurrency while utilization stays flat.

If you cannot tell which one you have, you are not ready to change code.

## Triage order: measure, segment, trace, reproduce

I follow the same order every time. It is deliberately boring.

1. **Measure.** Get server-side timings for the route, not browser timings and not a colleague's recollection. Record start, each downstream call, and response write. If the number does not match the complaint, the complaint is about something else.
2. **Segment.** Break the distribution down by route, tenant, query shape, and hour. A global p99 can be perfectly healthy while one tenant's export job poisons every request that touches the same table.
3. **Trace.** Take one slow request and one fast request for the same endpoint, and compare the spans. The difference is usually a single call whose duration changes by an order of magnitude, not a uniform slowdown.
4. **Reproduce.** Replay the slow request with the real payload against a dataset with the real row counts. Synthetic payloads and empty staging databases lie in your favor, which is the wrong direction.

Only after step four do I open a profiler. Skipping ahead is how you end up "optimizing" something that was never on the hot path.

## The usual suspects

**N+1 queries.** The classic. It survives because each individual query looks cheap in the log and the total is invisible unless you count them.

```ts
// Bad: one query for the list, then one per row.
const orders = await db.order.findMany({ where: { status: 'open' } });
for (const order of orders) {
  order.customer = await db.customer.findUnique({
    where: { id: order.customerId },
  });
}

// Fixed: two queries, one per table.
const openOrders = await db.order.findMany({ where: { status: 'open' } });
const customerIds = [...new Set(openOrders.map((o) => o.customerId))];
const customers = await db.customer.findMany({
  where: { id: { in: customerIds } },
});
const byId = new Map(customers.map((c) => [c.id, c]));
for (const order of openOrders) {
  order.customer = byId.get(order.customerId);
}
```

The fix is not always a join. A batched lookup is often easier to cache and easier to reason about, and it keeps the query count constant as the page size grows.

**Connection pools.** A pool that is too small turns concurrency into a queue; a pool that is too large turns your database into a swapping contest. Watch pool wait time, not just pool size. And set a timeout, because a request waiting forever for a connection is indistinguishable from a hung service.

**Lock contention.** Long transactions holding row locks will make unrelated endpoints slow in a way that looks random. `pg_stat_activity` and wait events usually settle the argument in minutes. Migrations that rewrite a table are a recurring cause; they are also the easiest to schedule away from peak, which is why they keep happening at peak.

**Retry storms.** A timeout shorter than your p99 is a retry generator. Retries add load, load pushes p99 higher, more retries fire. Add jitter, cap attempts, and use a budget. If the downstream is already struggling, the kindest thing your client can do is give up earlier.

## A diagnostic checklist

Before changing anything, I want answers to these. If half are blank, the investigation is not done.

- [ ] Which exact route, tenant, and hour are slow?
- [ ] Which percentile moved, and when did it start?
- [ ] Is the timing server-side, and does it match the user report?
- [ ] Is CPU busy or idle during the slow window?
- [ ] Does p99 correlate with pool wait time, lock waits, or GC pauses?
- [ ] How many queries per request, and does that number grow with page size?
- [ ] What is the timeout, and how many retries does one failure produce?
- [ ] Can I reproduce it with a real payload and realistic row counts?

None of this requires a new observability vendor. It requires one afternoon, a dashboard you already have, and the discipline to segment before you speculate. If you want the front-end counterpart — the metric that measures how stable a page feels while it loads — that is a different distribution with the same lesson, which I wrote about in [CLS in Practice](/blog/cls-in-practice).

The last thing I do is write down what the slow request was, because in six months someone will report the same symptom and the fastest path is the note. That is also why I treat reproducible traces as a deliverable rather than a byproduct; [the build pipeline as a product](/blog/build-pipeline-as-product) is the same idea applied to CI. A slow API is rarely a mystery. It is usually one unexamined assumption, repeated a few thousand times an hour.

This essay belongs with the other notes on [performance](/tags/performance).

## Further reading

- [Google SRE Book — Handling Overload](https://sre.google/sre-book/handling-overload/)
- [Brendan Gregg — The USE Method](https://www.brendangregg.com/usemethod.html)

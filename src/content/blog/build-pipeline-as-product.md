---
title: "Your Build Pipeline Is a Product"
description: "If your pipeline has users, it deserves a product manager. Treat build time as a feature, flakiness as churn, and every red build as a support ticket."
pubDate: 2026-10-06
tags: ["devops", "engineering"]
featured: false
draft: false
---

Our CI took roughly twenty-two minutes from push to green. Nobody had decided that. It had grown one job at a time, the way a garage fills up. The day a reviewer asked whether a red build meant the code was broken or the runner was tired, I realized we were not running a pipeline. We were running a rumor with a status badge.

## Who the users are

A pipeline has three user groups, and they want different things.

Developers want a fast, trustworthy answer to "did I break it?" They pay for latency in context switches. Reviewers want a check they can believe before they spend time reading. On-call wants a build they can reproduce during an incident, when the first question is whether the last deploy actually matches the commit.

None of these users file tickets. That is why the pipeline ends up with a twenty-minute runtime and a rerun button nobody trusts.

## The two metrics that matter

If I can only track two numbers, they are time to feedback and false failure rate. Time to feedback is the gap between a push and the first useful signal — not necessarily full green, just the first thing that tells the author whether to keep working. False failure rate is the share of failures that were not caused by the change.

I track them as percentiles, not averages, for the same reason latency work uses percentiles: a pipeline that is fast for small changes and slow for the ones that touch the build config is slow where it hurts. The table below is the dashboard I would want on a wall.

| Metric | Definition | Target I have found workable | What it hides |
| --- | --- | --- | --- |
| Time to first signal | Push to first pass or fail | Under 5 minutes | Whether the signal is meaningful |
| Time to full green | Push to all required checks | Under 15 minutes | Queue time split across jobs |
| False failure rate | Failures not caused by the diff | Under 2% | Tests that fail for environmental reasons |
| Rerun rate | Jobs rerun without a new commit | Under 5% | Flakiness that happens to pass |
| Queue time | Waiting for a runner | Under 1 minute | Slow setup inside the job |

Those targets come from my experience, not a standard. The point is to pick numbers and watch them, not to defend the numbers.

## The cost of a twenty-minute pipeline

A twenty-minute pipeline is not twenty minutes of waiting. It is twenty minutes of waiting plus the cost of whatever the developer started while waiting. If the next task takes ten minutes, the developer has now context-switched twice and holds two problems in their head.

Roughly: on a team of eight that merges ten times a day, twenty minutes per run is more than three hours of collective waiting, before counting the second task everyone started. The arithmetic is illustrative, but the shape is real. A pipeline longer than the work you switch to trains people to multitask.

> A slow pipeline does not just cost time. It teaches the team to stop paying attention.

## Caching and parallelization

The cheapest wins are usually caching and ordering. Cache dependencies by lockfile hash. Cache build outputs by source hash. Run the fast checks first so a typo fails in ninety seconds instead of twenty minutes. Then parallelize the slowest stage, and shard tests by measured time rather than by file count.

Here is a generic workflow sketch. The details matter less than the order: install, cache, fail fast, then fan out.

```yaml
name: ci
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --shard=${{ matrix.shard }}/4
```

Two cautions. Cache keys are easy to get subtly wrong; a cache that never hits is just a slower pipeline with more YAML. And do not parallelize a pipeline that is failing for reasons nobody understands. Fix the signal before you multiply it.

## What to do about flaky tests

A flaky test fails for reasons unrelated to the code under test: time, ordering, shared state, a network call, a random seed. The rerun button is a painkiller. It makes the symptom go away without telling you anything about the disease.

My rule is quarantine, owner, deadline. Move the test out of the required set immediately, link the failure, assign one person, and set a date. If it is not fixed in a week, delete it or skip it with a ticket. A skipped test is honest. A flaky test that passes on the second try is a lie the team has agreed to believe.

- [ ] Can I reproduce it locally with the same seed and environment?
- [ ] Does it depend on time, order, or shared state?
- [ ] Is it making a real network call?
- [ ] Who owns it, and when will they look?
- [ ] Is it quarantined, or is it still blocking other people?
- [ ] If we deleted it, what coverage would we actually lose?

## A pipeline upgrade sequence

The order matters. Doing these out of order produces a faster pipeline that nobody trusts.

1. Measure time to first signal and false failure rate for two weeks.
2. Move lint and typecheck to the first job and fail fast.
3. Cache dependencies and build outputs; verify the keys actually hit.
4. Parallelize or shard the slowest stage, measured rather than guessed.
5. Quarantine flaky tests, assign owners, and set deadlines.
6. Add a merge queue only after the pipeline is fast enough to deserve one.
7. Put the dashboard where developers already look, not in a wiki.

A pipeline is a product because it has users, a failure mode, and a budget. Build time is a feature; flakiness is churn. The best compliment a pipeline can get is that nobody talks about it. The same is true of a monolith you have finished [rewriting](/blog/rewriting-the-monolith): the goal is not to make it interesting, it is to make it boring enough that the team can forget it and go build the product. The pages it ships deserve the same treatment — [a layout that never shifts](/blog/cls-in-practice) is one the reader never has to think about either. And when the pipeline does get slow, measure it the way you would measure an API — by percentile and population, as I described in [A Field Guide to Slow APIs](/blog/slow-apis).

This essay belongs with the other notes on [performance](/tags/performance).

## Further reading

- [DORA — DevOps Research and Assessment](https://dora.dev/)
- [GitHub Docs — Actions](https://docs.github.com/en/actions)

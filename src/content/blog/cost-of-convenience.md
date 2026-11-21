---
title: "The Hidden Cost of Convenience"
description: "Convenience is a loan. The interest stays invisible until the abstraction you did not understand needs to change — and you own a dependency you never chose."
pubDate: 2026-08-18
tags: ["career", "architecture"]
featured: false
draft: false
---

I added a library to format relative timestamps. It saved me eleven lines of code and brought a plugin system, a locale registry, and a dependency tree I never looked at. Six months later a daylight-saving bug in that tree broke every "edited 3 minutes ago" label on the site. I fixed it in an afternoon. The library was fine. I had just not noticed I was paying twice.

## The convenience debt ledger

Convenience is a loan. The purchase price is visible in the pull request; the interest is paid later, by whoever has to change the behavior. I keep a mental ledger with three columns: what I saved, what I borrowed, and when the bill comes due.

| Convenience | What it saves now | What it costs later | Who pays |
| --- | --- | --- | --- |
| A UI component library | Weeks of styling and accessibility work | A theming system you do not control, plus an upgrade cliff | Whoever touches design next |
| An ORM with migrations | Handwritten SQL for CRUD | Query behavior you cannot see and a migration tool with opinions | Whoever debugs the slow endpoint |
| A state management library | Prop drilling today | A second place where truth lives | Whoever debugs the impossible render |
| A hosted queue | Retry logic this sprint | A failure mode behind someone else's status page | Whoever is on call |
| A date/time library | Eleven lines | Locale, timezone, and DST edge cases in code you do not read | Whoever ships near a holiday |

The ledger is not an argument against any of these. It is an argument for writing the second column down before the first column becomes a habit.

> A cost you have named is a decision. A cost you have not named is a surprise with a calendar entry.

## Saving typing versus saving thinking

Some dependencies save typing. Some save thinking. The distinction matters more than the license.

A date formatter saves typing. You know what the output should be, you could write it, and the package removes keystrokes. A state management library saves thinking. It gives you a model for where truth lives and how changes propagate. The first kind of convenience is cheap to reverse. The second kind becomes architecture, whether or not you called it that.

I am suspicious of tools that save thinking in small doses. If the problem is small, the mental model is overhead. If the problem is large, the model is the product, and you should choose it deliberately. The dangerous case is the small problem that will grow.

## The dependency I still regret

I once added a rich text editor to an internal tool because the alternative was a textarea. The editor gave us bold, links, and paste-from-Word in an afternoon. It also gave us a document model, a plugin API, a serialization format, and a browser compatibility matrix.

The regret was not the initial cost. It was the second feature. We needed comments inside the document, and the editor's model did not represent them the way we needed. So we built a parallel model beside it and synchronized the two. We had adopted a product and then built a second product to translate between it and ours.

The question I should have asked is not "does this library do what I need today" but "what will I need to change first, and does this library let me change it?" A library that solves the current feature and blocks the next one is not convenience. It is a down payment on a rewrite.

## The "one more library" habit

The "one more library" habit is rarely one decision. It is a series of small ones, each defensible, that add up to a stack nobody chose. I have watched a project acquire a date library, a validation library, a fetch wrapper, a form library, and two utility collections, each to avoid writing something the team already knew how to write.

The cost is not bundle size, although that is real. The cost is the surface area of behavior you did not author. Every dependency is a set of decisions someone else made, and some of those decisions will be wrong for you at the worst possible moment. I removed a convenience wrapper from this site's build and wrote the twenty lines it replaced, and the build got easier to reason about. That is [the case for boring architecture](/blog/boring-architecture) applied at the package level.

There is a useful test. If the library disappeared tomorrow, could one person on the team reimplement the part you use in a day? If yes, it is a convenience. If no, it is infrastructure, and it deserves the scrutiny you give infrastructure.

## A decision checklist

I run this before adding a package. It is not a ban; it is a pause.

- [ ] What exactly am I avoiding writing, and how many lines is it?
- [ ] Is this saving typing or saving thinking?
- [ ] What is the exit cost if the library is abandoned or changes direction?
- [ ] How many transitive dependencies does it bring, and can I name them?
- [ ] Does it solve the next feature too, or only this one?
- [ ] Would I still choose it if it were twice the size and half as maintained?
- [ ] Who on the team can debug it without reading the source?

```ts
// The utility package, replaced.
function relativeTime(date: Date, now = new Date()): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return date.toISOString().slice(0, 10);
}
```

The type checker keeps this honest without a runtime schema, which is its own convenience. [TypeScript narrowing](/blog/typescript-narrowing) gets you most of the safety people buy a validation package for, as long as the data is already typed at the boundary.

## The balanced rule

I am not anti-library. I use them, I recommend them, and I have been grateful for a good one on a deadline. The rule I have settled on is this: spend convenience on the parts of the system that are not your product, and pay for it in the parts that are.

A date formatter is not your product. A rich text editor might be. A build tool is not your product; the build time is. When a dependency touches the thing users came for, own the behavior. When it touches the plumbing, rent.

And write down the rent. A sentence in the pull request — "this saves us two days now; we will revisit if we need comments in the editor" — turns an invisible loan into a decision. The interest is still there. At least you know when it is due. The same ledger tells you when a dependency has stopped paying: the question stops being whether to remove it and becomes how small a piece you can replace at a time, which is the case I make in [What I Learned Rewriting a Monolith](/blog/rewriting-the-monolith).

This essay belongs with the other notes on [architecture](/tags/architecture).

## Further reading

- [Joel Spolsky — The Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)
- [Hyrum's Law](https://www.hyrumslaw.com/)

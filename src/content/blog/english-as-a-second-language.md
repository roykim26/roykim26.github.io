---
title: "Writing English as a Second-Language Engineer"
description: "The grammar is the easy part. The hard part is writing with authority when every sentence sounds borrowed, and learning to stop translating your first language."
pubDate: 2026-10-27
tags: ["career", "writing"]
featured: false
draft: false
---

The first design document I wrote in English was grammatically correct and completely without authority. I had translated the structure of a Chinese memo, kept every polite hedge, and produced three pages that ended by asking whether the direction might be acceptable. The feedback was that the document was clear but sounded like it was asking permission. I was. That was the problem.

## The authority problem

Non-native speakers often write with stacked hedges because politeness is encoded differently in their first language. English technical writing rewards a claim and its evidence. If you learned English in a context where directness was rude, the result is a sentence like "I think we might possibly consider whether..." That is not polite. It is unclear.

Authority is not volume. It is stating what you know, stating what you do not, and not making the reader do the work of deciding which is which. A recommendation with a reason reads as more credible than a paragraph of qualifications.

## Translation versus thinking in English

There are two modes, and they produce different prose. In the first, I compose the argument in my first language and translate it sentence by sentence. The grammar is usually fine. The rhythm is borrowed, and the sentences are longer than English wants them to be. In the second, I outline in whatever language is fastest, then write the sentences directly in English.

The second mode is slower at first because my vocabulary is smaller. It is faster overall because I stop translating. The test I use is simple: read the sentence out loud. If I would not say it to a colleague, I rewrite it. This catches more problems than a grammar checker, which is a low bar.

## Sentence-level habits

Most of the improvement is mechanical. These are the habits that moved my writing furthest.

- Short sentences. One idea each. If a sentence has two "and"s, it is probably two sentences.
- Strong verbs. "Decide," not "make a decision." "Use," not "utilize." "Build," not "perform the construction of."
- Cut hedges. One "I think" is a position; three is a fog. Keep the one that means something.
- Subject, verb, object. Long noun phrases are where meaning goes to hide.
- Active voice unless the actor is unknown or irrelevant.
- Delete throat-clearing. "It is important to note that" can almost always become nothing.

| Instead of | Problem | Write |
| --- | --- | --- |
| utilize | Latinate inflation | use |
| in order to | extra words | to |
| It is important to note that | throat-clearing | (delete) |
| We might want to consider | stacked hedge | We should consider |
| leverage | jargon | use |
| as per my previous message | passive-aggressive | following up on |
| I am not sure but maybe | authority leak | I recommend, or I do not know yet |

### Idiom traps

Idioms are where a second-language writer becomes visibly borrowed. "Move the needle," "low-hanging fruit," and "cut corners" are fine in speech and often slightly wrong in a design document. If I am not certain of the register, I use the literal phrase. "Reduce the number of steps" beats "move the needle" when the reader needs to know what to do.

Phrasal verbs are a smaller trap. "Spin up" and "roll out" are natural in engineering English. "Spin down" is less universal than it feels. When in doubt, use the concrete verb: start, deploy, stop.

Articles are the thing I still get wrong. I fix them by reading a lot and by asking someone to edit me. A good editor is worth more than a grammar book for this.

### Sounding like yourself

Do not adopt a persona. The goal is not to sound native; the goal is to sound like a specific engineer. Keep the words you actually use. If you say "this is a mess" in speech, write "this is a mess" instead of "this situation presents certain challenges."

Your accent in writing is your rhythm and your examples. Use stories from your own work. Nobody else has your incidents, your migration, or your outage. That is the part readers remember, and it is the part no style guide can teach.

> You do not need to sound native. You need to sound like you, in a language the reader can follow.

## Before and after

Here is a paragraph I would have written five years ago, followed by the version I would send now.

```text
Before:
It is important to note that there are several considerations which
might possibly affect our decision regarding whether we should
migrate the service to the new platform, and it seems that we may
need to take into account the performance implications, although
this is not entirely clear at this stage.

After:
We should migrate the service. The new platform removes two manual
deployment steps, and the performance cost is within our budget.
The open question is the database migration, which we have not
tested at production size.
```

The second version is shorter, but the real change is that it makes a claim. The first version asks the reader to assemble one. That is the authority problem in miniature.

## An editing pass checklist

- [ ] Read it out loud and mark every sentence I would not say.
- [ ] Delete the first sentence of each paragraph and see if it still works.
- [ ] Search for "I think," "maybe," "perhaps," and "just"; cut two of three.
- [ ] Replace nominalizations with verbs.
- [ ] Check that every "this" and "it" has a clear referent.
- [ ] Read the opening as the second reader, not the author.
- [ ] Ask a colleague to summarize the decision in one sentence.
- [ ] Keep one sentence that sounds like me, even if it is imperfect.

## Why publishing in English is worth it

The audience is larger, the feedback is more useful, and the act of writing in a second language forces clarity. You cannot hide behind fluency. You have to say the thing.

It is also a career skill. Most code review and incident write-ups I have seen happen in English, even when the office language is something else. Writing it well is part of the job.

The first drafts will be bad. They are bad for native speakers too. The difference is that native speakers often do not notice, which is not the same as being good.

I still write more slowly in English than in my first language. I also write more clearly, because every sentence has to earn its place. The hard part was deciding what I meant, and then being willing to say it without three hedges and an apology. If you want the reader's side of that contract, [Designing for the Second Reader](/blog/the-second-reader) is the essay I would read next. If you want a way to make the editing time actually exist in your week, that is what [A Small System for Deep Work](/blog/deep-work-system) is about.

## Further reading

- [Google — Technical Writing courses](https://developers.google.com/tech-writing)
- [Plain Language Guidelines](https://www.plainlanguage.gov/guidelines/)

---
title: "Designing for the Second Reader"
description: "You are not writing for the person who asked. You are writing for whoever inherits the question six months later — with no context, no thread, and a deadline."
pubDate: 2026-07-01
tags: ["writing", "engineering"]
featured: false
draft: false
---

The person who needs your design document is not in the room. They have not read the thread, they do not know why option B was rejected, and they are on a deadline that started before they found your file. If the document only makes sense to the people who were there when it was written, it is not documentation. It is a souvenir.

## The second-reader test

I have a crude test for any design note or decision record. Imagine handing it to a competent engineer who joined after the decision, knows the codebase, and has twenty minutes. Can they answer four questions without asking anyone?

- What problem were we solving?
- What did we choose, and what did we reject?
- What does this choice cost us?
- What would make us change our minds?

If the answer to any of those is "it's in the thread," the document has failed. The thread will be buried under six months of notifications, and the person who wrote it may have left.

This is the same reason I care about the second reader in prose generally. The first reader asked a question and is emotionally invested in the answer. The second reader inherited the question and owes it nothing. You get their attention once, in the first paragraph.

There is a practical version of this test I use with new documents: ask a teammate who did not attend the discussions to summarize the decision in two sentences. If they have to scroll, the document is organized for the author, not the reader.

> The first reader asks a question. The second reader has to live with the answer.

## Why ages better than how

Most technical documents are written as instructions: here is how the system works, here is how to change it. That format decays quickly. Files get renamed, functions move, diagrams drift by one release, and the "how" section quietly becomes wrong. Nobody updates it because nobody knows it is wrong.

The "why" ages differently. Constraints outlive implementations. "We cannot use long-running background jobs because the platform kills a request at sixty seconds" stays true until it doesn't, and when it stops being true, that sentence tells you exactly what to revisit. A decision record is less a tutorial and more a set of assumptions with dates attached.

Writing down rejected options sounds like bureaucratic throat-clearing. It is the opposite. The most expensive meeting in software is the one where a new person proposes the thing you evaluated and discarded two years ago, and nobody can remember why. A short list of "we considered X and rejected it because Y" prevents that meeting. It also protects you from yourself: if you cannot articulate why the obvious option is wrong, maybe it is not wrong.

## What belongs in a decision record

Context, options, decision, consequences. That is the whole format. Everything else is decoration.

The consequences section is the one people skip, and it is the one the second reader needs most. A decision record with no downsides is a press release. Every real choice has a cost: an operational burden, a migration you still owe, a feature you will not build, a dependency you now maintain. Write it down while you remember it.

Here is the template I use. It fits on one screen, which is the point.

```md
# Decision: <one sentence, present tense>

- Date:
- Status: accepted | superseded by <link>
- Owner:
- Review date:

## Context
What is true right now that forces a choice. Constraints, numbers,
links to the ticket. No history lesson.

## Options considered
1. <option> — why not.
2. <option> — why not.
3. Do nothing — what that costs.

## Decision
What we chose, and the reason in one sentence.

## Consequences
What gets better. What gets worse. What we still owe.
What would make us reopen this.
```

Two fields do most of the work. "Status" means an old record can point at its replacement instead of becoming a lie. "What would make us reopen this" turns the document into a trigger for future work rather than a snapshot.

## Openings that waste the first minute

Weak openings describe the document. Strong openings describe the problem and the decision.

Bad: "This document describes the authentication refactor and its various components."

Bad: "As discussed in the meeting on Tuesday, we have been considering several approaches to session handling over the past few weeks."

Both make the reader wait for the point. The second reader does not care what you discussed. They care what is true now.

Good: "Sessions currently expire after fifteen minutes, and mobile clients re-authenticate silently every ten. We are moving to 24-hour refresh tokens because the current behavior causes roughly one support ticket per hundred daily users. This note records the tradeoffs."

Three sentences: current state, decision, reason. A reader who stops there still knows what happened. That is the standard. Every additional paragraph should be optional for someone who only needs the decision.

This matters even more when the document will be read by people outside your native dialect. Clarity is not a native-speaker virtue; plain sentences are a courtesy to every reader, including the one who inherited your file. I made a longer version of that argument in [English as a Second Language](/blog/english-as-a-second-language).

## A checklist before you publish

I run this before sending a design note to anyone who was not in the original conversation.

- [ ] The first paragraph states the problem and the decision, not the document's purpose.
- [ ] The date, status, and owner are at the top.
- [ ] Rejected options are listed with a reason each.
- [ ] Consequences include at least one cost, not just benefits.
- [ ] There is an explicit condition for revisiting the decision.
- [ ] Internal names and acronyms are defined on first use.
- [ ] Links point to durable artifacts, not a chat thread.
- [ ] Someone outside the project has read it and could explain it back.

One more habit: write the decision record when you make the decision, not after the project ships. The version written afterward is shaped by the outcome, and the second reader can tell. The version written before is honest about uncertainty, which is the most useful thing you can hand them.

The person who inherits this will probably never meet you. They will open the file at a bad moment, looking for one answer, and they will either find it in the first minute or spend an hour reconstructing your context from fragments. Writing for them is not extra work on top of engineering. It is the part of engineering that survives the sprint. It is also, not coincidentally, why the most durable systems tend to be the ones with the most boring decisions written down in plain language — the argument I made in [The Case for Boring Architecture](/blog/boring-architecture).

## Further reading

- [Google — Technical Writing: Audience](https://developers.google.com/tech-writing/one/audience)
- [Diátaxis — A systematic framework for technical documentation](https://diataxis.fr/)

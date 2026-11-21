---
title: "Cumulative Layout Shift, in Practice"
description: "Layout shift is rarely a CSS bug. It is a missing decision about who reserves space, made late in the rendering pipeline."
pubDate: 2026-09-02
tags: ["performance", "engineering"]
featured: false
draft: false
---

The layout shift that finally made me care was a consent banner. The article had started rendering, the first paragraph was on screen, and then the banner loaded and pushed everything down by the height of a small paragraph. Readers who had started reading lost their place. The fix took two lines. Finding it took a week of not believing the score.

## What CLS actually measures

CLS is a score, not a stopwatch. It measures how much visible content moves, and how far, when the user did not ask for the movement. A late image without dimensions counts. A font swap that changes line height counts. A user opening a panel does not. The score is roughly the affected area multiplied by the distance moved, accumulated across the page's life, with a windowing rule that keeps one bad moment from dominating forever.

The practical version: if content moves after it has been painted, and the user did not cause it, CLS is watching. Under 0.1 is the usual "good" threshold; in my experience, anything above 0.2 is usually one missing dimension and one late banner. The number matters less than the location. A shift above the fold is a different problem from a shift in a footer nobody has reached.

> The score is a symptom. The node that moved is the bug.

## The usual suspects

Most shifts come from a short list. I check these before I open a profiler.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Article jumps when the font loads | Fallback metrics differ from the web font | Match metrics with `size-adjust`, or choose a closer fallback |
| Image pushes text down | No intrinsic size | `width` and `height` attributes or `aspect-ratio` |
| Banner appears late | Injected DOM above content | Reserve a slot or overlay it |
| Comments jump in | Async content with no placeholder | `min-height` on the container |
| Header grows on scroll | Sticky element changes layout | Animate `transform`, not `height` |

Two of these are decisions about space. The rest are decisions about when content arrives. Both are made before the browser paints, which is why the fix is rarely a CSS tweak at the end.

## Reproducing it with throttling

Local dev is a bad place to look. Assets are warm, the network is fast, and the banner might not load at all. I test the production build with the cache disabled, CPU throttled roughly four times, and the network set to Slow 4G. Then I record a performance trace and read the Layout Shifts track, not just the final score.

A console snippet is faster when I want to know what moved:

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.hadRecentInput) continue;
    const nodes = entry.sources?.map((source) => source.node) ?? [];
    console.log(entry.value.toFixed(4), nodes);
  }
}).observe({ type: 'layout-shift', buffered: true });
```

The output names the nodes. That is usually enough to stop the argument about whether the page "feels" jumpy.

## Fixes that actually hold

The reliable fix is to give the browser the size before the content arrives. For images, that means dimensions or an aspect ratio.

Before:

```html
<img src="/images/cover.jpg" alt="A desk with a notebook">
```

After:

```html
<img src="/images/cover.jpg" alt="A desk with a notebook"
     width="1200" height="630">
```

The attributes let the browser reserve the right box and keep the text where it is. CSS can do the same for containers:

```css
.cover {
  aspect-ratio: 1200 / 630;
  width: 100%;
  height: auto;
}
```

For fonts, the shift comes from the fallback being narrower or taller than the webfont. `font-display: swap` makes the text visible, but it also makes the swap visible. A fallback face with adjusted metrics reduces the jump:

```css
@font-face {
  font-family: "Source Serif Fallback";
  src: local("Georgia");
  size-adjust: 105%;
  ascent-override: 92%;
  descent-override: 23%;
}
```

Those numbers are specific to the font pair. Measure them; do not copy them. And do not patch the layout with JavaScript after load. That does not remove the shift; it moves it a few hundred milliseconds later, where it is harder to attribute.

## CLS as an editorial requirement

This site treats CLS as an editorial requirement. A post does not merge if an embed shifts the column at 360 pixels. That is a policy, not a performance budget: the reader came for the text, and moving the text is a way of losing their place. It is the same courtesy I argued for in [Designing for the Second Reader](/blog/the-second-reader). The measurement discipline is the same one I use for latency in [A Field Guide to Slow APIs](/blog/slow-apis): segment by page, device, and network before believing the average. We enforce the rule in CI rather than in review, because a policy that lives in a checklist gets skipped on a Friday; [the build pipeline is where a rule actually holds](/blog/build-pipeline-as-product).

## A testing checklist

- [ ] Test the production build, not the dev server.
- [ ] Disable the cache and throttle the network to Slow 4G.
- [ ] Throttle the CPU; shifts are worse when layout is slow.
- [ ] Reload at 360 px and at desktop width.
- [ ] Read the trace's Layout Shifts track, not only the final score.
- [ ] Block the font request and see how much moves.
- [ ] Scroll the whole page; shifts below the fold still count while visible.
- [ ] Check every injected element: consent, promo, related posts.
- [ ] Re-run after the image CDN changes sizes.

## What I check after a fix

A lower score is not the same as a fixed page. After shipping a layout change, I reload three times with the cache disabled and watch the trace instead of the number. If the shift is gone on the first load but returns on the third, the cause is usually a cached font or a lazy component arriving in a different order.

I also check the page at 200% zoom. Fixed heights that look generous at default size start clipping once the text grows, and a clipped heading is a worse outcome than the shift it was meant to prevent. The goal is space that adapts to its content, not space that is guessed once and never revisited.

Layout shift is rarely a CSS bug. It is a missing decision about who reserves space, made late in the rendering pipeline. The browser is not being difficult. It is telling you that you forgot to make the decision, and it is telling you in the only language it has.

This essay belongs with the other notes on [performance](/tags/performance).

## Further reading

- [web.dev — Cumulative Layout Shift](https://web.dev/articles/cls)
- [MDN — LayoutShift](https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift)

# 页面设计

> **已被取代（2026-11-21，v1.0 历史稿）**：本文件描述的是 v1 页面结构，与现行实现不一致。现行唯一事实来源是 [design-v2-direction.md](design-v2-direction.md)（v2.3）。
> 现行 8 个页面：`/`、`/blog`、`/blog/[slug]`、`/tags`、`/tags/[tag]`、`/about`、`/newsletter`、`/404`。
> 主要变化：首页为名字 + 简介 + 最近 8 篇 + 通栏订阅色带；文章页单栏 64ch 居中，去目录/分享/作者卡/相关阅读；归档按年份分组、去筛选与搜索；页头 56px 静态、页脚单行。

> 阶段 3 · v1.0 · 桌面参考尺寸 1280×800，移动参考尺寸 390×844。
> Token 与组件规则见 `design-system.md`。可交互样式表见 `design-preview.html`。

## 1. 首页 `/`

```
┌──────────────────────────────────────────────────────────────────┐
│ Waystone AI.   WRITING   TAGS   ABOUT          [☾]              │ 64px sticky
├──────────────────────────────────────────────────────────────────┤
│ ENGINEERING NOTES · EST. 2026                                    │
│                                                                  │
│  Field notes on software            ┌──────────────────────────┐ │
│  that survives contact              │   "The best systems are  │ │
│  with reality.                      │    the ones you forget   │ │
│                                     │    you own."             │ │
│  I build and maintain               │                          │ │
│  systems for a living…              │   — from the archive     │ │
│                                     └──────────────────────────┘ │
│  [ Read the latest → ]  [ About ]                                │
├──────────────────────────────────────────────────────────────────┤
│ FEATURED ESSAY                                                   │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ The Case for Boring Architecture                             │ │
│ │ Everyone wants the interesting choice. The interesting       │ │
│ │ choice is usually the one you pay for at 3 a.m.              │ │
│ │ 02 JUN 2026  ·  6 MIN READ  ·  ARCHITECTURE                  │ │
│ └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ LATEST WRITING                                    ALL ESSAYS →   │
│ 01 ───────────────────────────────────────────────────────────── │
│     Writing English as a Second-Language Engineer                │
│     The grammar is the easy part…              11 MIN  CAREER    │
│ 02 ───────────────────────────────────────────────────────────── │
│     Your Build Pipeline Is a Product                             │
│     If your pipeline has users…                 8 MIN  DEVOPS    │
│ 03 ───────────────────────────────────────────────────────────── │
│     A Small System for Deep Work                                 │
│     Attention is a budget…                      7 MIN  CAREER    │
├──────────────────────────────────────────────────────────────────┤
│ TOPICS                                                           │
│   ARCHITECTURE (3)   PERFORMANCE (2)   CAREER (3)                │
│   ENGINEERING (1)    DEVOPS (1)        WRITING (2)               │
├──────────────────────────────────────────────────────────────────┤
│ SUBSCRIBE                                                        │
│  New essays every other Tuesday. No noise, no tracking.          │
│  [ you@example.com            ] [ Subscribe ]                    │
│  Prefer a feed? RSS →                                            │
├──────────────────────────────────────────────────────────────────┤
│ Waystone AI.     WRITING TAGS ABOUT RSS      © 2026  COLOPHON    │
└──────────────────────────────────────────────────────────────────┘
```
首屏高度：在 1280×800 下，eyebrow + H1 + 段落 + CTA 合计约 520px，因此
精选区块的标签刚好露出一角——足以暗示下方还有内容，又不必靠劫持滚动来做英雄区。

## 2. 文章索引 `/blog`

```
Waystone AI.   WRITING   TAGS   ABOUT          [⌕] [☾]
────────────────────────────────────────────────────────
Writing                                     12 essays
Field notes, mostly about systems that age badly.

[ All ] [ Architecture ] [ Engineering ] [ Performance ] …
[ Search essays…                              ]

2026 ────────────────────────────────────────────────────
 27 OCT   Writing English as a Second-Language Engineer
          The grammar is the easy part. The hard part is…
          11 min · career
 06 OCT   Your Build Pipeline Is a Product
          …
2026 ── (year repeats only when changed)
```
- 年份是一个近似吸顶的等宽标签，后面跟一条横贯剩余宽度的发丝线。
- 行本身是整行宽度的链接；悬停时右缘露出一个 `↗`（仅桌面端）。
- 搜索：输入框外观像一个按钮字段；点击后展开 Pagefind 弹窗。
- 筛选会在原地隐藏行并更新计数；当结果为零时，显示：
  "Nothing matches “xyz”. [Clear filters]"。

## 3. 文章页 `/blog/<slug>`

```
Waystone AI.   WRITING   TAGS   ABOUT          [⌕] [☾]
──────────── 2px accent progress ──────────────────────
                                  ARCHITECTURE · 02 JUN 2026 · 6 MIN READ
                                  The Case for Boring
                                  Architecture
                                  Everyone wants the interesting choice. The
                                  interesting choice is usually the one you pay
                                  for at 3 a.m.
                             BY WAYSTONE AI · UPDATED 20 JUN 2026
CONTENTS                ─────────────────────────────────────────
  The upgrade tax       The upgrade tax
  Three questions       ─────────────────────────────────────────
  What boring buys      Every system is a bet on which problems you will
  A short checklist     still have in two years…
  Closing note          …body, code, quotes, tables…
                        ┌───────────────────────────────────────┐
                        │ 1  // boring on purpose, not by      │
                        │ 2  const queue = new FIFOQueue();     │
                        └───────────────────────────────────────┘
                        [ Share on X ] [ LinkedIn ] [ Copy link ]
                        ┌───────────────────────────────────────┐
                        │ WAYSTONE AI  Engineer, writer. Builds… │
                        └───────────────────────────────────────┘
                        ← Previous                    Next →
                        RELATED
                        A Field Guide to Slow APIs
```
- TOC 侧栏从页头下方开始，在 `top: 96px` 处吸附；1200px 以下隐藏，改由导语下方的
  `<details>` 块承担。
- 分享 URL：`https://x.com/intent/tweet?text=…&url=…`、LinkedIn 分享、剪贴板。
- 相关文章为 3 行带描述的条目（不是卡片网格）。

## 4. 标签页 `/tags` 与 `/tags/<tag>`

`/tags`：按字母排序的等宽列表，带计数，每行是一个整行宽度的链接，行间以
发丝线分隔；计数右对齐。

`/tags/<tag>`：页面 H1 = 标签名，一句说明该标签意图的描述，计数，然后是
与 `/blog` 相同的文章行组件。标题上方有一条 “All tags ←” 的等宽链接。

## 5. 关于 `/about`

≥900px 时两栏：左侧栏吸顶，含字母组合图版、姓名、角色、社交链接；
右栏为 68ch 正文：
1. 我做什么（三段简短的第一人称文字）
2. 这个站点是什么 / 不是什么
3. 我写哪些主题（列表，链接到标签页）
4. 别处（GitHub、X、邮箱）
5. Colophon：“Set in Instrument Serif and Newsreader. Built with Astro. No trackers.”

## 6. 订阅通讯 `/newsletter`

居中的 640px 单栏：eyebrow、H1 “A letter every other Tuesday”、价值说明段落、
要点列表（你会得到什么、频率、隐私）、表单、RSS 备选、“No spam, unsubscribe in
one click.”。当未配置服务商时，表单替换为一个 mailto 链接，并附一句简短说明。

## 7. 404

Instrument Serif 的大号 “404”，配一行斜体 “lost in the margins.”、解释文字，
以及链接：Read the writing / Browse tags / Go home。若 JS 可用，再提供搜索入口。

## 8. 响应式行为

| 元素 | ≥1200 | 900–1199 | 640–899 | <640 |
| --- | --- | --- | --- | --- |
| 页头导航 | 完整链接 | 完整链接 | 完整链接 | 折叠菜单 |
| 文章 TOC | 吸顶侧栏 | `<details>` 块 | `<details>` 块 | `<details>` 块 |
| 首页英雄区 | 2 栏 | 2 栏 | 1 栏 | 1 栏 |
| 精选卡 | 7/5 分栏 | 7/5 分栏 | 上下堆叠 | 上下堆叠 |
| 文章行 | 日期/标题/元信息 | 相同 | 相同 | 日期置于标题上方 |
| 页脚 | 3 栏 | 3 栏 | 2 栏 | 堆叠 |
| 搜索 | 弹窗 | 弹窗 | 弹窗 | 全屏面板 |

## 9. 交互状态

| 元素 | 默认 | 悬停 | 激活/聚焦 | 禁用 |
| --- | --- | --- | --- | --- |
| 导航链接 | `--ink-soft` | `--ink` | 强调色下划线 | — |
| 文章行 | 发丝线边框 | 标题转强调色、箭头滑入 | 2px 内嵌聚焦环 | — |
| 主要按钮 | 墨色背景 | 强调色背景 | 聚焦环、位移 1px | 50% 不透明度、禁用指针 |
| 标签胶囊 | `--rule` 边框 | 强调色边框 + 底色 | 聚焦环 | — |
| 输入框 | 下边框线 | 线条转为 `--ink` | 外层容器 2px 聚焦环 | 40% 不透明度 |
| 主题切换 | 图标淡色 | 图标转墨色 | 聚焦环 | — |

## 10. 需要设计覆盖的内容边界

- 390px 下的 90 字符标题：必须换行到 ≤3 行且没有孤字；展示字号通过 clamp
  逐级收缩。
- 含 12 个 h2 的文章：TOC 独立滚动（`max-height: calc(100vh - 128px)`）。
- 20 字符长的标签名：胶囊会换行，绝不溢出所在行。
- 120 字符的代码行：在深色块内横向滚动，页面本身永不横向滚动。
- 零篇文章匹配：显示空状态，布局不破。

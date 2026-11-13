# 移动端长文阅读专项（390px）

> 阶段 3 · 2026-11-13 · 对应 [design-system.md](design-system.md) v1.3
> 主线页面：文章详情 `/blog/typescript-narrowing`（3 个代码块、1 个 3 列表格、1 处引用、6 个二级标题）
> 抽样页面：另外 9 篇文章（其中 4 篇带 4–5 列表格），首页 / 列表 / About / Newsletter
> 方法：Chrome headless + DevTools Protocol，`Emulation.setDeviceMetricsOverride(390×844, DPR 1)`
> 读取 computed style、`scrollWidth` 与真实截图；取数前注入 `*{transition:none}` 并等待字体加载。

## 1. 结论

390px 下没有横向溢出，问题集中在"长内容怎么放进窄屏"：

- **代码块会把一行折成两行，并且丢掉缩进**。Shiki 输出的内联样式是 `white-space: pre-wrap`，
  窄屏下一行 TypeScript 被拆到第二行后从第 0 列开始，`${JSON.stringify(value)}`、`** 2`、`height` 都被切断。
  这是本次最影响阅读的问题。
- **4 个宽表格已经在横向滚动，但没有任何提示**。5 列的 `rewriting-the-monolith` 表格
  内容宽 450px、可视 358px，第 5 列（Exit condition）完全不可见，读的人会以为表格只有 4 列。
- **长文里的可点目标偏小**：分享按钮 32px、折叠目录条 42.7px、目录条目 19.6px、作者卡链接 14px，
  都低于 [design-system §8](design-system.md) 写的 44px。
- 正文本身（18px / 31.5px 行高 / 47 字符一行）与标题节奏没有需要改的地方。

问题已全部修掉，复测 14 个页面 390px 下 `documentElement.scrollWidth` 全部等于 390。

## 2. 逐项核查

| 检查项 | 实测（390px） | 判断 | 处理 |
| --- | --- | --- | --- |
| 正文字号与行长 | 宽 358px，18px / 31.5px 行高，一行约 47 字符 | 合格。窄屏正文的经验区间是 35–50 字符，18px 是可读下限之上 | 不改 |
| 段落与标题节奏 | 段间距 20.7px；`h2` 上方 61.6px（约 3 倍于段距）；代码块上下 25.2px、表格 27px、引用 36px | 标题节奏合格；块级元素偏挤，而且三者互不一致 | 代码块与表格统一到 32px |
| 代码块 | 内容宽 561 / 628 / 611px，可视 358px；`white-space` 为 `pre-wrap` | 不合格。折行后缩进丢失，运算表达式被拆断 | 改为不换行 + 横向滚动 + 右缘渐隐 |
| 宽表格 | 4 个表格溢出：450 > 358（5 列）、385、382、365；`overflow-x: auto` 但没有提示 | 不合格。隐藏的列没有任何线索 | 补右缘内阴影提示 |
| 图片宽度 | 现有 10 篇文章没有正文图片；`.prose img` 为 `width:100%` + `max-width:100%`，`figure`/`figcaption` 走 32px 节奏 | 结构上不会溢出，但没有真实内容可测 | 记录为未覆盖 |
| 引用块 | 3px 强调竖线 + 24px 左内边距，20px 斜体，宽 358px 不溢出 | 合格 | 不改 |
| 脚注 | 10 篇文章均未使用脚注语法，站内也没有脚注样式 | 当前没有问题可修 | 记为后续项：启用脚注时需补样式 |
| 阅读进度 | 2px 固定在顶部，压在吸顶页头之上，不占布局；宽度按 `article` 计算 | 合格，不干扰阅读 | 不改 |
| 返回顶部 | 不存在；页头吸顶，随时可展开菜单回到导航 | 不是缺陷 | 不加（见 §5） |
| 点按目标 | 分享 32px、目录条 42.7px、目录条目 19.6px、作者链接 14px | 低于 44px | 补到 44px |
| 分享行折行 | 标签 + 4 个按钮约 400px > 358px，RSS 被挤到第二行单独一个按钮 | 视觉凌乱 | 标签独占一行后 4 个按钮单行排下（337px） |

## 3. 改动

全部是最小改动，没有动颜色 token 与字号阶梯。

| 位置 | 改动 |
| --- | --- |
| [global.css:1635](../../src/styles/global.css#L1635) `.prose pre` | `margin: 1.8em 0` → `32px 0`（按 14px 字号折算只有 25.2px，比段落还紧）；加 `overscroll-behavior-x: contain` |
| [global.css:1651](../../src/styles/global.css#L1651) `.prose pre code` | 加 `white-space: pre`，覆盖 Shiki 内联的 `pre-wrap` |
| [global.css:1673](../../src/styles/global.css#L1673) `.prose table` | `margin: 1.8em 0` → `32px 0`（原为 27px）；加 `overscroll-behavior-x: contain` |
| [global.css:1684](../../src/styles/global.css#L1684) 新增滚动提示 | `pre[data-scroll]` 右缘 24px `mask-image` 渐隐；`table[data-scroll]` 右缘 22px 内阴影（`color-mix` 取 `--ink` 45%，亮暗主题各自成立） |
| [global.css:2225](../../src/styles/global.css#L2225) 新增 §12 | ≤900px：分享按钮 44px、分享标签独占一行、折叠目录条 44px、目录条目 44px（`display:flex` 垂直居中）、作者卡链接 44px |
| [PostLayout.astro:166](../../src/layouts/PostLayout.astro#L166) 脚本 | 给 `.prose pre, .prose table` 写 `data-scroll="start｜middle｜end"`；`resize` 与 `document.fonts.ready` 后重算 |
| [global.css:2049](../../src/styles/global.css#L2049) 打印样式 | 纸上不能横向滚动，代码恢复折行，并去掉右缘提示（`mask-image` / `box-shadow`） |

为什么代码块用渐隐、表格用内阴影：代码块里深色底铺满整个右缘，淡化就能看出"还没到头"；
表格右侧经常是空白单元格，纯渐隐在纸色上什么也看不见，内阴影才能在留白处也显示出来。
两者都由脚本判断是否真的溢出：不可滚动时不写属性，也就没有任何提示。

## 4. 复测

| 项目 | 改前 | 改后 |
| --- | --- | --- |
| 14 个页面 390px `scrollWidth` | 390 | 390（仍无横向溢出） |
| 代码块 | `pre-wrap`，内容 561/628/611px 被折行 | `white-space: pre`，`scrollWidth` 561/628/611 vs 可视 358，`data-scroll="start"` + 渐隐 |
| 滑到最右 | — | `data-scroll="end"`，`mask-image: none`（文字恢复全对比） |
| 表格（5 列） | 450 vs 358，无提示 | `data-scroll="start"` + 内阴影；滑到最右后移除 |
| 分享按钮 | 32px，两行（RSS 单独一行） | 44px，一行 |
| 折叠目录条 | 42.69px | 44px |
| 目录条目 | 19.59px | 44px |
| 作者卡链接 | 14px | 44px |
| 桌面 1440px | 代码块不折行、分享 32px、目录条目 19.59px | 代码块仍不溢出（无提示）、分享 32px、目录条目 19.59px（未被牵连），只有块级间距从 25.2/27 变成 32 |

对比度没有退化——本次没有改任何颜色 token 或前景/背景组合，复测取到的实际颜色与
[contrast-audit.md](contrast-audit.md) 一致：正文暗色 `rgb(185,177,164)` on `rgb(18,17,16)`，
代码 `rgb(240,243,246)` on `rgb(11,10,9)`，链接 `rgb(240,122,82)`，标题 `rgb(237,231,218)`。
滚动提示只在"还有内容"时出现，滑到尽头立即移除，不会让文字长期停在低对比状态。

页面高度随之变化：

| 截图 | 改前 | 改后 |
| --- | --- | --- |
| `post-mobile-light/dark` | 390×10659 | 390×10461（代码不再折行，整体变短） |
| `post-desktop-light/dark` | 1440×7365 | 1440×7415（块级间距变大） |

其余 16 张截图高度不变。截图与索引页已按新尺寸更新（[ui-preview.html](ui-preview.html)）。

## 5. 取舍与已知限制

- **代码块选横向滚动而不是换行**：换行确实能"一眼看全"，但代价是缩进消失、表达式被拆断
  （截图中 `radius: number` 的第二行从第 0 列开始）。代码的结构比"不用滑动"更重要，
  所以选滚动，用右缘渐隐补偿可发现性。代价是 203–270px 需要滑动。
- **表格不重排成卡片**：把 5 列表格拆成"标签 + 值"的卡片能彻底消除横向滚动，但会破坏
  逐行对比——而这些表格本身就是对比表。保留表格形态，补提示。
- **不加返回顶部**：一开始评估过。文章在 390px 下约 10461px，但页头是吸顶的、菜单随时可开，
  回导航不需要回滚；再加一个悬浮按钮只会在窄屏上再压一块内容。阅读进度条已经承担位置感知。
- **未覆盖**：iOS Safari 真机上 `mask-image` 与 `overscroll-behavior-x` 的表现（本次全部在
  Chrome 上测）、脚注样式（内容尚未使用）、正文图片（内容尚未使用）。
- 折行相关的一个副作用：代码块不换行后，横向滚动到最右时左侧会露出半行，
  这是滚动容器的正常行为，不额外处理。

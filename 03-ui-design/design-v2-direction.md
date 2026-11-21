# 页面设计风格 v2 方案（精简稿）

> 阶段 3 · **v2.2** · 2026-11-21 · 状态：**决策已确认；P1–P4 已实施**
> 修订说明：v2.2 按评审结论回撤四项减法——**保留**订阅页与订阅入口、**保留**标签索引与标签归档、
> 主题改回**手动切换**、把两个 guide 页的摘要**并入关于页**。页面数由 5 调整为 8，组件数由 4 调整为 6；
> 「零客户端 JS」目标不再成立，改为「除主题外无交互脚本」（§8.8）。字体仍全面改为系统字体栈。
> 关系：本稿取代 [design-system.md](design-system.md)（v1.3）成为唯一事实来源；v1.3 文档保留为历史。

---

## 0. 结论先行

| 项 | 结论 |
| --- | --- |
| 主推方向 | **素面（Plain Paper）**：单栏、系统字体、暖白纸、一个铜色信号色；识别度来自字体对比与节奏，不来自组件 |
| 视觉动作 | **不做概念翻新，做减法**：不加装饰、不加无关页面、不加交互；把 10 个页面收敛为 8 个，组件文件从 10 个减到 6 个 |
| 字体 | 全部改为系统字体栈：标题 Georgia 系、正文/UI 系统无衬线、代码系统等宽。零字体请求，删除 7 个 woff2（合计 157,140 字节）与 `@font-face` |
| 页面 | 保留 `/`、`/blog`、`/blog/[slug]`、`/tags`、`/tags/[tag]`、`/about`、`/newsletter`、`/404`；只砍 `/architecture`、`/performance`，摘要并入 `/about` 后 301 到 `/about` |
| 组件 | 保留 Header、Essay Row、Prose、Prev/Next、Footer、Skip Link、Subscribe、Tag Pill、主题切换；删除搜索、目录、进度条、面包屑、分享、作者卡 |
| JS | **不再声称零 JS**：只保留主题初始化内联脚本（约 0.3 KB，首帧前执行）与切换按钮模块（约 0.5 KB）；搜索、筛选、目录全部是静态 HTML |
| 迁移成本 | 低：无新字体、无新图片、无新依赖；主要是删除、改 token、重排 8 个模板 |
| 本轮交付 | 本文件 + P1（系统字体栈与设计 token）；页面结构改动留给 P2/P3 |

**一句话**：v1.3 已经证明"收敛"能解决凌乱；这一版要解决的是"过度设计"。把页面数量、组件数量、字体数量和选择项一起砍掉，剩下的部分做准。

---

## 1. 定位调整与判断依据

### 1.1 新定位改变了什么

| 旧假设（v1.3 / v2.0） | 新事实 | 设计后果 |
| --- | --- | --- |
| 站点是内容策展站，需要 pillar 页、标签集群、目录 | 个人随笔发布，作者只有一个人 | 策展页失去承载对象；标签作为轻量检索入口保留，但不再做 pillar 编目 |
| 需要导读组件、图签、编号章节来建立"编辑权威" | 读者来读文章，不是来浏览一份目录 | 组件越少，阅读越直接 |
| 三款自托管字体构成"三种声音"的识别度 | 字体要常见、可依赖、不预加载 | 识别度改由字号对比、留白与一个色彩信号承担 |
| 页面越完整越显得认真 | 页面越多，维护与走查成本越高 | 合并与删除本身就是设计决策 |

### 1.2 为什么「工程图纸」不再作主推

v2.0 的主推方向有四个签名元素：图签、编号章节、非对称 12 栏栅格、索引轨。其中三个是**新增 UI 结构**，且它服务的核心场景是"策展页与集群导航"——而这次恰恰要把策展页砍掉。继续保留它会出现两个矛盾：

1. **与"简单"直接冲突**：图签、编号、双轨都是为了让多层级页面显得有秩序；8 个平铺页面不需要这些秩序装置。
2. **前提被移除**：图纸语言最强的地方是 guide 页（编号步骤、篇数、总时长）。砍掉 guide 页后，图签只剩"日期/阅读时长"两格，投入产出不成立。

因此：**图纸方向降为备选 B，不推荐**。它仍然是一个成立的设计，但适合"有多个专题、需要策展"的站点，不适合现在的目标。

### 1.3 新主推：素面（Plain Paper）

**概念**：一张质量很好的白纸，上面是一篇排版得当的文章。没有图签、没有编号、没有色带、没有装饰线。所有判断只落在四件事上：字体对比、行宽、间距、一个颜色信号。

**三个形容词**：**安静、清楚、耐用**。

**识别度来源**（不依赖新组件）：

1. **衬线标题 + 无衬线正文**的固定搭配，形成稳定的"文章感"。
2. **暖白纸 + 墨黑 + 铜色**，只有一个颜色被允许出现。
3. **克制的线**：全站只在页头、列表行、页脚出现发丝线，没有区块边框、没有卡片。
4. **一致的节奏**：所有页面同一个 720px 容器、同一套 8px 间距、同一个列表行。

**取舍说明**：这会比 v1.3 更"素"，可能牺牲一部分杂志感。这是有意的——个人随笔的说服力来自文字与版式秩序，不来自装饰。唯一的"重"元素是首页底部的订阅色带（已确认保留，§8.6），它以全站唯一的深色块充当收束，而不是再加别的组件。

---

## 2. 方案比较

| 维度 | 主推：素面 | 备选 A：现状减负（v1.3 只换字体） | 备选 B：工程图纸（v2.0） |
| --- | --- | --- | --- |
| 页面数 | 8 | 10 | 10 |
| 组件数 | 6 个组件文件 + 3 段页面级版式 | 10 | 14（含图签、索引轨、编号头） |
| 字体请求 | 0（系统栈） | 0（若只换字体） | 7 个 woff2 |
| 与"个人随笔"契合 | 5 | 4 | 2 |
| 与"简单"契合 | 5 | 2 | 1 |
| 与现状差异度 | 3 | 1 | 5 |
| 迁移成本（5 = 最低） | 4 | 5 | 2 |
| 主要风险 | 过于朴素、辨识度靠执行细节 | 结构冗余仍在，改版感知弱 | 组件过载，与定位冲突 |

**结论**：选素面。备选 A 只作为"如果这周就要上线"的降级路径：只换字体、版式不动；它保留 10 个页面与大部分组件，不满足"简单"的核心诉求；若同时砍页面，就等同于主推方案。

---

## 3. 页面收敛：10 → 8

### 3.1 保留

| 页面 | 理由 |
| --- | --- |
| `/` 首页 | 个人博客的门面：我是谁 + 最近写了什么 + 一个订阅入口，两屏内读完 |
| `/blog` 归档 | 全部文章的稳定入口，按年份分组即可，不需要筛选与搜索 |
| `/blog/[slug]` 文章 | 核心页面，单栏阅读 |
| `/tags` 标签索引 | 10 篇文章、6 个标签；保留为轻量检索入口，不承担 pillar 编目 |
| `/tags/[tag]` 标签归档 | 保留；每页 2–5 篇，继续参与 sitemap，薄页面仍按 `MIN_POSTS_FOR_INDEX` 排除索引 |
| `/about` 关于 | 作者身份、联系方式、RSS、版权说明；承载 E-E-A-T，并承接原 guide 页的“Start here”摘要 |
| `/newsletter` 订阅 | 保留独立页与订阅入口；endpoint 为空时退化为 mailto，不渲染假表单 |
| `/404` | 必须有；简化为一句话 + 两个链接 |

### 3.2 砍掉与 301

| 砍掉 | 理由 | 处理 |
| --- | --- | --- |
| `/architecture`、`/performance` 策展页 | 策展模型与个人随笔不符；“The argument”三步是文章的二手摘要；两页结构重复，且需与标签页做索引协调 | 删除页面；三步摘要作为普通段落并入 `/about` 的“Start here”；301 → `/about` |
| 搜索浮层（Pagefind） | 10–30 篇文章用浏览器查找足够；Pagefind 带来构建步骤、依赖、索引缓存头与一个 `<dialog>` 组件 | 删除组件、触发器、构建步骤与依赖 |
| 首页精选 / 主题入口 | 与归档、标签页重复；首页只需要“最近文章” | 并入首页列表 |
| 标签筛选 chip | 需要 JS 与 `aria-live` 报数；归档页与标签页已经够用 | 删除 |
| 面包屑 | 站点只有两层，`← All writing` 一个返回链接足够 | 删除组件 |
| 目录 / 阅读进度 / 分享行 / 作者卡 / 相关阅读 | 文章约 1,000–1,500 词；这些组件重复导航、增加高度，作者信息在 `/about` | 删除；文末只保留上一篇/下一篇 |

**导航**：`Writing` · `Tags` · `About` · `RSS`，右侧保留主题切换按钮。四个链接加一个 44px 按钮在 360px 下排不下，因此**保留现有移动端菜单**（原生 `<details>`，无 JS）。

**订阅入口**：保留三处——首页底部色带、页脚一行、`/newsletter` 页本身。三处指向同一个 endpoint（或同一个 mailto），不新增弹窗、不新增第二套组件。

**SEO 影响**：只删两个 guide 页，301 到 `/about`，权重合并而不是丢失；`/tags` 与 `/tags/[tag]` 继续构建，`astro.config.mjs` 的薄标签门槛与 sitemap 过滤逻辑保持不变；仅 `guides` / `pillarLastmods` 相关逻辑随 guide 页一起删除。迁移前仍从 Search Console 导出两个 guide 页的点击与外部链接，迁移后观察 4 周。

---

## 4. 色彩系统

### 4.1 原则

1. **暖白纸，不用纯白**：`#FBFAF7` 降低屏幕眩光，比纯白更像纸，但不像旧版那么黄。
2. **一个信号色**：铜色 `#AC512D` 只用于站点名句点、正文链接、极少量激活态。
3. **两级线**：装饰发丝线（低对比）与控件边界（≥3:1）。没有阴影、没有渐变、没有纹理。
4. **明暗可手动切换**：默认取 `prefers-color-scheme`，用户选择写入 `localStorage['ws-theme']` 后以其为准（见 §8.8）。
5. **颜色不承担层级**：层级由字号、间距、字重承担；颜色只做点缀。

### 4.2 浅色 token（含实测对比度）

基准底色 `--bg #FBFAF7`，对比度按 WCAG 相对亮度公式实测。

| Token | 值 | 用途 | 对比度 |
| --- | --- | --- | --- |
| `--bg` | `#FBFAF7` | 页面底色 | — |
| `--bg-raised` | `#F4F2EC` | 行内代码、悬停浅底 | — |
| `--ink` | `#1C1B18` | 标题、强调文本 | 16.50:1 |
| `--ink-soft` | `#46443D` | 正文 | 9.34:1 |
| `--ink-faint` | `#6E6A60` | 日期、阅读时长、图注、页脚 | 5.17:1（raised 上 4.82:1） |
| `--rule` | `#D9D5CB` | 页头/列表行/页脚发丝线 | 1.40:1（raised 上 1.31，仅装饰） |
| `--control-border` | `#8B8679` | 输入框、按钮边界（若未来需要） | 3.48:1 |
| `--accent` | `#AC512D` | 链接、句点、选中标记 | 5.07:1（raised 上 4.73:1） |
| `--accent-wash` | `#F5ECE7` | 文本选中背景 | 与 ink 14.79:1 |
| `--code-bg` | `#1B1A17` | 代码块；块内文字 `#ECE9E1` | 14.34:1 |
| `--focus` | `#1F5FA8` | 焦点环 | 6.17:1 |
| `--band-bg` | `#1C1B18` | 订阅色带底（全站唯一深色块） | — |
| `--band-ink` | `#FBFAF7` | 色带标题与正文 | 16.50:1 |
| `--band-ink-soft` | `#B9B4A8` | 色带次要文字 | 8.24:1 |
| `--band-rule` | `#3A3831` | 色带内分隔线 | 1.50:1（仅装饰） |

### 4.3 暗色 token

基准底色 `--bg #141311`。

| Token | 值 | 对比度 |
| --- | --- | --- |
| `--bg` | `#141311` | — |
| `--bg-raised` | `#211F1B` | — |
| `--ink` | `#ECE9E1` | 15.30:1 |
| `--ink-soft` | `#B9B4A8` | 8.98:1 |
| `--ink-faint` | `#9A9487` | 6.15:1 |
| `--rule` | `#37342E` | 1.50:1（raised 上 1.33，仅装饰） |
| `--control-border` | `#767065` | 3.78:1 |
| `--accent` | `#E58A64` | 7.21:1 |
| `--accent-wash` | `#3A211A` | 与 ink 12.26:1 |
| `--code-bg` | `#0B0A09` | 代码块；块内文字 `#ECE9E1` | 16.31:1 |
| `--focus` | `#8CBEF5` | 焦点环 | 9.55:1 |
| `--band-bg` | `#2A251F` | 色带底 | — |
| `--band-ink` | `#ECE9E1` | 色带文字 | 12.62:1 |
| `--band-ink-soft` | `#B9B4A8` | 色带次要文字 | 7.35:1 |
| `--band-rule` | `#3F3830` | 色带内分隔线 | 1.44:1（仅装饰） |
| `--band-border` | `#4A4439` | 色带与页面的交界（可选） | 1.58:1 |

### 4.4 使用规则

- 任一屏内**着色的元素不超过 2 处**（句点、链接组算一处）。
- 正文用 `--ink-soft`；标题用 `--ink`；日期、阅读时长用 `--ink-faint`。
- 线只出现在三处：页头下、列表行间、页脚上。**没有区块分隔线、没有卡片边框、没有左侧装饰条。**
- 链接默认铜色 + 下划线（`text-underline-offset: 0.18em`），悬停转 `--ink` 并加粗下划线；不用颜色变化做唯一反馈。
- 选中文本：`--accent-wash` 底 + `--ink` 字。
- 行内代码：`--bg-raised` 底 + `1px --rule` 边 + 等宽字体。
- 焦点环统一 `--focus`，2px，offset 2px；深色模式自动换 `#8CBEF5`。
- 订阅色带是全站唯一的深色块：只用 `--band-*`，内部不再出现第二个强调色；标题用 `--band-ink`，次要文字用 `--band-ink-soft`。
- 不使用 `color-mix` 生成二级文字，所有灰阶都有明确 token。

### 4.5 旧 token 映射

| 旧 | 新 | 变化 |
| --- | --- | --- |
| `--bg` | `--bg` | 暖纸 `#F6F2E9` → 暖白 `#FBFAF7` |
| `--bg-raised` | `--bg-raised` | 变浅、变中性 |
| `--ink` / `--ink-soft` / `--ink-faint` | 同名 | 文字对比度全部重算（见上表） |
| `--rule` | `--rule` | 更浅；仅保留三处使用位置 |
| `--control-border` | `--control-border` | 保留 token，但页面中基本无控件使用 |
| `--accent` / `--accent-wash` | 同名 | 色值不变，使用面积进一步收紧 |
| `--code-bg` | `--code-bg` | 略调 |
| `--focus` | `--focus` | 改为偏蓝的 `#1F5FA8` / `#8CBEF5` |
| `--band-*` | 保留 | 订阅色带保留；色值按新纸色/墨色微调，并新增 `--band-ink-soft` |
| `--fs-*` 九级 | `--text-*` 八级 | 见 §5.3，字号整体下调 1–2px（系统字体视觉更大） |

---

## 5. 字体系统

### 5.1 三个系统栈

```css
--font-serif: Georgia, "Times New Roman", "Songti SC", "STSong", "SimSun",
              "Noto Serif CJK SC", serif;
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
             "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
             Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas,
             "Courier New", "Liberation Mono", monospace;
```

选择理由：

- **零请求、零 FOUT**：删除 7 个 woff2 与 `@font-face`，首屏不再等待字体；CSP 的 `font-src 'self'` 可保留（不再有实际请求）。
- **Georgia 在 Windows/macOS 都存在**，是少数可靠的"有书卷气"的系统衬线；回退到 Times New Roman 仍可接受。
- **系统 UI 无衬线**在 Windows（Segoe UI）、macOS（SF）、Android（Roboto）上都是各自平台最易读的正文字体，且中文回退到平台默认黑体。
- **等宽只用于代码**，不再用于导航与日期——这是与 v1.3 最大的气质差别，也是简化的关键：不需要第三个"声音"参与页面结构。

### 5.2 角色分配（两种声音 + 代码）

| 角色 | 字体 | 使用位置 | 禁止 |
| --- | --- | --- | --- |
| 标题声部 | `--font-serif` | 站点名、页面 H1、文章标题、正文 H2/H3、引用 | 不用于正文、按钮、日期 |
| 正文/UI 声部 | `--font-sans` | 正文、导语、描述、导航、日期、页脚、按钮 | 不用于展示级标题 |
| 代码声部 | `--font-mono` | `pre` / `code` / 键盘按键 | 不用于任何普通文本 |

### 5.3 字号阶梯（8 级）

| Token | 值 | 行高 | 字距 | 用途 |
| --- | --- | --- | --- | --- |
| `--text-xs` | `0.8125rem` (13px) | 1.5 | `0.01em` | 日期、阅读时长、图注、页脚 |
| `--text-sm` | `0.9375rem` (15px) | 1.6 | `0` | 列表描述、导航、次要说明 |
| `--text-base` | `1.0625rem` (17px) | 1.75 | `0` | 正文 |
| `--text-lead` | `1.1875rem` (19px) | 1.6 | `0` | 文章导语、关于页开场 |
| `--text-h3` | `1.375rem` (22px) | 1.35 | `-0.005em` | 正文 H3、列表标题 |
| `--text-h2` | `1.6875rem` (27px) | 1.25 | `-0.01em` | 正文 H2 |
| `--text-h1` | `clamp(1.875rem, 3.4vw, 2.5rem)` (30–40px) | 1.15 | `-0.015em` | 页面 H1 |
| `--text-display` | `clamp(2.125rem, 5vw, 3rem)` (34–48px) | 1.1 | `-0.02em` | 首页名字、文章标题 |

- 只允许上表字号；行内代码 `0.9em` 是唯一例外。
- 数字不需要等宽（日期不再竖排对齐）；正文中的年份与统计自然排版。
- 取消全大写导航与全大写标签：用正常大小写 + 15px，阅读更顺。
- 斜体只用于引用与 `em`；导语为正体。

### 5.4 中英混排与回退

站点目前以英文为主（`lang="en"`），但作者与读者可能是中文环境，需明确规则：

1. **回退顺序**：拉丁字符优先取 Georgia / Segoe UI / system-ui；中文字符在同一 `font-family` 列表中继续向右匹配，macOS 落到 `PingFang SC`（正文）或 `Songti SC`（标题），Windows 落到 `Microsoft YaHei`（正文）或 `SimSun`（标题），Linux/Android 落到 `Noto Sans/Serif CJK`。
2. **不要把中文字体放在拉丁字体之前**，否则英文会失去 Georgia 的字形与宽度控制。
3. **行高**：正文 1.75 对中英混排都安全；若将来以中文长文为主，正文行高提到 1.8，并把 `--text-base` 提到 18px。
4. **标点与断行**：不用 `text-align: justify`；不用 `word-break: break-all`；中文段落不额外加 `letter-spacing`。
5. **`lang` 的正确性**：英文页保持 `lang="en"`；将来若出现中文文章，在 frontmatter 增加 `lang` 字段并输出到 `<html lang>` 与正文容器，浏览器才会选择正确的中文字形与断行规则。**本轮不实现**，只记录约束。
6. **操作系统差异**：Segoe UI 与 PingFang 的 x-height 不同，同一字号在两端观感差约 1px；因此正文用 17px 而不是 16px，且不做紧字距，避免 Windows 上发挤。
7. **构建产物**：OG 图为服务端 SVG 渲染，继续使用 `Georgia` 与 `Courier New`（当前脚本已如此），不依赖浏览器字体；即使构建机缺少 Georgia，也有 Times/Courier 回退。

### 5.5 加载与性能

- 删除 `public/fonts/*.woff2`、`@font-face`、`<link rel="preload">`。
- 删除 `netlify.toml` / `vercel.json` 中 `/fonts/*` 的缓存头（可选，保留也无害）。
- 系统字体没有 FOUT/CLS；LCP 只会更快。
- 站点由 Astro 静态输出。移除搜索后仍保留主题相关脚本（一段内联初始化 + 一个切换模块），不再声称零 JS；性能与抓取影响见 §8.8。

---

## 6. 间距与排版节奏

### 6.1 尺度

- 基准 **8px**；只允许 `8 / 16 / 24 / 32 / 48 / 64 / 96`。
- 4px 只用于图标与文字、标签与值的微调，不作布局间距。

### 6.2 容器与行宽

| 项 | 值 |
| --- | --- |
| 容器 | `min(720px, 100% - 48px)`；≤640px 为 `100% - 40px` |
| 正文行宽 | `--measure: 66ch`（17px 下约 600–640px） |
| 文章容器 | 同 720px，正文限 `--measure`，左对齐 |
| 页头高 | 56px |

全站只有一个容器宽度。归档、文章、关于、404 都从同一左缘开始，右侧留白随视口增长——这比 v1.3 的 640/900/1200 三档容器更简单，也消除了"每页宽度不同"的漂移。

### 6.3 垂直节奏

| 位置 | 桌面 | ≤640px |
| --- | --- | --- |
| 页头上下内边距 | 16 / 16 | 16 / 16 |
| 页面顶部到 H1 | 64 | 40 |
| H1 到导语 | 16 | 12 |
| 导语到正文/列表 | 40 | 32 |
| 列表行内边距 | 20 / 20 | 18 / 18 |
| 年份分组上间距 | 48 | 40 |
| 区块之间 | 64 | 48 |
| 页脚上间距 | 64 | 48 |
| 正文段落 | 0 0 1.2em | 同 |

### 6.4 线条预算

1. 全站只有三种线：页头底边、列表行底边、页脚顶边。
2. 一屏内**通栏线 ≤ 2 条**（页头 + 页脚，或页头 + 列表）。
3. 文章页**没有**标题下横线、没有文末分隔装饰线；只用上下留白。
4. 2px 线只保留焦点环；页面内不出现 2px 装饰线。

### 6.5 断点

| 断点 | 变化 |
| --- | --- |
| `900px` | 文章标题上限降到 36px；列表日期列收窄到 88px |
| `640px` | 容器边距 20px；正文 16.5px/1.75（视觉等价）；列表改为堆叠（日期 → 标题 → 描述）；上一篇/下一篇纵向堆叠 |
| `400px` | 站点名缩到 18px；确保三个导航链接不换行 |

---

## 7. 页面模板

### 7.1 全局外壳

**Header（56px，静态，不吸顶）**

```
Waystone AI.                  Writing   Tags   About   RSS   ◐
──────────────────────────────────────────────────────────────────
```

- 站点名：`--font-serif` 20px + 铜色句点；链接回首页。
- 导航：桌面 15px 无衬线（P1 阶段仍是系统等宽，P3 改回无衬线）；当前页 `--ink`，其余 `--ink-soft`；悬停 `--ink` + 1px 下划线；无大写、无胶囊。
- 主题切换：44×44 图标按钮，位于导航最右；日/月图标由 `data-theme` 控制显隐。
- ≤900px：四个链接折入原生 `<details>` 菜单（无 JS），菜单内列四个链接 + RSS；主题按钮留在栏内。
- 页头不吸顶、不模糊：滚动时纸面不动，减少一层视觉与实现复杂度。
- `aria-current="page"` 保留；焦点环全局统一。

**Footer（一行）**

```
──────────────────────────────────────────────────────────────
© 2026 Waystone AI     RSS     Newsletter     Email     Colophon
```

- 13px，`--ink-faint`，`gap: 24px`，`flex-wrap`；≤640px 换行。
- 不给每个链接做列标题，不再三栏；版权、RSS、订阅、Email、字体说明足够。

### 7.2 首页 `/`

```
Waystone AI.
I write about software, systems, and the parts that age badly.
Mostly notes from building and maintaining things I did not design.

26 Jul 2026                         What I Learned Rewriting the Monolith
                                    A rewrite is a bet you cannot fully hedge…
12 Jul 2026                         Your Build Pipeline Is a Product
                                    A pipeline is a product with users…
…

All writing →

────────────────────────────────────────────────  ← 订阅色带（通栏深色）
One essay, every other Tuesday.
[ email ]  Subscribe
```

- 名字：`--text-display`，1 行。
- 简介：19px，≤46ch，2–3 行；不写营销句。
- 列表：最近 8 篇；行结构 `96px 1fr`，日期在左，标题 22px 衬线，描述 15px（最多 2 行）；≤640px 改为堆叠。
- 末尾一个文字链接 `All writing →`，其后是订阅色带（`--band-*`，标题 27px 衬线，单行说明 + 单字段表单；endpoint 为空时降级为 mailto 链接）。
- **没有**英雄按钮、精选区、主题区、搜索。
- 首屏目标：1280×800 下可见名字、简介与至少 2 篇文章标题。

### 7.3 归档 `/blog`

```
Writing
Everything I have published, newest first.

2026
26 Jul 2026      What I Learned Rewriting the Monolith
                 A rewrite is a bet you cannot fully hedge…
12 Jul 2026      Your Build Pipeline Is a Product
                 …

2025
…
```

- H1 30–40px 衬线；一行说明 17px。
- 年份：13px `--ink-faint`，上方 48px；年份只是分组标签，不做粘性轨。
- 行复用首页同一组件（日期在左）。
- 无筛选、无搜索、无计数；页头说明右侧一个 `All tags →` 文字链接指向 `/tags`，不在页内重复标签导航。
- 空状态（未发布任何文章）：一句话 + RSS 链接，不做插画。

### 7.4 文章 `/blog/[slug]`

```
← All writing

What I Learned Rewriting the Monolith
26 Jul 2026 · 6 min read · architecture, performance

A rewrite is a bet you cannot fully hedge; a seam is a hedge you can.

正文 17px / 1.75 / 66ch
## H2 27px 衬线
段落…
> 引用
[code block]

──────────────────────────────
← Previous   The Cost of Convenience
Next →       Boring Architecture
```

- 返回链接：13px，`← All writing`，替代面包屑。
- 标题：`--text-display`，最多 3 行，不限字宽但正文限 66ch。
- 元信息：13px，`日期 · 阅读时长 · 标签`；标签为 `TagPill` 链接，指向 `/tags/[tag]`。
- 导语：19px，≤56ch；沿用 frontmatter `description`。
- 正文：17px / 1.75 / `--ink-soft`；H2 27px 衬线；H3 22px 衬线；段间距 1.2em。
- 引用：左 2px `--accent`，19px 斜体，左内边距 20px，无底色。
- 代码块：深色、0 圆角、20px 内边距、14px 等宽、横向滚动；不做复制按钮。
- 图片：宽度 100%，0 圆角，1px `--rule`；图注 13px `--ink-faint`，上间距 8px。
- 表格：13px 表头 `--ink-faint`，行线 1px，窄屏横向滚动。
- 文末：只保留上一篇/下一篇（两行，上方 1px `--rule`）；没有分享、作者卡、相关阅读、订阅。
- **没有目录**：文章长度不需要；标题层级本身已是最短目录。
- **没有阅读进度条**：装饰性大于功能性。

### 7.5 关于 `/about`

```
About

第一段：我是谁、在做什么。
第二段：这个站点写什么、为什么写。

Start here
Boring is a budget
Convenience is a loan
A rewrite is a bet; a seam is a hedge
（每行：标题 + 一句摘要 + 文章链接）

第三段：如何联系、是否接受什么。

Elsewhere
Email    GitHub    X    RSS

Colophon: set in Georgia and the system UI fonts; built with Astro.
```

- 单栏，与文章页同一容器；H1 30–40px。
- 正文 17px；不做左侧粘性身份栏、不做字母图版、不做编号标准清单。
- **Start here**：原 Architecture / Performance guide 的“The argument”三步摘要合并为一段普通小节，用无序列表呈现（标题 + 一句摘要 + 文章链接），不恢复 01/02/03 编号、图签与“Curated path”元信息。三个主题各保留一条，重复内容合并。
- `Elsewhere` 是 15px 链接列表，行高 40px，1px 分隔线可选（最多 1 条）。
- Colophon 13px `--ink-faint`，只保留一句。

### 7.6 标签索引 `/tags`

```
Tags
Every topic I have written about, with a count.

architecture   03
career         03
devops         02
engineering    05
performance    02
writing        02
```

- H1 30–40px 衬线；一行说明 17px。
- 列表每行 `1fr auto`：标签名 17px 衬线，右侧计数 13px `--ink-faint`；整行一个链接。
- 计数 < 3 的标签仍显示，但其归档页 `noindex, follow` 且不进 sitemap（沿用现有 `MIN_POSTS_FOR_INDEX`）。
- 无标签云、无字号随数量变化、无筛选。

### 7.7 标签归档 `/tags/[tag]`

```
architecture

03 essays on architecture, newest first.

26 Jul 2026   What I Learned Rewriting the Monolith
              A rewrite is a bet you cannot fully hedge…
12 Jul 2026   The Cost of Convenience
              …

← All tags
```

- H1 为标签展示名（`tagLabel` 处理连字符）；下方一行计数说明，17px。
- 列表复用 Essay Row；行结构与归档页一致。
- 底部一个 `← All tags` 返回链接，替代面包屑。
- 薄标签页（<3 篇）输出 `noindex, follow`，与 sitemap 排除规则保持一致。

### 7.8 订阅 `/newsletter`

```
Newsletter

One essay, every other Tuesday.
No tracking pixels, no resale, one-click unsubscribe.

[ email ]  Subscribe
```

- 单栏，H1 30–40px；说明 ≤46ch。
- 复用 `Subscribe` 组件；endpoint 为空时渲染 `mailto:hello@blog.waystoneai.online?subject=Subscribe` 文字链接，并在页面上说明邮件订阅暂未开放。
- 不列往期归档、不做倒计时或社交证明。

### 7.9 404

```
404

Page not found.
That link does not point to anything here.

All writing →      Home →
```

- `404` 用 13px `--ink-faint` 标签，不放大数字；正文 H1 30–40px 衬线。
- 两个文字链接，不用按钮。
- 保留 `noindex, follow` 与关闭 canonical 的现有处理。

---

## 8. 关键组件约定

本版保留 **6 个组件文件**（Header / Essay Row / Footer / BaseHead / Subscribe / Tag Pill）与 **3 段页面级版式**（Prose / Prev-Next / Skip Link）。主题切换是 Header 内的一个按钮，不单独成组件。所有组件共用一条规则：**没有圆角、没有阴影、没有卡片、没有图标装饰**。

### 8.1 Header

| 项 | 规格 |
| --- | --- |
| 高度 | 56px，内容垂直居中，静态定位 |
| 结构 | `<a>` 站点名 + `<nav>` 四链接 + 主题按钮 |
| 站点名 | 衬线 20px（≤400px 时 18px）+ 铜色句点 |
| 导航 | 15px 无衬线；间距 24px；`aria-current` 表示当前页 |
| 主题按钮 | 44×44，`data-theme-toggle`，`aria-label` 随状态更新 |
| 线 | 底部 1px `--rule` |
| 移动端 | ≤900px 四链接折入原生 `<details>` 菜单；主题按钮留在栏内；不引入 JS |

### 8.2 Essay Row（首页与归档共用）

| 项 | 规格 |
| --- | --- |
| 栅格 | `96px 1fr`，日期在左，行间距 24px |
| 标题 | 22px 衬线 `--ink`；悬停 `--accent` + 1px 下划线 |
| 描述 | 15px `--ink-faint`，最多 2 行；与标题间距 6px |
| 日期 | 13px `--ink-faint`；`<time datetime>`；与标题首行对齐 |
| 行高 | 内边距 20px 0；底边 1px `--rule`；最后一行无底边 |
| 点击区 | 整行一个 `<a>`；≥44px 高 |
| ≤640px | 改为堆叠：日期 → 标题 → 描述 |
| 禁止 | 缩略图、序号、标签胶囊、箭头滑动、悬停位移 |

### 8.3 Prose

| 块 | 规格 |
| --- | --- |
| 段落 | 17px / 1.75 / `--ink-soft` / 66ch / 下间距 1.2em |
| H2 | 27px 衬线，上 48 / 下 16 |
| H3 | 22px 衬线，上 32 / 下 12 |
| 列表 | 左缩进 1.4em，`::marker` 用 `--ink-faint` |
| 链接 | 铜色、下划线、offset 0.18em；悬停 `--ink` |
| 引用 | 2px 铜色左条 + 20px 内边距 + 19px 斜体 |
| 行内代码 | `--font-mono` 0.9em + `--bg-raised` + 1px `--rule` + 2px 4px |
| 代码块 | `--code-bg`、14px、20px 内边距、0 圆角、`overflow-x: auto` |
| 表格 | 100% 宽、13px 表头、1px 行线、窄屏横向滚动 |
| 图片 | 100% 宽、0 圆角、1px `--rule`；图注 13px |
| 分隔线 | 1px `--rule`，上下 40px；一篇文章最多 2 次 |

### 8.4 Prev / Next

- 两行，`1fr 1fr`，中间 1px 竖线；≤640px 纵排。
- 标签 `Previous` / `Next` 13px `--ink-faint`；标题 17px 衬线。
- 整块上方 1px `--rule`；无按钮框、无箭头动画。

### 8.5 Footer

- 上方 1px `--rule`，上间距 64px。
- 单行 13px，`--ink-faint`；当前页链接可省略。
- 包含版权、RSS、Newsletter、Email、Colophon；不包含社交图标。

### 8.6 Subscribe 色带

| 项 | 规格 |
| --- | --- |
| 位置 | 首页列表之后、页脚之前；`/newsletter` 页复用同一组件（不带通栏深色底） |
| 底 | `--band-bg`；通栏，上下内边距 48px |
| 标题 | 27px 衬线 `--band-ink` |
| 说明 | 15px `--band-ink-soft`，≤52ch |
| 表单 | 单行：输入框 + 按钮；输入框透明底、1px `--band-rule` 边、`--band-ink` 文字 |
| 降级 | `site.newsletter.endpoint` 为空时渲染 mailto 文字链接，不渲染表单 |
| 禁止 | 弹窗、二次确认、社交证明、倒计时 |

### 8.7 Tag Pill

| 项 | 规格 |
| --- | --- |
| 形态 | 文字链接，不是胶囊：无底色、无边框、无圆角 |
| 字号 | 13px，`--ink-faint`；悬停 `--accent` + 下划线 |
| 分隔 | 8px 间距或逗号，不与 `·` 混排 |
| 用途 | 文章页元信息；标签索引与标签归档页复用 |
| 禁止 | 计数徽标、按标签变颜色、JS 筛选 |

### 8.8 主题策略（手动切换）

明暗切换保留；默认值取系统偏好，用户选择优先。实现只允许三段代码：

1. **CSS**：`:root` 为浅色 token，`html[data-theme="dark"]` 覆盖为 §4.3 的暗色 token。不用 `@media (prefers-color-scheme)` 直接改 token，避免与手动选择互相覆盖。
2. **首帧前初始化（内联，阻塞）**：放在 `<head>` 内任何样式表之后、`<body>` 之前。

```html
<script is:inline>
  (function () {
    try {
      var t = localStorage.getItem('ws-theme');
      if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
    } catch (e) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
</script>
```

3. **切换按钮（模块脚本）**：Header 内的 `[data-theme-toggle]` 读写 `dataset.theme` 与 `localStorage['ws-theme']`，并同步 `aria-label`。

顺序要求：必须先设 `data-theme` 再绘制首帧。放在 `<head>` 末尾即可；若挪到 `<body>` 之后，会出现一帧浅色闪烁（FOUC 式的主题闪烁）。

实际影响：

| 维度 | 影响 |
| --- | --- |
| 体积 | 内联脚本约 0.3 KB（随 HTML 走，不额外请求）；切换模块约 0.5 KB，Astro 打包为独立 module，不阻塞渲染 |
| 渲染 | 内联脚本在首帧前同步执行，`localStorage` 是同步 API，通常 <1ms；只改根元素属性，不改布局，因此无 CLS |
| LCP | 无影响：脚本不含网络请求，不阻塞 HTML 解析后的绘制 |
| 抓取 | `data-theme` 不改变 DOM 文本与链接；爬虫看到的 HTML、canonical、JSON-LD 完全一致。`theme-color` 仍保留两条带 `media` 的值，爬虫不依赖它 |
| 隐私 | `localStorage` 只存 `light` / `dark` 两个值，无标识符、无过期时间，不构成追踪 |
| 无 JS 场景 | 脚本被禁用时不写 `data-theme`，页面停留在浅色；这是可接受的降级，不引入 `noscript` 样式 |

**因此本稿不再使用“零客户端 JS”的表述**；准确说法是“除主题外无交互脚本”。

### 8.9 已删除组件（附理由）

| 组件 | 理由 |
| --- | --- |
| `Search.astro` + Pagefind | 文章量小；构建步骤与依赖大于收益 |
| `TableOfContents.astro` | 文章长度不需要目录；H2/H3 已足够 |
| `Breadcrumbs.astro` | 两层结构，返回链接足够；guide 页删除后也无 pillar 需要面包屑 |
| `ShareRow.astro` | 个人博客分享需求低；复制链接可用浏览器完成 |
| 作者卡 / 相关阅读 / 阅读进度 | 重复信息与装饰；文章页只保留上一篇/下一篇 |

---

## 9. 动效与交互

- 只保留颜色过渡：120ms `ease-out`；其余属性不做过渡。
- 无滚动入场、无悬停位移、无箭头滑动、无平滑滚动。
- 悬停反馈：链接颜色 + 下划线加粗；列表标题同链接。
- 焦点反馈：2px 焦点环 + 2px offset，始终可见。
- 系统字体无加载动画；除主题切换外无脚本，其余交互全部是原生链接与原生 `<details>`。

---

## 10. 无障碍与质量门槛

1. 对比度：正文 ≥4.5:1（实测 9.34），次要文字 ≥4.5:1（5.17），控件边界 ≥3:1（3.48），焦点 ≥3:1（6.17）。
2. 触摸目标：所有链接与导航 ≥44×44；导航用上下内边距补足。
3. 键盘：Tab 顺序 = 站点名 → 导航 → 正文链接 → 页脚；焦点环不被裁剪。
4. 结构：每页一个 `<h1>`；文章页 H2/H3 不跳级；`<main id="main">` + 跳转链接保留。
5. 语义：列表用 `<ul>/<li>`；日期用 `<time datetime>`；标签链接指向 `/tags/[tag]`，当前标签页用 `aria-current="page"`。
6. 无横向滚动：360 / 390 / 768 / 1280 四档实测 `scrollWidth === clientWidth`。
7. 排版：行宽 60–70ch；每屏通栏线 ≤2 条；无 2px 装饰线。
8. 字体降级：在 Windows（Segoe UI / Microsoft YaHei）与 macOS（SF / PingFang）各看一遍；Linux 至少看一次标题回退。
9. 脚本预算：全站脚本只有主题初始化内联脚本与切换模块，合计未压缩 ≤1 KB；`grep -r "<script" src/` 应只命中 `BaseHead` 与 `Header`。
10. 主题：首帧前已设置 `data-theme`；禁用 JS 时页面为浅色且完全可读；切换后刷新保持选择。
11. 打印：白底黑字，隐藏页头页脚，代码折行，链接不外露 URL。

---

## 11. 迁移计划

### 11.1 原则

- 顺序为：换字体与 token（可整体回滚）→ 删除 guide 页与四个组件 → 重排 8 个模板。
- 每一步可独立回滚；不引入新字体、图片、依赖。
- 删除页面前先记录 Search Console 数据与外部链接，避免无意识丢失长尾。

### 11.2 阶段

**P0 基线（不改代码）**

- 截图 10 个页面 × 亮/暗 × 390/1280，存档到 `03-ui-design/screenshots-v2-baseline/`（仅本地参考）。
- 从 Search Console 导出 `/architecture`、`/performance` 的点击、展示与外部链接。
- 记录当前 `build` 产物大小与字体文件体积，作为精简对照。

**P1 字体与 token（已完成，可整体回滚）**

- `global.css`：删除 7 个 `@font-face`；`--font-*` 换成三套系统栈；替换浅/暗色 token 与 `--band-*`；删除 body 点阵纹理；页头改实底、去掉 `backdrop-filter`。
- `BaseHead.astro`：删除字体预加载；`theme-color` 改为新纸色/墨色。
- `scripts/generate-og.mjs`：五个色值同步新 token。
- 删除 `public/fonts/` 下 7 个 woff2。
- **不在 P1 做**：容器宽度、`--fs-*` 改名（→ `--text-*`）、页面结构与组件删减；这些留给 P2/P3，保证 P1 可以整体回滚。
- 验收：`npm run build` 通过；首页与文章页在 Windows/macOS 各看一次；无字体请求、无 FOUT。

**P2 删除与合并（已完成）**

- 删除页面文件：`src/pages/architecture.astro`、`src/pages/performance.astro`；`src/pages/tags/*`、`src/pages/newsletter.astro` 保留。
- 删除组件：`Search.astro`、`TableOfContents.astro`、`Breadcrumbs.astro`、`ShareRow.astro`；保留 `Subscribe.astro` 与 `TagPill.astro`。
- 移除搜索：`BaseLayout` 的 `Search` 引用与渲染、`Header` 触发器、`package.json` 的 `pagefind` 与 `build` 脚本中的 `pagefind --site dist`、`global.css` 的 `.pagefind-ui` 段、`netlify.toml` 的 `/pagefind/*` 缓存头。
- 保留主题切换：`BaseHead` 内联初始化、`Header` 按钮与模块脚本、`localStorage` 读取全部不动。
- 更新导航与页脚：`src/lib/site.ts` 的 `nav` 保持 `Writing / Tags / About`（RSS 由 Header/Footer 单独渲染）；页脚增加 `Newsletter` 链接。
- 简化 `astro.config.mjs`：删除 `topic-guides.json` 读取、`guides` 与 `pillarLastmods`；**保留** `tagCounts`、`MIN_POSTS_FOR_INDEX`、薄标签 `noindex` 与 sitemap 过滤逻辑。
- 删除 `src/data/topic-guides.json` 与 `src/lib/site.ts` 的 `topicGuides` / `guideForTag` / `guideForPost` / `topicPath` 导出。
- `src/lib/posts.ts`：`collectTags` 继续保留（`/tags` 与 `/tags/[tag]` 依赖）。
- `scripts/check-seo.mjs`：保留标签页索引校验，删除 guide 页校验分支。
- 更新 OG：`generate-og.mjs` 五个色值已随 P1 更新；`featured` 分支留到首页模板重排时再判断是否删除。
- 301 配置（三处保持一致）：

```
# public/_redirects
/architecture /about 301
/performance  /about 301
```

`netlify.toml` 用等价的 `[[redirects]]` 条目书写，不能直接粘贴上面的纯文本语法；`vercel.json` 用下面的 JSON。

```json
// vercel.json
{ "source": "/architecture", "destination": "/about", "permanent": true },
{ "source": "/performance", "destination": "/about", "permanent": true }
```

- 验收：`curl -I` 检查两个 URL 返回 301 且 Location 指向 `/about`；`npm run build` 后 `dist` 中不再有 `/architecture`、`/performance`，但 `/tags`、`/tags/*`、`/newsletter` 仍在；sitemap 只少了两个 guide URL。

**P3 重排 8 个模板（已完成）**

- 顺序：404 → 订阅 → 标签索引 → 标签归档 → 关于 → 归档 → 文章 → 首页。
- 每页完成即截图（亮/暗 × 390/1280）+ 对比度抽查 + 长标题测试（90 字符）。
- 文章页重点：移除 264px 对齐补偿，改成单栏 + 66ch；标签改为 `TagPill` 链接；文末只留上一篇/下一篇。
- 关于页重点：合并 guide 摘要为 “Start here”，删除 01/02/03 编号与图签。
- 已落地：容器 720px / 正文 66ch；页头静态 56px（桌面四链接 + 主题按钮，≤900px 原生 `<details>` 菜单）；页脚单行；Essay Row `96px 1fr`（≤640px 堆叠、末行无底边）；文章头顺序为标题 → 日期/时长/标签一行 → 导语，正文页不再出现订阅色带；标签索引名称 17px + 右侧两位计数；日期统一为 `21 Nov 2026`。
- 验收：`npm run build`（23 页）、`npm run check`（0 error）、`test:links`（497 条内链）、`test:seo`（23 页）全部通过；浏览器核对首页、文章页、关于页与 390px 布局，主题切换与刷新持久化正常。

**P4 收尾（已完成）**

- `design-system.md`（v1.3）与 `page-designs.md`（v1.0）顶部已加“已被取代”标注，并指向本文件。
- OG 已重建：`scripts/generate-og.mjs` 使用 v2 色值，并在生成前清理旧卡片；`npm run prebuild` 生成 11 张文章卡 + 1 张默认卡。
- 页面截图未重新生成：现有 `ui-preview.html` 属于 v1 历史样张，随旧文档一并视为历史；P3 验收截图只作为过程证据。
- 验收：`npm run check`、`npm run build`、`npm run test:seo`、`npm run test:links` 全部通过。
- 上线后 4 周观察被删页面的 404/301 命中与 Search Console 覆盖报告（待上线后执行）。

### 11.3 逐文件影响

| 文件 | 动作 | 说明 |
| --- | --- | --- |
| `src/styles/global.css` | 大改 | P1：字体栈、颜色与色带 token、去点阵、页头实底；P3：线条预算与组件样式 |
| `src/layouts/BaseLayout.astro` | 小改 | 移除 `Search` 引用与渲染；主题初始化保留 |
| `src/layouts/PostLayout.astro` | 大改 | 单栏、去目录/进度/分享/作者/相关；上一篇/下一篇 |
| `src/components/Header.astro` | 中改 | 56px、静态、四链接、去搜索、保留主题按钮与移动菜单 |
| `src/components/Footer.astro` | 大改 | 三栏 → 单行，增加 Newsletter |
| `src/components/PostRow.astro` | 中改 | 一套行样式：`96px 1fr`，日期在左；≤640px 堆叠 |
| `src/components/BaseHead.astro` | 中改 | P1 已去字体预加载、更新 `theme-color`；P3 核对主题 meta |
| `src/components/Subscribe.astro` | 小改 | 保留；换 `--band-*` token，核对 mailto 降级 |
| `src/components/TagPill.astro` | 小改 | 保留；改为纯文字链接，去胶囊底色 |
| `src/pages/index.astro` | 大改 | 名字 + 简介 + 最近 8 篇 + All writing + 订阅色带 |
| `src/pages/blog/index.astro` | 大改 | 年份分组 + 静态列表；`All tags →` |
| `src/pages/blog/[slug].astro` | 中改 | 返回链接、元信息、标签改为 `TagPill` 链接 |
| `src/pages/about.astro` | 大改 | 单栏、去粘性栏与标准清单；新增 “Start here” |
| `src/pages/404.astro` | 中改 | 小号 404 标签 + 两个链接 |
| `src/pages/tags/index.astro`、`tags/[tag].astro` | 保留 | 只调样式与排版，不删路由；薄标签逻辑不动 |
| `src/pages/newsletter.astro` | 保留 | 只调样式；复用 `Subscribe` |
| `src/pages/architecture.astro`、`performance.astro` | 删除 | 301 → `/about`；摘要并入 About |
| `src/components/Search.astro`、`TableOfContents.astro`、`Breadcrumbs.astro`、`ShareRow.astro` | 删除 | 同步清理引用 |
| `src/lib/site.ts` | 小改 | `nav` 保持三条（Writing / Tags / About）；删除 `topicGuides` 及 guide 查找函数 |
| `src/lib/posts.ts` | 无需改 | `collectTags` 继续被标签页使用 |
| `src/data/topic-guides.json` | 删除 | 删除 guide 页后无引用 |
| `astro.config.mjs` | 中改 | 删除 guides 与 pillar lastmod；保留标签门槛与 sitemap 过滤 |
| `package.json` | 小改 | 移除 `pagefind`；`build` 改为 `astro build`；同步 lockfile |
| `public/fonts/*.woff2` | 删除 | 7 个文件（157,140 字节），P1 |
| `public/favicon.svg` | 核对 | 句点是否仍为 `#AC512D` |
| `scripts/generate-og.mjs` | 小改 | 五个色值（P1 已完成） |
| `scripts/check-seo.mjs` | 中改 | 保留标签页校验；删除 guide 页校验 |
| `scripts/check-links.mjs` | 无需改 | 会自动发现断链 |
| `netlify.toml` / `vercel.json` / `public/_redirects` | 小改 | 新增 2 条 301；移除 `/fonts/*` 头；`/pagefind/*` 头仅 netlify 存在 |
| `03-ui-design/design-system.md`、`page-designs.md` | 升版 | 标注 v2 取代关系 |

### 11.4 风险与对策

| 风险 | 对策 |
| --- | --- |
| 301 漏配导致旧链接 404 | P2 完成后 `curl -I`；`check-links` 覆盖内链；上线后看 GSC 的 404 报告 |
| 删除 guide 页损失长尾流量 | 迁移前导出数据；301 到 `/about` 合并权重；4 周后评估 |
| `check-seo.mjs` 因 guide 逻辑失败 | 与删除同一次提交内更新脚本 |
| Pagefind 残留引用 | 全局 grep `pagefind`、`Search`、`data-search`；同时检查 CSP 与缓存头 |
| 系统字体导致行宽变化 | 用 `ch` 限宽 + 字体栈固定顺序；Windows/macOS 双端截图验收 |
| 中文回退到 SimSun 观感偏旧 | 标题允许（宋体适合标题），正文用 sans 栈避开 SimSun；中文长文再调 1.8 行高 |
| 主题脚本导致首帧闪烁 | 初始化必须内联在 `<head>` 末尾；`data-theme` 在绘制前写好；禁用 JS 时退回浅色 |
| 标签页重新变成薄内容 | 继续用 `MIN_POSTS_FOR_INDEX` 与 sitemap 过滤；标签索引页只做入口，不做 pillar |
| 首页过于朴素 | 通过字号对比、列表节奏与唯一的订阅色带建立层次，不再加组件 |
| OG 与站点不一致 | P1 已同步色值；P4 重新生成；OG 使用系统 Georgia/Courier，不依赖浏览器字体 |
| 删掉搜索后读者找不到文章 | 归档页按年份全量列出 + 标签索引；文章数量增长到 50+ 时再评估静态索引方案 |

### 11.5 边界

- P1 已改：`src/styles/global.css`、`src/components/BaseHead.astro`、`scripts/generate-og.mjs`，并删除 `public/fonts/`。
- 不改 URL 中的文章 slug、不改 frontmatter schema、不改 RSS/sitemap 规则。
- 不新增页面、组件、字体、图片、依赖。
- 不重写文章内容；仅允许在迁移时调整 `404`、页脚与关于页的少量文案。
- 不实现中文文章的 `lang` 切换（只记录约束）。

---

## 12. 决策记录

| # | 决策 | 结论 | 落地位置 |
| --- | --- | --- | --- |
| 1 | 订阅：删除还是保留？ | **保留**：保留 `/newsletter` 页、首页色带与页脚入口 | §3.2、§7.2、§7.8、§8.6 |
| 2 | 标签：降级为纯文本还是保留页面？ | **保留**：`/tags` 索引与 `/tags/[tag]` 归档都在，文章页标签可点 | §3.1、§7.6、§7.7、§8.7 |
| 3 | 主题：只跟随系统还是手动切换？ | **手动切换**：默认跟随系统，用户选择持久化 | §4.1、§8.8 |
| 4 | guide 摘要在删除页面后去哪？ | **并入 `/about`** 的 “Start here”，不做编号样式 | §7.5 |

**仍待确认**（不影响 P1）：

| # | 待定项 | 当前倾向 |
| --- | --- | --- |
| A | 页脚是否也放 Newsletter 入口，还是只放 RSS/Email？ | 放，保持三处入口一致 |
| B | 标签页是否在主导航保留 `Tags`，还是只在归档页给 `All tags →`？ | 主导航保留；移动端菜单同步 |
| C | 订阅 endpoint 仍未配置，mailto 降级是否可接受？ | 可接受，先上线再加 endpoint |

---

## 附：Token 摘要

P1 已替换色值、字体栈与少量装饰（点阵纹理、页头模糊、导语斜体）。P3 未强制把 `--fs-*` 改名为 `--text-*`，实现沿用 `--fs-*`，数值与下表一致；字体 token 实际命名为 `--font-display` / `--font-body` / `--font-mono`。

```css
:root {
  color-scheme: light;
  --bg: #FBFAF7;          --bg-raised: #F4F2EC;
  --ink: #1C1B18;         --ink-soft: #46443D;      --ink-faint: #6E6A60;
  --rule: #D9D5CB;        --control-border: #8B8679;
  --accent: #AC512D;      --accent-wash: #F5ECE7;
  --code-bg: #1B1A17;     --code-ink: #ECE9E1;    --focus: #1F5FA8;
  --band-bg: #1C1B18;     --band-ink: #FBFAF7;    --band-ink-soft: #B9B4A8;
  --band-rule: #3A3831;

  --font-display: Georgia, "Times New Roman", "Songti SC", "STSong", "SimSun",
                "Noto Serif CJK SC", serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
               Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas,
               "Courier New", "Liberation Mono", monospace;

  --text-xs: 0.8125rem;   --text-sm: 0.9375rem;  --text-base: 1.0625rem;
  --text-lead: 1.1875rem; --text-h3: 1.375rem;   --text-h2: 1.6875rem;
  --text-h1: clamp(1.875rem, 3.4vw, 2.5rem);
  --text-display: clamp(2.125rem, 5vw, 3rem);

  --space-1: 8px;  --space-2: 16px; --space-3: 24px; --space-4: 32px;
  --space-5: 48px; --space-6: 64px; --space-7: 96px;

  --container: 720px; --measure: 66ch; --header-h: 56px;
  --ease: ease-out;
}

html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #141311;        --bg-raised: #211F1B;
  --ink: #ECE9E1;       --ink-soft: #B9B4A8;    --ink-faint: #9A9487;
  --rule: #37342E;      --control-border: #767065;
  --accent: #E58A64;    --accent-wash: #3A211A;
  --code-bg: #0B0A09;   --code-ink: #ECE9E1;   --focus: #8CBEF5;
  --band-bg: #2A251F;   --band-ink: #ECE9E1;   --band-ink-soft: #B9B4A8;
  --band-rule: #3F3830; --band-border: #4A4439;
}
```

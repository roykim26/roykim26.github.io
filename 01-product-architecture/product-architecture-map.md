# 产品架构图（当前实现版）

> 依据 v1.0.0 实际代码与构建产物整理，不是规划稿。
> 现状：22 个预渲染 HTML 页面 + 10 篇英文长文，构建约 2 秒，纯静态部署，无服务端。

---

## 0. 一页总览

```
┌──────────────────────────────────────────────────────────────────────┐
│  读者（海外英文读者 / RSS 阅读器 / 搜索引擎 / 社交平台）              │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼──────────────────────────────────────┐
│  接入层    CDN / 静态托管（Cloudflare Pages · Vercel · Netlify ·      │
│            GitHub Pages · Docker + Nginx）                            │
│            安全头 · 缓存策略 · 无扩展名 URL 映射 · 301 重定向          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ 读取 dist/ 静态文件
┌───────────────────────────────▼──────────────────────────────────────┐
│  站点层    22 个预渲染页面（首页 / 归档 / 文章 / 标签 / About /       │
│            Newsletter / 404）+ RSS + Sitemap + robots.txt             │
│            导航：Writing · Tags · About                               │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ 构建期注入
┌───────────────────────────────▼──────────────────────────────────────┐
│  内容层    src/content/blog/*.md（10 篇）+ frontmatter（Zod 校验）     │
│            站点身份与开关：src/lib/site.ts                            │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ 构建时消费
┌───────────────────────────────▼──────────────────────────────────────┐
│  构建层    Astro 5（静态渲染）→ 页面 HTML/CSS                         │
│            prebuild：Sharp 生成 OG 图                                 │
│            postbuild：Pagefind 建索引                                 │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ 产物 dist/
┌───────────────────────────────▼──────────────────────────────────────┐
│  运营层    Search Console / Bing · RSS 订阅 · 邮件订阅（可选）·       │
│            社交分享卡片 · 无追踪分析                                   │
└──────────────────────────────────────────────────────────────────────┘
```

一句话概括：**内容是一堆带 frontmatter 的 Markdown，构建期被 Astro 编译成静态 HTML，OG 图与搜索索引也在构建期生成，部署只需要托管 `dist/` 目录。**

---

## 1. 信息架构与栏目

站点只有三个一级栏目，全部围绕"读文章"这一件事：

```
/ 首页
├── /blog                     写作归档（全部文章，按年份分组）
│   └── /blog/<slug>          文章详情 ×10
├── /tags                     标签总览（6 个标签，共 18 条标签关系）
│   ├── /tags/architecture    ×3 篇
│   ├── /tags/performance     ×2 篇
│   ├── /tags/engineering     ×6 篇
│   ├── /tags/devops          ×2 篇
│   ├── /tags/career          ×3 篇
│   └── /tags/writing         ×2 篇
├── /about                    作者、写作范围、联系方式、Colophon
├── /newsletter               订阅说明（表单 / 邮件降级）
└── /404                      错误页（返回 Writing / Tags / Home）

非页面产物（同样进 dist/）
├── /rss.xml                  全文 RSS 2.0
├── /sitemap-index.xml        站点地图
├── /robots.txt               抓取规则 + sitemap 引用
└── /og/<slug>.png            每篇文章的 1200×630 分享图 ×10 + 默认图 ×1
```

**页面数量核对**：首页 1 + 归档 1 + 文章 10 + 标签总览 1 + 标签页 6 + About 1 + Newsletter 1 + 404 1 = **22 个 HTML**，与构建日志一致。

导航模型只有三项（`src/lib/site.ts` 的 `nav`）：

| 导航项 | 目标 | 为什么没有更多 |
| --- | --- | --- |
| Writing | `/blog` | 站点主体就是文章归档 |
| Tags | `/tags` | 唯一的第二种浏览方式，避免"分类 + 标签"双体系 |
| About | `/about` | 承载作者身份与联系方式 |

没有"首页"导航项——站点名本身即回首页；没有下拉菜单、没有面包屑，因为层级只有两层。

---

## 2. 页面与内容类型

### 2.1 三类内容，来源不同

```
内容类型                 来源                          是否进 RSS/搜索
─────────────────────────────────────────────────────────────────────
Essay（文章）            src/content/blog/*.md        是
Page（固定页）           src/pages/*.astro（手写）     否（About / Newsletter）
Generated（构建产物）    src/pages/rss.xml.ts 等        —

Article（文章）          Collection: blog             是
                        schema 见 src/content.config.ts
                        → draft 为 true 时全链路过滤
```

### 2.2 页面清单与职责

| 路由 | 源文件 | 使用布局 | 关键组件 | 主要数据 |
| --- | --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | `BaseLayout` | `PostRow`、`Subscribe` | 精选 1 篇 + 最新 3 篇 + 前 6 个标签 |
| `/blog` | `src/pages/blog/index.astro` | `BaseLayout` | `PostRow`、搜索触发按钮 | 全部文章，按年份分组 |
| `/blog/<slug>` | `src/pages/blog/[slug].astro` | `PostLayout` | `TableOfContents`、`ShareRow`、`Subscribe` | 单篇正文 + 同标签相关文章 |
| `/tags` | `src/pages/tags/index.astro` | `BaseLayout` | `TagPill` | 标签及计数 |
| `/tags/<tag>` | `src/pages/tags/[tag].astro` | `BaseLayout` | `PostRow` | 该标签下的文章 |
| `/about` | `src/pages/about.astro` | `BaseLayout` | — | `site.author` |
| `/newsletter` | `src/pages/newsletter.astro` | `BaseLayout` | — | `site.newsletter` |
| `/404` | `src/pages/404.astro` | `BaseLayout` | — | 静态文案 |
| `/rss.xml` | `src/pages/rss.xml.ts` | — | — | 全部文章全文（`marked` 转 HTML） |
| `/robots.txt` | `src/pages/robots.txt.ts` | — | — | 构建期写入 sitemap 地址 |

所有内容页共享的外壳：`BaseLayout` 负责 `<html lang="en">`、跳转链接、`Header`、`<main>`、`Footer`、`Search`；`BaseHead` 只输出 `<head>` 内的元信息。

---

## 3. 内容生产与发布链路

```
作者
 │  1. 新建 src/content/blog/<slug>.md
 │     frontmatter: title / description / pubDate / tags / featured / draft
 ▼
本地校验
 │  2. npm run dev → 浏览器检查排版、目录、代码块、内链
 │  3. draft: false 后 npm run build
 ▼
构建（Astro）
 │  ├─ Zod 校验 frontmatter，字段缺失或类型错 → 构建失败
 │  ├─ 过滤 draft: true（列表 / RSS / sitemap / 搜索均不含）
 │  ├─ 渲染 22 个 HTML 页面
 │  ├─ prebuild：scripts/generate-og.mjs → public/og/<slug>.png
 │  └─ 构建后：pagefind --site dist → dist/pagefind/
 ▼
质量门禁
 │  ├─ npm run check        类型与模板
 │  ├─ npm run test:links   638 处内部链接与锚点
 │  └─ npm run test:seo     22 页 title/desc/canonical/OG/JSON-LD/sitemap/RSS/robots
 ▼
Git push → CI（GitHub Actions）
 │  ci.yml：同样的五步 + 归档 site-dist
 │  deploy-pages.yml：GitHub Pages 专用发布
 ▼
托管平台构建 → CDN
 │  Cloudflare Pages / Vercel / Netlify 按各自配置构建并发布
 ▼
读者
   页面 · RSS · 邮件（若配置端点）· 搜索结果 · 社交卡片
```

发布链路的两个关键规则：

1. **草稿只有一处开关**：`draft: true` 即从所有出口消失，不需要删文件。
2. **新增文章零代码改动**：文件名即 URL，标签来自 frontmatter，OG 图与搜索索引自动生成。

---

## 4. 技术架构

### 4.1 分层

```
┌─ 框架层 ─────────────────────────────────────────────────────────────┐
│ Astro 5 · output: static · build.format: 'file' · trailingSlash: never│
│ 无 UI 框架、无客户端路由、无 SSR                                      │
└──────────────────────────────┬───────────────────────────────────────┘
┌─ 内容层 ─────────────────────▼───────────────────────────────────────┐
│ Content Collections（glob loader）                                    │
│ src/content.config.ts → Zod schema                                    │
│ src/lib/posts.ts → getPosts / collectTags / groupByYear / readingTime │
│ src/lib/site.ts → 站点身份、导航、订阅开关、绝对 URL 生成              │
└──────────────────────────────┬───────────────────────────────────────┘
┌─ 渲染层 ─────────────────────▼───────────────────────────────────────┐
│ Layouts: BaseLayout（文档外壳）· PostLayout（文章页）                 │
│ Components: Header / Footer / BaseHead / PostRow / TagPill /          │
│             TableOfContents / ShareRow / Subscribe / Search            │
│ 路由即文件：src/pages/**                                              │
└──────────────────────────────┬───────────────────────────────────────┘
┌─ 样式层 ─────────────────────▼───────────────────────────────────────┐
│ src/styles/global.css（单文件，约 29 KB）                             │
│ 设计 token → reset → base → layout → chrome → components → prose      │
│ 亮/暗主题：:root 与 [data-theme="dark"] 两套变量                       │
│ 字体：Instrument Serif / Newsreader / JetBrains Mono（自托管 woff2）   │
└──────────────────────────────┬───────────────────────────────────────┘
┌─ 构建期工具 ─────────────────▼───────────────────────────────────────┐
│ scripts/generate-og.mjs   Sharp + SVG 模板 → 1200×630 PNG             │
│ pagefind --site dist      全文索引 + 分片                             │
│ @astrojs/sitemap          sitemap-index.xml                           │
│ @astrojs/rss + marked     全文 RSS                                    │
└──────────────────────────────┬───────────────────────────────────────┘
┌─ 客户端增强 ─────────────────▼───────────────────────────────────────┐
│ 全部内联，约 6 KB，渐进增强：                                         │
│ 主题切换（localStorage）· 阅读进度（rAF）· 目录高亮（IntersectionObserver）│
│ 标签筛选（DOM 显隐）· 复制链接 · Ctrl/Cmd+K 搜索（按需加载 Pagefind）  │
│ 禁用 JS：所有正文与导航仍可读，仅失去上述增强                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 路由与 URL 形态

`build.format: 'file'` 让每个页面输出为 `xxx.html`，配合 `trailingSlash: 'never'` 得到无扩展名、无尾斜杠的 URL：

```
src/pages/index.astro            →  dist/index.html              →  /
src/pages/blog/index.astro       →  dist/blog.html               →  /blog
src/pages/blog/[slug].astro      →  dist/blog/<slug>.html        →  /blog/<slug>
src/pages/tags/[tag].astro       →  dist/tags/<tag>.html         →  /tags/<tag>
```

代价是托管方必须支持无扩展名映射。当前五种部署方式均已处理：Nginx `try_files $uri $uri.html $uri/ =404`、Vercel `cleanUrls`、Netlify/Cloudflare 的 `_redirects`、GitHub Pages 原生支持、Astro 预览服务器原生支持。

### 4.3 数据流（一次构建）

```
site.ts ─────────────┐
                     ├──► 每个页面的 <head>（canonical / OG / JSON-LD）
content/blog/*.md ───┤
  (frontmatter+body) ├──► 列表页（排序、分组、标签计数）
                     ├──► 文章页（正文 → HTML、目录、相关文章）
                     ├──► rss.xml（全文）
                     ├──► sitemap（绝对 URL）
                     ├──► OG 图（标题 + 标签 + 日期 → PNG）
                     └──► Pagefind 索引（从 dist HTML 反向抓取）
```

一个值得注意的闭环：**Pagefind 索引的是构建后的 HTML，不是 Markdown**。所以任何让 HTML 结构异常的改动（例如内容被渲染到 `</html>` 之外）都会让搜索静默失效，构建日志中的 `Indexed 22 pages` 是必须核对的信号。

### 4.4 主题与设计系统

```
设计 token（global.css 顶部）
├── 颜色：--bg / --ink / --ink-soft / --rule / --accent / --focus …
├── 字体：--font-display / --font-body / --font-mono
├── 尺寸：--container 1120px / --measure 68ch
└── 主题：[data-theme="dark"] 覆盖同名变量，其余样式不重复

页面结构
├── 单列正文（measure 控制行宽）
├── 文章页双栏：正文 + 目录（窄屏目录收起）
└── 装饰元素：编号、细分隔线、单色块（无阴影、无渐变）
```

主题切换只改 `documentElement.dataset.theme` 并写入 `localStorage`；首屏主题由 `<head>` 内联脚本在 CSS 之前设置，避免闪烁。

---

## 5. 外部依赖与运营支撑

### 5.1 依赖清单

| 依赖 | 用途 | 是否必需 | 缺失时的表现 |
| --- | --- | --- | --- |
| 静态托管平台 | 提供 HTTPS、CDN、构建 | 必需（上线） | 只能本地 `preview` |
| 域名 + DNS | 规范 URL、canonical | 必需（正式上线） | 只能用平台预览域名 |
| Google Search Console | 收录与搜索表现 | 建议 | 无法知道收录状态 |
| Bing Webmaster Tools | 补充索引来源 | 可选 | 少一个流量入口 |
| 邮件服务商（Buttondown 等） | Newsletter 订阅 | 可选 | 表单降级为 `mailto:`，页面不报错 |
| 社交平台 | 分享与传播 | 可选 | 分享卡片仍可生成，只是没有传播渠道 |
| Google Fonts | — | **已移除** | 字体已自托管，无外部请求 |
| npm 依赖（4 个运行时） | astro / rss / sitemap / marked | 必需（构建） | 无法构建 |

### 5.2 运营支撑视图

```
                        ┌────────────────────┐
        写作 ──────────►│  Git 仓库（内容源） │
                        └─────────┬──────────┘
                                  │ push
                        ┌─────────▼──────────┐
                        │ CI：check/build/   │
                        │ links/seo 四道门禁 │
                        └─────────┬──────────┘
                                  │ 通过
                        ┌─────────▼──────────┐
                        │ 托管平台构建 + CDN │
                        └─────────┬──────────┘
              ┌───────────────────┼────────────────────┐
              ▼                   ▼                    ▼
      ┌──────────────┐   ┌───────────────┐   ┌────────────────┐
      │ 读者直接访问 │   │ RSS 阅读器    │   │ 搜索引擎抓取   │
      └──────────────┘   └───────────────┘   └────────────────┘
              │                   │                    │
              └───────────────────┴────────────────────┘
                                  │
                        ┌─────────▼──────────┐
                        │ 反馈：邮件 / 提及  │
                        └────────────────────┘
```

**刻意不在图里的东西**：数据库、账号系统、评论服务、分析脚本、A/B 实验、服务端 API。它们不是"待补"，而是 v1 的明确边界——每增加一项，都会把静态站点变成需要运维的系统。

### 5.3 分析能力现状

无客户端追踪。可获得的信号只有：Search Console 的曝光/点击/收录、邮件服务商的订阅数、RSS 订阅数（若接入统计）、以及真实邮件回复。这意味着无法回答"某篇文章的停留时长"，但能回答"哪些问题带来了读者"。取舍记录在 `07-launch-operations/analytics-and-growth.md`。

---

## 6. 架构约束（改代码前必须知道）

| 约束 | 具体表现 | 影响 |
| --- | --- | --- |
| 纯静态 | 无服务端、无运行时环境变量 | 所有配置在构建时固化，改域名必须重建 |
| URL 无扩展名 | `format: 'file'` + `trailingSlash: 'never'` | 新托管平台必须支持无扩展名映射 |
| 绝对 URL 构建期生成 | canonical / RSS / sitemap / OG 均依赖 `site.url` | 域名写错 → 全站 SEO 元信息错 |
| 草稿统一过滤 | 所有查询走 `getPosts()` | 绕过 `src/lib/posts.ts` 直接读 collection 会漏掉 draft 过滤 |
| 样式单文件 | 一个 CSS 约 29 KB | 改 token 会全局生效，需回归亮/暗两套主题 |
| 字体自托管 | `public/fonts/*.woff2` | 新增字重需重新生成静态实例并更新 `@font-face` |
| 搜索依赖构建后 HTML | Pagefind 从 `dist/` 抓取 | HTML 结构异常会导致索引为 0 |

---

## 7. 变更影响面速查

| 你改了什么 | 会波及 | 必须复验 |
| --- | --- | --- |
| 文章 Markdown | 该文章页、归档、标签页、RSS、sitemap、OG 图、搜索索引 | `build` + `test:links` |
| 文章 frontmatter | 列表排序、标签计数、相关文章、SEO 描述 | `build` + `test:seo` |
| 导航项（Header） | 所有页面 | `test:links` + 浏览器 |
| `site.url` | canonical、OG、RSS、sitemap、JSON-LD | `build` + `test:seo` |
| `global.css` token | 全部页面、亮/暗主题 | 浏览器 + Lighthouse |
| 字体文件 | 全站排版、首屏性能 | Lighthouse |
| 新增页面路由 | 页面数、sitemap、内链 | 四项门禁全跑 |
| 部署平台 | URL 映射、缓存头、重定向 | 部署后冒烟测试 |

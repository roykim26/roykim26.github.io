# 变更记录

> 阶段 4 · 记录方式遵循 Keep a Changelog 的结构，版本号用于标记可发布的构建点

## [1.0.0] — 2026-11-13

首个可发布版本。22 个静态页面，10 篇英文长文，全流程文档齐备。

### 新增

**站点骨架**

- Astro 5 静态构建（`output: static`、`build.format: 'file'`、`trailingSlash: 'never'`）
- Content Collections + `glob` loader，Zod 校验 frontmatter（`title`、`description`、`pubDate`、`tags`、`featured`、`draft`、可选 `updatedDate`）
- 布局与组件：`BaseLayout`、`PostLayout`、`Header`、`Footer`、`BaseHead`、`PostRow`、`TagPill`、`TableOfContents`、`ShareRow`、`Subscribe`、`Search`

**页面**

- `/` 首页：首屏主张、精选文章、最新 3 篇、Topics、订阅区
- `/blog` 文章归档：年份分组、标签筛选、搜索入口、结果计数
- `/blog/<slug>` 文章页：目录、阅读进度、分享、相关文章、结构化数据
- `/tags` 与 `/tags/<tag>`：标签总览与筛选列表
- `/about`、`/newsletter`、`/404`
- `/rss.xml`、`/robots.txt`、sitemap（`@astrojs/sitemap`）

**设计系统**

- `src/styles/global.css` 手写 token 化样式（paper/ink 编辑风），亮暗双主题
- 字体：Instrument Serif（标题）、Newsreader（正文）、JetBrains Mono（元信息），自托管 woff2 静态实例
- 响应式断点 900px：主导航折叠为原生 `<details>` 汉堡菜单

**内容**

- 10 篇英文文章（950–1,200 词），覆盖 architecture / performance / engineering / devops / career / writing
- 每篇自动生成 1200×630 OG 图（Sharp + SVG 模板，标题自动换行）

**交互增强（渐进增强，禁用 JS 不影响阅读）**

- 主题切换（`localStorage` + head 内联预置，避免闪烁）
- 阅读进度条（rAF 节流）
- 目录滚动高亮（IntersectionObserver）
- 归档页标签即时筛选（含 `aria-live` 播报）
- Ctrl/Cmd+K 搜索（Pagefind，按需加载）
- 复制链接

**工程与质量**

- `scripts/generate-og.mjs`：`prebuild` 自动生成 OG 图
- `scripts/check-links.mjs`：616 处内部链接与锚点校验
- `scripts/check-seo.mjs`：22 页 title/description/canonical/OG/JSON-LD/sitemap/RSS/robots 审计
- GitHub Actions：`ci.yml`（check → build → 链接 → SEO → 产物归档）、`deploy-pages.yml`
- 部署配置：`Dockerfile` + `nginx.conf`、`netlify.toml`、`vercel.json`、`public/_headers`、`public/_redirects`

### 修复

- 内容被渲染到 `</html>` 之后（`BaseHead` 与 `BaseLayout` 重复输出文档外壳）
- `rss.xml.ts` 中 `language` 字段类型错误
- 3 处 SEO 标题长度不足或重复（About、Tags、单标签页）
- `/newsletter` 降级文案暴露源码路径
- 文章页 Speed Index 8.4 s（Google Fonts 阻塞 + 可变字体过大）
- Markdown 任务列表 checkbox 无障碍违规（7 处）

### 性能

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 首页 Lighthouse Performance | — | 100 |
| 文章页 Lighthouse Performance | 91 | 99 |
| 文章页 Speed Index | 8.4 s | 1.7 s |
| 文章页总传输量 | 340 KiB | 149 KiB |
| 文章页 Accessibility | 96 | 100 |

### 已知限制

- 订阅端点未接入（`newsletter.endpoint` 为空时降级为 `mailto:`）
- 站点内容仅英文
- 未做视觉回归自动化
- Lighthouse 未纳入 CI 门禁

## 版本约定

| 版本 | 含义 |
| --- | --- |
| `1.0.0` | 首次发布：内容、设计、部署产物齐备 |
| `1.x.0` | 新增功能或页面（如评论、多语言） |
| `1.x.y` | 文案修正、样式微调、依赖补丁 |
| `vYYYY.MM.DD` | 可选的内容发布 tag，便于回滚到某次上线 |

发布时建议同时打两个 tag：语义版本（代码状态）与日期版本（内容状态）。

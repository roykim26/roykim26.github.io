# 技术架构

> Stage 1 · v1.0 · Implementation lives in the repository root (`src/`, `public/`, `scripts/`).

## 1. 一句话架构

一个**完全静态、内容优先的 Astro 站点**：Markdown 存放在 git 中，构建时生成 HTML，无服务器、无数据库、无运行时密钥，可部署到任何静态托管平台。

```
┌──────────────────────────── repository ────────────────────────────┐
│  src/content/blog/*.md  ──►  Content Collection (type-safe schema) │
│            │                                                       │
│            ├──► src/pages/blog/[slug].astro   → /blog/<slug>       │
│            ├──► src/pages/blog/index.astro    → /blog              │
│            ├──► src/pages/tags/[tag].astro    → /tags/<tag>        │
│            ├──► src/pages/rss.xml.ts          → /rss.xml           │
│            └──► scripts/generate-og.mjs       → /og/<slug>.png     │
│                                                                    │
│  astro build  ──►  dist/ (static HTML/CSS/JS, Pagefind index)      │
└────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  CDN / static host │  Cloudflare Pages · Vercel ·
                    │  (HTTPS, HTTP/2/3) │  Netlify · GitHub Pages
                    └────────────────────┘
```

## 2. 技术栈决策

| 层级 | 选择 | 原因 |
| --- | --- | --- |
| 框架 | **Astro 5**（SSG，`output: 'static'`） | 内容优先、islands 架构、默认零 JS、出色的 Core Web Vitals |
| 语言 | **TypeScript**（strict） | frontmatter schema 和辅助类型可在构建时捕获内容错误 |
| 内容 | **Astro Content Collections** + `glob` loader | 类型化 frontmatter、构建时校验、不依赖 CMS |
| 样式 | **手写 CSS** + 自定义属性 | 完全掌控编辑式视觉；没有 utility 类堆积；载荷极小 |
| 搜索 | **Pagefind**（构建时索引） | 静态、快速、无需服务；完全在浏览器中运行 |
| Feed | `@astrojs/rss` | 符合标准、包含全文的 RSS 2.0 |
| Sitemap | `@astrojs/sitemap` | 自动生成 `sitemap-index.xml`，排除生成的 OG 资源 |
| OG 图片 | **Sharp** + SVG 模板脚本 | 每篇文章生成真实的 1200×630 PNG，在 `prebuild` 阶段完成 |
| 语法高亮 | Shiki（随 Astro 内置） | 准确，无客户端运行时 |
| 图片处理 | Astro assets / `sharp` | 响应式尺寸、显式尺寸（无 CLS） |
| 托管 | 静态 CDN（首选 Cloudflare Pages） | 免费额度、全球边缘节点、即时回滚、预览环境 |
| CI | GitHub Actions | 构建、类型检查、SEO/链接守卫、产物上传 |
| 分析 | 隐私优先、需主动开启（Plausible/Cloudflare Web Analytics） | 无 Cookie 横幅、无 PII |

## 3. 渲染与 JS 预算

- **默认：** 每个页面都是预渲染的 HTML。没有水合的框架 islands。
- **仅做渐进增强：**
  - 主题切换（`localStorage`，内联的绘制前脚本防止闪烁）。
  - 阅读进度条（滚动监听、`requestAnimationFrame`）。
  - 目录 scroll-spy（`IntersectionObserver`）。
  - 移动端菜单（原生 `<details>` 或极少量 JS）。
  - 搜索：**仅**在读者聚焦/打开搜索时加载 Pagefind UI JS。
  - 复制链接按钮（`navigator.clipboard`，优雅降级）。
- **预算：** 任何内容页面的第一方 JS ≤ 12 KB（gzip 后）；Pagefind 资源不计入，因为它们按交互加载。阅读本身不需要任何 JS。

## 4. 目录布局

```
.
├── 01-product-architecture/ … 07-launch-operations/   # lifecycle documents
├── src/
│   ├── components/        Header, Footer, PostCard, TagPill, TOC, Share, Subscribe, Search
│   ├── layouts/           BaseLayout, PostLayout
│   ├── pages/             routes (index, blog, tags, about, newsletter, rss, robots, 404)
│   ├── content/blog/      Markdown essays
│   ├── content.config.ts  collection schema
│   ├── lib/               site config, post queries, formatting, reading time
│   └── styles/            global.css (tokens, base, components, prose, print)
├── public/                favicon, static assets, generated OG images
├── scripts/               generate-og, check-links, check-seo
├── astro.config.mjs
├── netlify.toml / vercel.json / Dockerfile / nginx.conf
└── .github/workflows/ci.yml, deploy-pages.yml
```

## 5. 构建流水线

```
npm ci
  └─ prebuild: node scripts/generate-og.mjs   (reads frontmatter, writes public/og/*.png)
  └─ astro build                               (validates schema, renders routes, bundles CSS)
  └─ pagefind --site dist                      (writes /pagefind index into dist)
  └─ postbuild checks: links, SEO invariants   (CI)
  └─ artifact: dist/                           (~1–2 MB HTML/CSS + images)
```

确定性构建：除依赖安装外，构建时没有任何网络调用。Google Fonts 在运行时引用，并提供系统字体回退；站点离线时仍然完全可读。

## 6. 性能策略

| 指标 | 目标 | 实现机制 |
| --- | --- | --- |
| LCP | < 1.2s（4G） | 静态 HTML、系统字体首屏渲染、不依赖 hero 图片 |
| CLS | < 0.02 | 预留图片尺寸、字体 `size-adjust` 回退、无后注入横幅 |
| INP | < 100ms | 极少量 JS、passive 监听器、无重型水合 |
| TTFB | < 100ms | CDN 边缘缓存、不可变资源 |
| 页面重量 | < 150 KB（不含图片） | 无框架、手写 CSS、每种角色只用一个字体族 |

## 7. 安全与隐私

- 无服务端代码、无数据库、无 Cookie → 攻击面极小。
- 在边缘设置严格的安全响应头（`netlify.toml`、`_headers`）：CSP（self + 字体 + Astro 所需的内联样式）、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`、`X-Frame-Options`、HSTS。
- 默认不加载任何第三方脚本。分析功能需主动开启且不使用 Cookie。
- 邮件表单提交到配置好的 newsletter 服务商；端点按设计公开，垃圾提交由服务商处理。本仓库不存储任何 PII。
- 密钥绝不进入仓库；部署仅使用托管平台侧的环境变量。

## 8. 可靠性与可观测性

- 可用性交给 CDN；没有源站需要监控。
- CI 是质量闸门：schema 校验、类型检查、链接/SEO 检查，构建失败即阻止部署。
- 部署后冒烟测试：请求 `/`、`/blog`、一篇文章、`/rss.xml`、`/sitemap-index.xml`，全部必须返回 200 且包含预期标记。
- 回滚 = 重新部署上一个不可变构建（托管平台控制台或 `git revert`）。

## 9. 可扩展性

在相同架构下，内容可以扩展到数千篇文章；目前完整重建只需数秒。如果构建时间超过约 3 分钟，文档中给出的路径是在托管平台使用增量构建/按需重新验证，而不是引入运行时服务器。搜索索引大小是唯一实际的限制，而 Pagefind 能处理数千个文档。

## 10. 约束与假设

- Node ≥ 20.11，npm ≥ 10。除 `sharp`（预编译二进制）外没有原生运行时依赖。
- 域名、分析服务和 newsletter 服务商的凭据**不在**仓库中；占位配置记录在第 6/7 阶段文档中。即使没有这些，站点也能完整运行。
- 字体：Google Fonts CDN，配合本地回退字体栈；如果 CDN 被屏蔽，设计会降级为 Georgia/system-ui，但布局不会破坏。

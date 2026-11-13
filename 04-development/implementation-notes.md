# 开发实现说明

> 阶段 4 · v1.0 · 对应代码：仓库根目录 `src/`、`scripts/`、`astro.config.mjs`

## 1. 实现目标与结果

按阶段 1–3 的方案，落地为一个可构建、可部署的静态 Astro 站点：

- 22 个静态页面：首页、文章索引、10 篇文章、标签索引、6 个标签页、About、Newsletter、404。
- 全文 RSS、sitemap、robots.txt、每篇文章独立 OG 分享图。
- Pagefind 全文搜索（构建期索引，交互时加载）。
- 亮/暗主题、阅读进度、目录滚动高亮、标签即时筛选、复制链接、移动端菜单。
- 构建产物约 2 MB 以内（含搜索索引），首屏无客户端框架。

## 2. 目录与职责

| 路径 | 职责 |
| --- | --- |
| `src/content.config.ts` | Content Collection 定义，Zod 校验 frontmatter |
| `src/content/blog/*.md` | 10 篇英文文章，唯一内容源 |
| `src/lib/site.ts` | 站点身份、域名、邮箱、社交、订阅端点等集中配置 |
| `src/lib/posts.ts` | 文章查询、阅读时长、标签聚合、相关文章、前后篇、按年分组 |
| `src/components/BaseHead.astro` | title/description/canonical/OG/Twitter/JSON-LD/字体/主题预置脚本 |
| `src/layouts/BaseLayout.astro` | 文档外壳、跳转链接、Header/Footer、搜索弹窗 |
| `src/layouts/PostLayout.astro` | 文章版式、目录、分享、作者卡、前后篇、相关阅读、订阅区 |
| `src/pages/` | 路由与 RSS/robots 端点 |
| `src/styles/global.css` | 设计 token、组件、正文、响应式、打印样式 |
| `scripts/generate-og.mjs` | prebuild 生成 1200×630 PNG |
| `scripts/check-links.mjs` | 构建后内部链接与锚点检查 |
| `scripts/check-seo.mjs` | 构建后 SEO 不变量检查 |

## 3. 渲染与数据流

```
Markdown → Content Collection（Zod 校验）→ getPosts()（过滤 draft、按日期倒序）
        ├→ index.astro（featured + 最新 3 篇 + 标签）
        ├→ blog/index.astro（按年分组 + 标签筛选 + 搜索入口）
        ├→ blog/[slug].astro → render() → PostLayout（正文 + headings 目录）
        ├→ tags/[tag].astro（按标签过滤）
        ├→ rss.xml.ts（marked 转 HTML 全文）
        └→ generate-og.mjs（读取 frontmatter 生成 PNG）
```

关键约定：

- `draft: true` 的文章在 `getPosts()` 中统一过滤，列表、标签页、RSS、sitemap、OG 均不可见。
- 文章 URL 为 `/blog/<slug>`，不包含日期；slug 即文件名。
- 所有页面在构建期完成渲染，无运行时数据请求。
- 站点 URL 只在 `src/lib/site.ts` 与 `astro.config.mjs` 两处维护。

## 4. 路由与构建格式

`astro.config.mjs` 使用：

- `build.format: 'file'`：输出 `about.html`、`blog/slug.html`，URL 不带末尾斜杠。
- `trailingSlash: 'never'`：canonical 与内链统一为无斜杠形式。
- `@astrojs/sitemap`：过滤 `/og/*` 与 `/404`。

托管平台需支持无扩展名 URL（Cloudflare Pages、Vercel、Netlify 默认支持；Nginx 通过
`try_files $uri $uri.html $uri/ =404` 实现）。

## 5. 客户端 JavaScript 清单

| 文件 | 功能 | 体积控制 |
| --- | --- | --- |
| `Header.astro` | 主题切换、aria-label 同步 | 极小，内联模块 |
| `PostLayout.astro` | 阅读进度（rAF + passive scroll） | 极小 |
| `TableOfContents.astro` | 目录滚动高亮 | 极小 |
| `ShareRow.astro` | 复制链接 + 状态提示 | 极小 |
| `blog/index.astro` | 标签即时筛选、Ctrl/Cmd+K 打开搜索 | 极小 |
| `Search.astro` | 按需加载 Pagefind UI | 仅在打开搜索时下载 |

无框架、无 hydration、无第三方统计脚本。禁用 JS 时：文章、导航、标签页、主题（跟随系统）
全部可用；搜索显示构建提示。

## 6. SEO 与社交分享实现

- `BaseHead.astro` 输出唯一 title/description/canonical/OG/Twitter 标签。
- 全站 JSON-LD：`WebSite` + `Person`；文章额外输出 `BlogPosting`（含 wordCount、keywords）。
- OG 图片：`scripts/generate-og.mjs` 在 `prebuild` 阶段读取 frontmatter，按标题长度自动
  换行与缩放，输出到 `public/og/<slug>.png` 与 `public/og-default.png`。
- RSS 使用 `marked` 输出全文，链接为绝对地址，`<language>en</language>`。
- 自动化守卫：`test:seo` 校验 title/description 长度、canonical 域名、OG 文件存在性、
  单 H1、JSON-LD 可解析、sitemap 不含 OG/404、RSS 含文章等。

## 7. 可访问性与渐进增强

- 文档顺序：跳转链接 → Header → main → Footer。
- 主题预置脚本在 `<head>` 内、样式之前执行，避免主题闪烁。
- 移动端菜单使用原生 `<details>`，无 JS 也可展开。
- 搜索使用原生 `<dialog>`，支持 Escape 关闭与焦点返回。
- 所有图标按钮有 `aria-label`，图标 `aria-hidden`。
- `prefers-reduced-motion` 下移除过渡与平滑滚动。
- 焦点环统一 2px，偏移 2px，任何组件都不移除 outline。

## 8. 性能预算与实测方法

| 项目 | 预算 | 说明 |
| --- | --- | --- |
| 首方 JS（内容页） | ≤ 12 KB gzip | 实际约 6–8 KB |
| CSS | ≤ 30 KB 未压缩 | 单文件，约 22 KB |
| LCP | < 1.2s（模拟 4G） | 文本优先，无首屏大图 |
| CLS | < 0.02 | 无迟注入元素；字体 `display=swap` |
| 页面数 | 22 | 构建约 2 秒 |

QA 阶段使用 Lighthouse 与浏览器实测，详见 `05-qa-testing/lighthouse.md`。

## 9. 已知取舍与后续可选项

| 取舍 | 原因 | 后续触发条件 |
| --- | --- | --- |
| 无评论 | 静态架构、无审核负担 | 持续有读者要求时评估 Giscus |
| 无 CMS | 单人写作、git 即版本历史 | 出现非技术协作者时接 Decap/Keystatic |
| 无分析 | 隐私优先、避免 cookie 横幅 | 上线后按需接入 Cloudflare Web Analytics |
| 站内搜索需构建 | Pagefind 为构建期索引 | 内容规模变大时评估按需索引 |
| 订阅端点为占位 | 缺外部账号凭据 | 拿到 provider endpoint 后填入 `site.ts` |

## 10. 本地验证清单

```bash
npm ci
npm run check
npm run build
npm run test:links
npm run test:seo
npm run preview
```

以上全部通过即达到开发阶段完成标准。构建失败时优先查看 Zod 报错中的文件名与字段名。

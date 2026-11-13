# 架构决策记录

> Stage 1 · Lightweight ADR log. Each record states context, decision, consequences, and
> the conditions that would make us revisit it.

---

## ADR-001 — 使用 Astro 做静态站点生成

**Status:** Accepted · 2026-11-13

**背景：** 本产品是一份个人出版物，内容基于文件且稳定，没有交互或个性化功能。需求是：优秀的 SEO、快速的首屏渲染、极低的维护成本、低成本、易于交接。

**决策：** 使用 Astro 5 的静态输出模式。所有路由在构建时预渲染。

**备选方案**

| 方案 | 不采用的原因 |
| --- | --- |
| Next.js（App Router） | 不需要 SSR/RSC 机制；客户端运行时更重；对内容站点来说活动部件太多 |
| Hugo | 速度极快，但模板对 TypeScript 类型化内容和自定义组件的使用体验较差 |
| WordPress | 需要 PHP 托管、数据库、插件维护和安全补丁；与“掌控平台、最小运维”相矛盾 |
| Eleventy | 可行；但内置资源流水线和内容集合的使用体验弱于 Astro |
| 手写 HTML | 没有内容流水线、没有 schema 校验、没有 RSS/OG 自动化 |

**后果：** 以近乎零 JS 获得一流的性能；内容 schema 错误会导致构建失败；没有服务端个性化。仅当动态功能（评论、账号、付费内容）成为核心时才重新评估——即便如此，也应作为 islands/服务添加，而不是替换内容层。

---

## ADR-002 — 以 git 中的 Markdown 作为 CMS

**Status:** Accepted · 2026-11-13

**背景：** 单一作者、频繁的小改动、熟悉 git、希望可移植并拥有完整历史记录。

**决策：** 文章是 `src/content/blog/` 下的 Markdown 文件。frontmatter 由 `src/content.config.ts` 中的 Zod schema 校验。发布 = 提交到 `main`。

**后果：** CMS 零成本、完整版本历史、编辑自由、备份简单。非技术协作者会感到困难；如果情况变化，可添加基于 git 的 CMS（Decap、Keystatic），写入同样的文件——无需迁移内容。

---

## ADR-003 — 手写 CSS 设计系统

**Status:** Accepted · 2026-11-13

**背景：** 站点需要独特的编辑式视觉（纸、墨、衬线展示字体、等宽元信息）和极小的载荷。一位开发者、一套设计语言、约 15 个组件。

**决策：** 单一 `global.css`，按 tokens → base → layout → components → prose → utilities 组织，使用 CSS 自定义属性，并通过 `[data-theme]` 实现 `light-dark()` 风格的主题切换。不使用 Tailwind，不使用 CSS-in-JS。

**备选方案：** Tailwind（迭代快，但标记冗长，若不深度定制则外观千篇一律）、每个组件独立的 CSS Modules（在这个规模下文件数量多于价值）、Sass（原生嵌套已足够）。

**后果：** CSS 总量约 20 KB（未压缩），无构建插件；命名需要纪律（类 BEM、按区块加前缀）。如果组件数量超过约 40 个，或第二位作者加入导致一致性下降，则重新评估。

---

## ADR-004 — 使用 Pagefind 做构建时搜索

**Status:** Accepted · 2026-11-13

**背景：** 读者需要按关键词查找文章。第三方搜索服务会增加成本、延迟、脚本依赖和隐私考量。内容量很小。

**决策：** 在 `postbuild` 阶段用 Pagefind 索引构建后的 HTML；仅在读者打开搜索时懒加载 UI 的 JS/CSS。提供无 JS 回退方案（`/blog` 完全可浏览且支持标签筛选）。

**后果：** 本地搜索亚 100 ms、无网络调用、无供应商锁定。索引会给部署产物增加约 1–2 MB，但不在关键路径上。如果内容超过数千篇文章且索引下载变得过重，则重新评估。

---

## ADR-005 — 与托管平台无关的静态部署

**Status:** Accepted · 2026-11-13

**背景：** 托管凭据尚不可用；所有者尚未选定供应商。应避免供应商锁定。

**决策：** 提供 Cloudflare Pages（首选）、Vercel、Netlify 和 GitHub Pages 的配置，以及 Docker+Nginx 自托管选项。不使用任何平台特有的运行时 API。`site` URL 集中在 `src/lib/site.ts` 和 `astro.config.mjs` 中。

**后果：** 部署只是改配置，不是重写。一些平台便利功能（边缘函数、图片 CDN）按设计不使用。仅当动态功能要求特定平台时才重新评估。

---

## ADR-006 — 隐私优先、主动开启的分析

**Status:** Accepted · 2026-11-13

**背景：** 站点需要知道哪些文章受欢迎，同时不能有 Cookie 横幅或损害信任与性能的监控式脚本。

**决策：** 默认不启用分析。为无 Cookie 分析（Cloudflare Web Analytics 或 Plausible）提供有文档记录的集成点，由配置开关控制，仅在所有者拥有账号并上线后才启用。

**后果：** 上线时没有同意横幅，也没有性能负担。指标仅为聚合数据（无漏斗）。如果转化归因成为业务关键，则重新评估。

---

## ADR-007 — 为每篇文章生成 Open Graph 图片

**Status:** Accepted · 2026-11-13

**背景：** 社交预览会显著影响来自 X、LinkedIn、Slack、HN 的点击率。图库图片过于泛化；手工制作图片对单一作者来说不可扩展。

**决策：** `scripts/generate-og.mjs` 为每篇文章渲染品牌化的 1200×630 SVG 模板（标题、标签、字标、日期），并在 `prebuild` 阶段用 Sharp 栅格化，输出到 `public/og/<slug>.png`。文章页面引用绝对 URL。

**后果：** 每次分享都显得经过设计、零手工操作、构建可确定复现。需要 Sharp（图片优化本来就需要）。如果希望在不改代码的情况下完成设计刷新，则重新评估——届时把模板移到数据文件。

---

## ADR-008 — v1 不做评论

**Status:** Accepted · 2026-11-13

**背景：** 评论意味着审核、垃圾处理、认证，以及数据库或第三方嵌入——这些都与静态、低运维的架构和“安静阅读”原则冲突。

**决策：** 上线时不带评论。用分享链接、邮件和 newsletter 回复作为对话渠道。

**后果：** 互动面更小、维护更少。6 个月后如果读者来信明确希望有公开讨论，则重新评估；优先考虑 Giscus（GitHub Discussions），而不是自建认证。

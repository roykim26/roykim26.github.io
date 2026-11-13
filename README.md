# Jin Lo — Engineering Notes

面向海外读者的英文个人技术博客。静态生成、零后端、以阅读体验和 SEO 为第一优先级。

- **站点语言**：英文（页面文案、文章、导航、SEO 元信息）
- **仓库文档语言**：中文（本 README、各阶段目录文档、代码注释）
- **在线形态**：纯静态 HTML + CSS + 极少量渐进增强 JS，可部署到任意 CDN

## 快速开始

环境要求：Node.js ≥ 20.11（推荐 22 LTS）、npm ≥ 10。

```bash
npm ci          # 安装依赖
npm run dev     # 本地开发：http://localhost:4321
npm run build   # 生产构建：生成 OG 图片 → 构建 HTML → 生成搜索索引
npm run preview # 本地预览生产构建：http://localhost:4321
```

> 搜索功能依赖 Pagefind 索引，只有执行过 `npm run build` 后才会在预览中生效；
> 开发模式下搜索弹窗会提示改用标签筛选。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 开发服务器，热更新 |
| `npm run build` | 生产构建（含 OG 卡片生成与 Pagefind 索引） |
| `npm run preview` | 预览 `dist/` 产物 |
| `npm run check` | Astro + TypeScript 类型/模板检查 |
| `npm run test:links` | 检查构建产物中的内部链接与锚点 |
| `npm run test:seo` | 检查标题、描述、canonical、OG、JSON-LD、sitemap、RSS |

## 技术栈

- **Astro 5**：静态站点生成，默认零客户端 JS
- **Content Collections + Zod**：文章 frontmatter 类型校验，字段错误直接构建失败
- **手写 CSS 设计系统**：纸墨编辑风，亮/暗双主题，无 Tailwind
- **Pagefind**：构建期全文搜索，交互时才加载
- **Sharp**：`prebuild` 阶段为每篇文章生成 1200×630 社交分享图
- **自托管字体**：Instrument Serif / Newsreader / JetBrains Mono，latin 子集静态实例，无第三方字体请求
- **RSS + Sitemap**：全文 RSS、自动 sitemap、robots.txt
- **部署**：Cloudflare Pages / Vercel / Netlify / GitHub Pages / Docker + Nginx

## 目录结构

```
.
├── 01-product-architecture/   产品愿景、信息架构、技术架构、ADR、路线图
├── 02-requirements/           PRD、用户故事、验收标准、内容策略、SEO 规范
├── 03-ui-design/              设计系统、页面规格、可交互设计样张、UI 复查记录
├── 04-development/            实现说明、变更记录
├── 05-qa-testing/             测试计划、用例、QA 报告、可访问性
├── 06-devops-deployment/      部署指南、CI/CD、运维手册
├── 07-launch-operations/      上线清单、内容日历、分析增长、维护
├── src/
│   ├── components/            Header、Footer、PostRow、TOC、Search 等
│   ├── layouts/               BaseLayout、PostLayout
│   ├── pages/                 路由（首页、文章、标签、About、Newsletter、RSS…）
│   ├── content/blog/          英文文章（Markdown）
│   ├── lib/                   站点配置与文章查询工具
│   └── styles/global.css      设计 token、组件与正文样式
├── public/                    favicon、字体、_headers、构建生成的 OG 图片
├── scripts/                   OG 生成、链接检查、SEO 检查
└── astro.config.mjs
```

## 发布一篇文章

1. 新建 `src/content/blog/<slug>.md`（slug 使用小写连字符，不使用日期）。
2. 填写 frontmatter：

```yaml
---
title: "A specific, sentence-case title"
description: "120–160 characters that promise something to the reader."
pubDate: 2026-11-13
updatedDate: 2026-11-20   # 可选，仅在实质性修订时填写
tags: ["architecture", "devops"]  # 1–4 个，小写连字符
featured: false            # 全站最多 3 篇
draft: false               # true 时不会出现在任何页面、RSS、sitemap
---
```

3. 正文用英文写，`##` 作为章节标题；不要写 H1（页面会自动使用 frontmatter 标题）。
4. 本地执行 `npm run dev` 检查排版；提交前执行 `npm run build` 与两个检查脚本。
5. 推送到 `main` 后由 CI/托管平台自动构建发布。

写作规范见 `02-requirements/content-strategy.md`，SEO 规范见 `02-requirements/seo-requirements.md`。

## 上线前需要替换的占位配置

全部集中在 `src/lib/site.ts` 与 `astro.config.mjs`：

| 项目 | 当前占位 | 说明 |
| --- | --- | --- |
| 域名 | `https://jinlo.dev` | 同时修改 `site.ts` 与 `astro.config.mjs` 的 `site` |
| 作者名 | `Jin Lo` | 导航、页脚、结构化数据、OG 卡片都会引用 |
| 邮箱 | `hello@jinlo.dev` | 订阅兜底与 Contact |
| 社交链接 | 空字符串 | 留空时自动隐藏，填入后出现在 About/页脚 |
| 邮件订阅端点 | 空字符串 | 留空时显示 mailto 兜底；填入后启用表单 |
| 分析工具 | 未接入 | 默认无分析；接入方式见 `07-launch-operations/analytics-and-growth.md` |

## 质量门禁

`npm run build` 必须通过，且以下检查为 0 失败：

```bash
npm run check
npm run test:links
npm run test:seo
```

CI（`.github/workflows/ci.yml`）会在每次 push / PR 时执行以上全部检查。

## 部署

- 首选：Cloudflare Pages（构建命令 `npm run build`，输出目录 `dist`）
- 备选：Vercel（`vercel.json`）、Netlify（`netlify.toml`）、GitHub Pages（`.github/workflows/deploy-pages.yml`）
- 自托管：`docker build -t jinlo-blog . && docker run -p 8080:8080 jinlo-blog`

完整步骤、环境变量、回滚与故障处理见 `06-devops-deployment/deployment-guide.md` 与
`06-devops-deployment/runbook.md`。

## 设计约定

- 站点所有面向访客的文案必须是地道英文，避免中文语序直译。
- 亮/暗主题、键盘可访问性、减少动效偏好均为必守项（WCAG 2.2 AA）。
- 新增组件优先复用 `src/styles/global.css` 中的 token，不引入内联颜色值。
- 不引入客户端框架；新增 JS 必须渐进增强，且不阻塞阅读。

## 文档索引

按产品全周期顺序阅读：

1. [产品愿景](01-product-architecture/product-vision.md) → [信息架构](01-product-architecture/information-architecture.md) → [技术架构](01-product-architecture/technical-architecture.md) → [ADR](01-product-architecture/decisions.md) → [路线图](01-product-architecture/roadmap.md) → [产品架构图（当前实现）](01-product-architecture/product-architecture-map.md)
2. [PRD](02-requirements/prd.md) → [用户故事](02-requirements/user-stories.md) → [验收标准](02-requirements/acceptance-criteria.md) → [内容策略](02-requirements/content-strategy.md) → [SEO 规范](02-requirements/seo-requirements.md)
3. [设计系统](03-ui-design/design-system.md) → [页面设计](03-ui-design/page-designs.md) → [设计样张](03-ui-design/design-preview.html) → [UI 复查与收敛改造](03-ui-design/ui-refresh-notes.md) → [对比度核算](03-ui-design/contrast-audit.md) → [移动端长文专项](03-ui-design/mobile-review.md) → [UI 截图预览](03-ui-design/ui-preview.html)
4. [实现说明](04-development/implementation-notes.md) → [如何发布一篇新文章](04-development/how-to-publish-an-article.md) → [变更记录](04-development/changelog.md)
5. [测试计划](05-qa-testing/test-plan.md) → [测试用例](05-qa-testing/test-cases.md) → [QA 报告](05-qa-testing/qa-report.md) → [Lighthouse 基线](05-qa-testing/lighthouse.md)
6. [部署指南](06-devops-deployment/deployment-guide.md) → [CI/CD](06-devops-deployment/ci-cd.md) → [运维手册](06-devops-deployment/runbook.md)
7. [上线清单](07-launch-operations/launch-checklist.md) → [内容日历](07-launch-operations/editorial-calendar.md) → [分析与增长](07-launch-operations/analytics-and-growth.md) → [维护](07-launch-operations/maintenance.md)

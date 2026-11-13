# SEO 与可发现性需求

> Stage 2 · v1.0 · Owner: author/operator. Verified automatically by `scripts/check-seo.mjs`
> and manually in Search Console after launch.

## 1. 目标

1. 每篇已发布文章都可独立索引，并具有唯一、准确的摘要。
2. 社交分享展开为带正确标题的品牌化卡片。
3. 发现不依赖任何单一平台（搜索、RSS、邮件、社交）。
4. 上线时没有技术 SEO 债：没有重复 canonical、没有孤儿页面、没有软 404。

## 2. 关键词地图（意图优先，而非搜索量优先）

搜索量刻意不标注——我们不编造数字。目标是长尾且呈问句形态的词，个人文章在这些词上有现实机会获得排名。

| 文章 | 主要搜索意图 | 支撑性长尾词 |
| --- | --- | --- |
| Boring architecture | boring architecture / boring technology trade-offs | when to choose boring tech, boring stack for startups |
| Slow APIs | why is my API slow / slow API diagnosis | p95 latency debugging, slow endpoint checklist |
| Second reader | writing documentation for future readers | docs for onboarding, second reader principle |
| Monolith rewrite | rewriting a monolith lessons | monolith to modular, rewrite risk |
| TypeScript narrowing | TypeScript narrowing guide | type guards, discriminated unions narrowing |
| Cost of convenience | hidden cost of convenience in software | abstractions cost, dependency trade-offs |
| CLS in practice | cumulative layout shift fix | CLS causes, reserve space images fonts |
| Deep work system | simple deep work system for engineers | focus routine for developers |
| Build pipeline as product | CI pipeline as a product | build time budget, pipeline UX |
| English as second language | writing English as a non-native engineer | technical writing ESL, clear engineering writing |

每篇文章瞄准**一个**主要意图；标签形成主题集群；内部链接连接同一支柱内的文章（每篇文章至少 2 个出站内部链接）。

## 3. 页面内要求

| 元素 | 规则 |
| --- | --- |
| `<title>` | `{Post title} · Jin Lo`；首页：`Jin Lo — Engineering Notes`；建议 ≤ 60 字符 |
| Meta description | 120–160 字符，唯一，写成承诺；绝不在词中间自动截断 |
| H1 | 每页恰好一个；与标题意图一致，不要求完全相同 |
| 标题层级 | 逻辑清晰的 h2/h3 层级，不跳级；h2/h3 带锚点 |
| Canonical | 绝对地址、自引用、不带查询字符串、无尾斜杠 |
| Open Graph | `og:type`、`og:title`、`og:description`、`og:url`、`og:image`（1200×630 PNG）、`og:site_name`、`og:locale` |
| Twitter | `summary_large_image`、标题、描述、图片 alt |
| 图片 | 描述性 `alt`、显式 `width`/`height`、首屏以下懒加载 |
| 链接 | 描述性锚文本；外部参考链接使用 `rel="noopener noreferrer"` |
| 语言 | `<html lang="en">`；内容使用美式英语 |

## 4. 结构化数据

- 全站：`WebSite`（name、url、description、inLanguage）和 `Person`（name、url、jobTitle、sameAs）。
- 文章：`BlogPosting`，包含 `headline`、`description`、`datePublished`、`dateModified`、`author`（Person）、`image`、`url`、`mainEntityOfPage`、`keywords`、`wordCount`、`inLanguage`。
- 不使用 `BreadcrumbList`（UI 中没有面包屑；不要标记不可见的 UI）。
- 验证：上线后使用 Google Rich Results Test + Schema.org validator；JSON 必须在 CI 中可解析（由 `test:seo` 检查）。

## 5. 爬取与索引

| 文件 | 要求 |
| --- | --- |
| `/robots.txt` | `User-agent: *` 允许全部；`Sitemap: https://<domain>/sitemap-index.xml` |
| `/sitemap-index.xml` | 所有已发布路由、绝对 HTTPS URL、不含 `/og/*`、不含 `/404` |
| `/rss.xml` | 有效 RSS 2.0、`language: en`、全文、绝对链接、`lastBuildDate` |
| Canonicals | 每个路由自引用；文章与标签之间不做交叉 canonical |
| 草稿 | 任何位置都不输出 |
| 重定向 | 上线时无；未来任何 slug 变更都需要在主机配置中添加 301，并记录变更日志 |

## 6. 性能即 SEO

Core Web Vitals 被视为 SEO 需求（详情见 `01-product-architecture/technical-architecture.md` §6）：

- LCP < 1.2 s：文本优先的首屏，不依赖 hero 图片，字体使用 `display=swap` 和回退度量。
- CLS < 0.02：预留媒体尺寸，无后注入横幅。
- INP < 100 ms：第一方 JS ≤ 12 KB，交互时无长任务。
- 移动优先：每个路由在 390 px 宽度下测试。

## 7. E-E-A-T 信号

- 真实的作者身份、角色和简介，从每篇文章链接过去。
- 明确标注第一手经验（“我迁移了……”、“我们测量了……”）。
- 为外部主张链接参考资料；不编造统计数据。
- 联系页面/地址；社交资料中的姓名/账号保持一致。
- “Updated” 日期仅用于实质性修订。

## 8. 衡量计划

| 工具 | 设置 | 频率 | KPI |
| --- | --- | --- | --- |
| Google Search Console | 上线后验证域名 | 首月每周，之后每月 | 展示、点击、CTR、热门查询、索引错误 |
| Bing Webmaster Tools | 从 GSC 导入 | 每月 | 覆盖、外链 |
| RSS 服务商 / feed 分析 | Feedly、Inoreader | 每月 | 订阅者 |
| 隐私优先分析（可选） | Cloudflare Web Analytics 或 Plausible | 每周 | 访问量、来源、热门文章 |
| Rich Results Test | 手动，每次模板变更 | 变更时 | 0 错误 |

## 9. 上线 SEO 清单

- [ ] `astro.config.mjs` 中的 `site` URL 与生产域名一致
- [ ] Canonical/OG/RSS/sitemap URL 为绝对地址且使用 HTTPS
- [ ] `robots.txt` 允许爬取并引用 sitemap
- [ ] Sitemap 已提交到 Google 和 Bing
- [ ] Rich Results Test 在首页 + 一篇文章上通过
- [ ] 在 X 和 LinkedIn 的帖子检查器中验证 OG 预览
- [ ] 任何地方都没有遗留 `noindex`
- [ ] 404 在托管平台上返回 404（不是 200）
- [ ] Mobile-friendly test 通过
- [ ] 内部链接：每篇文章都能从首页两次点击内到达

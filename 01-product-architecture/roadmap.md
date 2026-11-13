# 交付路线图

> Stage 1 · v1.0 · Dates are sequencing targets, not promises.

## 阶段 0 — 基础（本次交付，第 1 天）

| 交付物 | 产出 | 状态 |
| --- | --- | --- |
| 产品定义、受众、非目标 | `01-product-architecture/product-vision.md` | 已完成 |
| 信息架构与内容模型 | `01-product-architecture/information-architecture.md` | 已完成 |
| 技术架构与 ADR | `01-product-architecture/*.md` | 已完成 |
| 需求与验收标准 | `02-requirements/` | 已完成 |
| 设计系统与页面规格 | `03-ui-design/` | 已完成 |
| 可运行的静态站点 | `src/`、`public/`、根目录配置 | 已完成 |
| QA 证据 | `05-qa-testing/` | 已完成 |
| 部署与运维手册 | `06-devops-deployment/`、`07-launch-operations/` | 已完成 |

**退出标准：** `npm run build` 成功；所有路由可渲染；无失效的内部链接；Lighthouse ≥ 95；文档足以让一个陌生人完成部署。

## 阶段 1 — 上线（第 1 周）

1. 将域名指向选定的托管平台（推荐 Cloudflare Pages）。
2. 替换占位身份信息：`src/lib/site.ts`（名称、域名、邮箱、社交账号）。
3. 发布初始 10 篇文章；将其中三篇标记为 `featured`。
4. 将 `/sitemap-index.xml` 提交到 Google Search Console 和 Bing Webmaster Tools。
5. 宣传：个人网络、X/LinkedIn 帖子、Hacker News（仅当某篇文章确实适合 HN 时）、相关 Reddit 社区（遵守自我推广规则）。
6. 在 Feedly 中验证 RSS；将 feed 提交到几个目录。

**退出标准：** 线上 HTTPS 站点、首页被索引、首批 10 位 RSS 订阅者。

## 阶段 2 — 节奏（第 2–12 周）

- 每两周发布一篇实质性长文；保持两篇的缓冲库存。
- 每月：更新 About/Now 页面、清理失效链接、查看分析数据。
- 收集读者回复；将反复出现的问题转化为文章。
- 可选：与 2–3 个同侪博客互相引流。

**退出标准：** 16 篇文章、100 位 RSS 订阅者、每月搜索展示 ≥ 2,000 次。

## 阶段 3 — 复利（第 4–9 个月）

- 当某个标签超过 6 篇文章时，构建“Start here”阅读路径和主题中心。
- 添加 newsletter 归档和欢迎序列。
- 考虑在长文之间加入一个小型“notes”流（短帖）。
- 评估演讲、咨询页面或付费工作坊——仅当存在实际的入站需求时。

**退出标准：** newsletter 订阅者 ≥ 500，或月访问量稳定在 1 万；至少一个非博客机会来源于该站点。

## 搁置待办（明确暂不做）

| 事项 | 重新评估的触发条件 |
| --- | --- |
| 评论（Giscus） | 读者持续有需求，每月 ≥ 3 次请求 |
| 每篇文章的深色/浅色插图 | 阶段 3 的设计刷新 |
| 多语言 | 来自特定地区的受众证据 |
| 会员/付费墙 | ≥ 2,000 位活跃订阅者 |
| CMS 界面 | 出现第二位作者或非技术贡献者 |
| Serverless 个性化 | 确实无法静态实现的功能 |

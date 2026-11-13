# 上线清单

> 阶段 7 · v1.0 · 按顺序勾选，全部完成后即可对外发布

## 1. 内容就绪

- [x] 10 篇英文文章已发布（每篇 950–1,200 词），无 `draft: true` 残留
- [x] 3 篇标记 `featured`，首页精选位有内容
- [x] 每篇有 1–3 个标签，全部落在既有 6 个标签内（architecture / performance / engineering / devops / career / writing）
- [x] 每篇 description 为 120–160 字符、独立成句，可直接用作搜索结果摘要
- [x] About 页信息真实，无虚构雇主、头衔、数字
- [x] 全站无 lorem ipsum、无 TODO、无"coming soon"占位
- [x] 英文文案经母语行文标准复核（见 `05-qa-testing/qa-report.md` 第 5 节）

## 2. 站点配置

- [x] `site.url` 与最终域名一致（部署前必须改，否则 canonical/RSS/sitemap 全错）
- [x] `site.name`、`site.description`、作者名与邮箱为真实值
- [x] 社交链接指向真实账号，或留空（留空则前台不渲染该链接）
- [ ] 订阅端点 `newsletter.endpoint` 已配置（未配置时页面自动降级为邮件订阅，不阻塞上线）
- [x] 无第三方分析脚本、无 cookie、无弹窗

## 3. 质量门禁

- [x] `npm run check` → 0 errors / 0 warnings
- [x] `npm run build` → 22 pages，Pagefind `Indexed 22 pages`
- [x] `npm run test:links` → 0 失败
- [x] `npm run test:seo` → 0 失败
- [x] Lighthouse 四项 ≥ 95（首页与文章页，报告归档于 `05-qa-testing/`）
- [x] 移动端 390px 无横向滚动
- [x] 禁用 JS 后文章可完整阅读
- [x] 暗色/亮色两套主题正文对比度达标

## 4. SEO 与分发

- [x] 每页唯一 title、独立 description、绝对 canonical
- [x] Open Graph 与 Twitter Card 完整，`og:image` 指向 1200×630 PNG
- [x] `BlogPosting` / `Person` / `WebSite` JSON-LD 无字段错误
- [x] `/rss.xml` 全文输出、绝对链接、`<language>en</language>`
- [x] `/sitemap-index.xml` 含全部内容路由，不含 `/og/*` 与 `/404`
- [x] `/robots.txt` 允许抓取并声明 sitemap
- [x] `/404` 页面可用且有返回导航
- [x] 旧式路径 `/feed`、`/blog/` 已配置 301

## 5. 部署

- [ ] 托管平台项目已创建并连接仓库
- [ ] 构建命令 `npm run build`、输出目录 `dist`、Node 22 已设置
- [ ] 首个部署成功，平台分配的预览域名可访问
- [ ] 自定义域名已绑定，DNS 生效，HTTPS 证书已签发
- [ ] `http://` 与 `https://`、根域与 `www` 只保留一个规范入口，其余 301
- [ ] 安全响应头生效（CSP、X-Frame-Options、X-Content-Type-Options、Referrer-Policy）
- [ ] 缓存头生效（`_astro` 一年 immutable，`og` 一天，`pagefind` 一小时）
- [ ] 平台自动部署已开启（推送即发布）或明确采用手动发布
- [ ] 回滚路径已验证（能切回上一个部署）

## 6. 上线当天

- [ ] 生产环境跑完 `06-devops-deployment/runbook.md` 第 3 节冒烟命令
- [ ] 用手机 4G 网络实际打开一次（不走本地缓存）
- [ ] 分享一篇文章链接到任意聊天工具，确认卡片有标题、描述、图片
- [ ] 提交 sitemap 到 Google Search Console 与 Bing Webmaster Tools
- [ ] 在 Search Console 请求首页与 3 篇核心文章的收录
- [ ] 订阅 RSS，确认阅读器能拉到全文
- [ ] 记录上线时间、首个部署 ID、当前提交 SHA

## 7. 上线后 7 天

- [ ] Search Console 无"已被排除"异常增长、无手动操作通知
- [ ] 首页与文章页在 Google 搜索 `site:your-domain.com` 可见
- [ ] 无 404 异常（平台分析或日志）
- [ ] 移动端可用性报告无问题
- [ ] 订阅读者首封信已发出（若已启用订阅）

## 8. 明确不做（v1 范围外）

- 评论系统、点赞、阅读量展示
- 多语言切换、i18n 路由
- 付费订阅、会员内容
- A/B 测试、增长实验框架
- 服务端渲染、数据库、用户账号

## 9. 阻塞项登记

| 项 | 类型 | 影响 | 解除方式 |
| --- | --- | --- | --- |
| 自定义域名 | 外部凭据 | 无法验证真实 canonical 与 HTTPS | 购买域名并在平台绑定 |
| 托管账号 | 外部凭据 | 无法完成真实部署 | 选择平台并授权仓库 |
| 订阅提供商 | 外部凭据 | 表单降级为 mailto | 注册 Buttondown / ConvertKit 等，填入端点 |
| Lighthouse CI 门槛 | 工程取舍 | 仅本地执行 | 如需自动化，接入 Lighthouse CI 并设预算 |

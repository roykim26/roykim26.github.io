# 运维手册（Runbook）

> 阶段 6 · v1.0 · 面向站点所有者的日常操作与故障处置

## 1. 日常发布流程

### 1.1 发布一篇新文章

```bash
# 1. 新建文件，文件名即 URL（小写、连字符）
#    src/content/blog/my-new-essay.md

# 2. 填写 frontmatter
```

```yaml
---
title: "A title that says the thing"
description: "One sentence, 120–160 characters, written for a human scanning a search result."
pubDate: 2026-11-20
tags: ["architecture"]      # 仅使用已有标签，新标签会新建页面
featured: false
draft: true                 # 本地先写成草稿，确认后改 false
---
```

3. `npm run dev` 预览 → 检查排版、目录、代码块、链接。
4. 改 `draft: false`，`npm run build` 确认 `23 page(s) built` 且 OG 图生成。
5. 提交并推送，CI 通过后由平台自动部署。
6. 部署完访问新 URL，检查分享预览（OG 图）是否正常。

### 1.2 紧急下线一篇文章

最快方式：把该文 frontmatter 改为 `draft: true`，推送。约 1–2 分钟后文章从列表、RSS、sitemap 与搜索索引消失。不要直接删除文件——保留历史便于恢复。

### 1.3 修改站点配置

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名、描述、作者、邮箱、社交链接 | `src/lib/site.ts` |
| 规范域名 | `src/lib/site.ts` 的 `site.url`，同时更新 `astro.config.mjs` 的 `site` |
| 订阅提供商端点 | `src/lib/site.ts` 的 `newsletter.endpoint` |
| 导航项 | `src/components/Header.astro`、`Footer.astro` |
| 颜色、字号、间距 | `src/styles/global.css` 顶部 token 区 |

改完必须重新构建，因为 canonical、RSS、sitemap 中的绝对地址在构建期写死。

## 2. 定期维护

| 频率 | 事项 | 命令 / 动作 |
| --- | --- | --- |
| 每次发布 | 五项检查 | `npm run check && npm run build && npm run test:links && npm run test:seo` |
| 每月 | 依赖更新 | `npm outdated`，小版本用 `npm update`，主版本单独验证 |
| 每月 | 抽查外链 | About 中的邮箱、社交链接、RSS 是否可用 |
| 每季度 | 性能复测 | Lighthouse 跑首页与最长的文章页，对比 `05-qa-testing/lighthouse.md` 基线 |
| 每季度 | 内容审计 | 是否有过时结论、失效代码示例、陈旧数据 |
| 每半年 | 恢复演练 | 在空目录 clone 仓库，按 README 从零构建一次 |

依赖升级后的回归清单：构建页数不变、Pagefind 索引页数不变、四项检查全绿、浏览器抽查首页/文章页/暗色模式。

## 3. 部署后冒烟（每次上线后 2 分钟）

```bash
BASE=https://your-domain.com
curl -sI $BASE/ | head -1
curl -sI $BASE/blog | head -1
curl -sI $BASE/blog/<最新文章 slug> | head -1
curl -s  $BASE/rss.xml | Select-String "<item>" | Measure-Object | Select-Object -ExpandProperty Count   # 应等于文章数
curl -s  $BASE/robots.txt
```

浏览器再确认三项：主题切换、Ctrl/Cmd+K 搜索、移动端宽度下无横向滚动。

## 4. 故障处置

| 症状 | 判定 | 处置 |
| --- | --- | --- |
| 全站 5xx | 平台侧故障 | 查平台状态页；本地 `docker run` 验证产物本身是否正常；必要时回滚上一部署 |
| 单页 404 | 路由未生成或映射失败 | 确认该 slug 文件存在且非草稿；检查平台无扩展名映射；本地 `dist/` 是否有对应 html |
| 样式全部丢失 | `_astro` 资源 404 | 检查部署目录是否为 `dist` 根；检查 `base` 配置；查看响应头是否被错误重写 |
| 搜索无结果 | Pagefind 索引缺失或为 0 | 构建日志确认 `Indexed N pages`；确认部署包含 `/pagefind/`；强刷缓存 |
| 分享卡片无图 | OG 图未生成或路径错 | 本地 `dist/og/<slug>.png` 是否存在；`og:image` 是否为绝对 URL；社交平台缓存需重新抓取 |
| RSS 订阅器报错 | XML 非法或编码问题 | `curl` 拉取全文，用 XML 校验器检查；确认 `language` 在 `customData` 中而非非法字段 |
| 表单提交无效 | 端点未配置或跨域 | 检查 `newsletter.endpoint`；确认 CSP 的 `form-action` 允许目标域名 |
| 中文乱码 | 响应头缺 charset | 平台默认 `utf-8`；Nginx 已设 `charset utf-8` |

## 5. 回滚决策树

```
发现问题
 ├─ 只影响单篇文章 → 该文 draft: true，推送（最快，1–2 分钟）
 ├─ 影响样式/模板 → 平台回滚到上一成功部署（秒级）
 └─ 需要代码修复 → git revert 后推送，等 CI 全绿再部署；不要在生产分支手工改
```

## 6. 值班边界

本站无服务端、无数据库，不存在"线上可用性随时间劣化"的问题。真正需要响应的只有三类：

1. 部署失败（CI 红）——当天处理。
2. 内容错误（事实、链接、代码）——48 小时内处理，可先加勘误说明。
3. 安全头/依赖漏洞告警——评估可利用性后再决定是否立刻升级。

## 7. 交接清单

- 仓库访问权限（GitHub）
- 托管平台项目权限与域名 DNS 权限
- 订阅提供商账号（若已启用）
- 本手册 + `deployment-guide.md` + `launch-checklist.md`
- 最近一次部署的回滚点（平台部署 ID 或镜像 tag）

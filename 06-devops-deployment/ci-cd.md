# CI/CD 说明

> 阶段 6 · v1.0 · 工作流文件：`.github/workflows/ci.yml`、`.github/workflows/deploy-pages.yml`

## 1. 流水线总览

```
push / PR
   │
   ├─ ci.yml ──► checkout → node 22 + npm cache → npm ci
   │                              ↓
   │                        npm run check        （类型 + 模板，0 错误才继续）
   │                              ↓
   │                        npm run build        （OG 生成 + 22 页 + Pagefind 索引）
   │                              ↓
   │                        npm run test:links   （616 处内部引用 / 锚点）
   │                              ↓
   │                        npm run test:seo     （title/desc/canonical/OG/JSON-LD/sitemap/RSS/robots）
   │                              ↓
   │                        upload-artifact: site-dist（保留 7 天）
   │
   └─ deploy-pages.yml（仅 main / 手动）──► 同样的构建与验证 → configure-pages → upload-pages-artifact → deploy-pages
```

两个工作流都只用官方 Action，无第三方脚本，无密钥。`permissions` 最小化：CI 只读仓库；部署额外需要 `pages: write` 和 `id-token: write`。

## 2. 门禁规则

| 阶段 | 失败即阻断 | 说明 |
| --- | --- | --- |
| `npm ci` | 是 | lockfile 与 `package.json` 不一致会直接失败 |
| `npm run check` | 是 | 任何类型错误或模板错误 |
| `npm run build` | 是 | 含 Zod frontmatter 校验，字段缺失/类型错误在此暴露 |
| `npm run test:links` | 是 | 内部链接或锚点解析失败 |
| `npm run test:seo` | 是 | 标题长度/唯一性、描述缺失、canonical、OG、JSON-LD、sitemap、RSS、robots 任一项不合规 |

构建日志中还应人工留意两行：

- `22 page(s) built`
- `Indexed 22 pages`（Pagefind）

若 Pagefind 显示 `Indexed 0 pages`，说明 HTML 结构被破坏，搜索会静默失效，必须在合并前修复。

## 3. 缓存与耗时

- `actions/setup-node` 的 `cache: npm` 复用依赖缓存。
- npm 缓存命中后，完整流水线通常在 1–2 分钟内完成（构建本身约 2 秒，主要耗时在 `npm ci` 与 OG 图生成）。
- Sharp 在 CI 上为 Linux x64 预编译二进制，无需额外系统依赖。

## 4. 分支与发布策略

| 分支 | 行为 |
| --- | --- |
| `main` | 受保护分支；PR 合并后触发 CI + Pages 部署（若启用 Pages） |
| `feature/*` | 推送即跑 CI，不部署 |
| 紧急修复 | 直接从 `main` 切分支，改动最小化，合并后观察一次完整部署 |

建议在 GitHub 上将 `ci.yml` 的 `quality` 设为必需检查（Settings → Branches → Require status checks）。

## 5. 若改用 Cloudflare Pages / Vercel / Netlify

这三家自带 Git 集成构建，`ci.yml` 仍作为质量门禁保留，但部署由平台自己完成：

1. 在平台授权仓库，构建设置见 `deployment-guide.md` 第 3 节。
2. 平台构建命令同样是 `npm run build`，因此 Pagefind 与 OG 生成不会遗漏。
3. 关闭 GitHub Pages 工作流（删除或改名 `deploy-pages.yml`），避免双份部署互相覆盖。

## 6. 常用调试命令

```bash
# 复现 CI 失败（本地按同样顺序）
npm ci && npm run check && npm run build && npm run test:links && npm run test:seo

# 只看链接检查详情
node scripts/check-links.mjs

# 只看 SEO 检查详情
node scripts/check-seo.mjs

# 单独重新生成 OG 图
node scripts/generate-og.mjs
```

## 7. 尚未自动化（有意为之）

| 项 | 原因 | 现状 |
| --- | --- | --- |
| Lighthouse 性能门槛 | CI 环境波动大，易产生假失败 | 发布前本地跑一次，结果归档于 `05-qa-testing/` |
| 视觉回归截图 | 站点为纯排版风格，改动频率低，成本不划算 | 靠设计系统 token 与人工核对 |
| 外链可用性检查 | 外链波动会造成 CI 噪音 | 发布前抽查 About 中的社交链接 |
| 部署后冒烟 | 依赖真实域名 | 见 `runbook.md` 第 3 节手动执行 |

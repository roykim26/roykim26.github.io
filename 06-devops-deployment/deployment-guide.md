# 部署指南

> 阶段 6 · v1.0 · 面向：站点所有者（非专职运维也能照做）

站点是纯静态产物：`npm run build` 输出 `dist/`，没有任何服务端运行时、数据库或环境变量。这意味着一份构建产物可以原样放到任何静态托管上。

## 1. 构建产物说明

| 路径 | 内容 | 缓存策略 |
| --- | --- | --- |
| `/index.html`、`/blog.html`、`/about.html` … | 预渲染页面（`build.format: 'file'`） | no-cache / 协商缓存 |
| `/_astro/*.css`、`/_astro/*.js` | 带哈希的静态资源 | 1 年 immutable |
| `/og/*.png` | 每篇文章的社交分享图（预构建生成） | 1 天 |
| `/pagefind/*` | 站内搜索索引与 UI 资源 | 1 小时 |
| `/rss.xml`、`/sitemap-index.xml`、`/robots.txt` | 订阅与抓取入口 | 1 小时 |

> 注意：由于使用 `format: 'file'`，URL 不带 `.html` 后缀也不带尾斜杠（`/blog`、`/blog/boring-architecture`）。托管平台必须能把 `/blog` 映射到 `/blog.html`。各平台方案见第 3 节。

## 2. 部署前检查（本地三分钟）

```bash
npm ci
npm run check        # 0 errors, 0 warnings
npm run build        # 22 pages + Pagefind indexed 22 pages
npm run test:links   # 0 failures
npm run test:seo     # 0 failures
npm run preview -- --port 4321
```

打开 http://localhost:4321 确认首页、文章页、`/rss.xml` 正常，再继续。

## 3. 平台部署

### 3.1 Cloudflare Pages（推荐）

1. 将仓库推送到 GitHub。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git。
3. 构建设置：

   | 项 | 值 |
   | --- | --- |
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | `22`（环境变量 `NODE_VERSION=22`） |

4. `public/_headers` 与 `public/_redirects` 会被自动复制进 `dist/`，Cloudflare 原生识别，无需额外配置。
5. 部署完成后访问 `https://<project>.pages.dev` 验证。

**自定义域名**：Pages → Custom domains → 添加域名，按提示在 DNS 添加 CNAME（`www` → `<project>.pages.dev`），根域用 Cloudflare 的 CNAME flattening。开启 Always Use HTTPS。

### 3.2 Vercel

1. Import Git Repository，框架自动识别为 Astro。
2. `vercel.json` 已声明 `buildCommand`、`outputDirectory`、`cleanUrls`、`trailingSlash`、安全头、缓存头与重定向，无需在面板重复配置。
3. Node 版本在 Project Settings → General → Node.js Version 选 22.x。
4. 自定义域名：Settings → Domains，按提示配置 DNS。

### 3.3 Netlify

1. Add new site → Import an existing project。
2. `netlify.toml` 已声明构建命令、发布目录、Node 版本、安全头、缓存头与重定向。
3. 自定义域名：Domain settings → Add custom domain，开启 HTTPS（Let's Encrypt 自动签发）。

### 3.4 GitHub Pages

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
2. 推送 `main` 分支，`.github/workflows/deploy-pages.yml` 会自动构建并发布。
3. 若使用项目页（`https://<user>.github.io/blog`），必须先把 `astro.config.mjs` 里的 `site` 改成含子路径的地址，并把 `base` 设为 `'/blog'`；否则站内绝对链接会 404。使用自定义域名或用户主页时无需此步。
4. 自定义域名：Settings → Pages → Custom domain，并在 DNS 添加 CNAME。

### 3.5 自托管：Docker + Nginx

```bash
docker build -t waystone-ai-blog:1.0.0 .
docker run -d --name blog -p 8080:8080 --restart unless-stopped waystone-ai-blog:1.0.0
curl -I http://localhost:8080/
```

镜像为两阶段构建（Node 22 构建 → Nginx 1.27 提供静态文件），`nginx.conf` 已处理：

- `try_files $uri $uri.html $uri/ =404`：无扩展名 URL 正确命中
- 404 走 `/404.html`
- 安全响应头与 CSP
- `_astro` / `og` / `pagefind` 分级缓存
- gzip、隐藏 Nginx 版本号
- `HEALTHCHECK` 每 30 秒探测根路径

反向代理到公网时，在宿主机 Nginx/Caddy 上终止 TLS，并保留 `X-Forwarded-Proto`，以便将来需要时生成正确绝对 URL（当前站点为纯静态，不依赖该头）。

## 4. 域名与 DNS 清单

| 记录 | 名称 | 值 | 说明 |
| --- | --- | --- | --- |
| CNAME | `www` | 平台分配的域名 | 主入口 |
| A / CNAME | `@` | 平台要求 | 根域重定向到 `www` 或反之，全站只保留一个规范域名 |
| TXT | `@` | 平台验证值 | 域名归属验证（如需要） |
| CAA | `@` | 平台 CA | 可选，限制证书签发方 |

规范域名必须与 `src/lib/site.ts` 中的 `site.url` 一致，否则 canonical、OG、RSS 与 sitemap 中的绝对地址会错。

## 5. 上线后冒烟测试

```bash
BASE=https://your-domain.com
curl -sI $BASE/ | head -1                 # 200
curl -sI $BASE/blog | head -1             # 200（验证无扩展名映射）
curl -sI $BASE/blog/boring-architecture | head -1
curl -s  $BASE/rss.xml | head -20         # 含 <language>en</language>
curl -s  $BASE/robots.txt                 # 含 Sitemap:
curl -sI $BASE/feed | head -1             # 301 → /rss.xml
curl -s  $BASE/og/boring-architecture.png | wc -c   # > 10000
```

再用浏览器确认：暗色主题可切换、Ctrl/Cmd+K 搜索有结果、移动端无横向滚动。

## 6. 回滚

静态站点回滚 = 重新发布上一个构建。

| 平台 | 操作 |
| --- | --- |
| Cloudflare Pages | Deployments → 选择上一个成功部署 → Rollback |
| Vercel | Deployments → 目标部署 → Promote to Production |
| Netlify | Deploys → 选择上一个 → Publish deploy |
| GitHub Pages | Actions → 选择上一个成功 run → Re-run，或 `git revert` 后推送 |
| Docker | `docker run` 上一版本 tag；保留最近 3 个镜像 tag |

内容层面的回滚：`git revert <commit>` 后推送，CI 自动重建。若错误来自单篇文章，也可直接把该文章 frontmatter 改为 `draft: true` 紧急下线。

## 7. 故障排查

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| 首页 200，`/blog` 404 | 平台未做无扩展名映射 | 按第 3 节对应平台配置；Cloudflare/Vercel/Netlify 使用仓库内配置文件即可 |
| 样式丢失、页面裸奔 | `_astro` 路径被错误重写或 base 配置不符 | 检查 `base` 与部署路径；确认 `/_astro/*` 返回 200 |
| 搜索无结果 | 构建未执行 Pagefind 或索引为 0 | 查看构建日志是否有 `Indexed 22 pages`；确认 `npm run build` 而非 `astro build` |
| OG 图 404 | 预构建脚本未运行或产物被忽略 | `prebuild` 会自动执行；确认 `public/og/*.png` 在 `dist/og/` 中存在（该目录在 git 中被忽略，属正常） |
| RSS 中链接是 localhost | `site.url` 未修改 | 修改 `src/lib/site.ts` 后重建 |
| 字体闪烁/慢 | Google Fonts 远程加载 | 可接受（`display=swap`）；如需极致性能，改为自托管 woff2 并更新 CSP |
| 表单提交无效 | `newsletter.endpoint` 未配置 | 配置提供商端点；未配置时页面降级为邮件订阅 |

## 8. 部署成本与限制

- Cloudflare Pages / Netlify / Vercel 免费额度足够个人博客（每月数百次构建、100 GB 带宽量级）。
- 产物约 1.6 MB（含全部 OG 图），单页传输通常 < 300 KB。
- 无服务端，不存在冷启动、数据库连接数或运行时费用。

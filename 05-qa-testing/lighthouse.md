# Lighthouse 基线报告

> 阶段 5 · 执行时间：2026-11-13 · 工具：Lighthouse 12（移动端默认配置，模拟 4G + 4× CPU 降速）
> 原始报告：`lighthouse-home.html`、`lighthouse-article.html`（可在浏览器直接打开）
> 被测地址：`npm run preview` → http://localhost:4321

## 1. 总分

| 页面 | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/`（首页） | **100** | **100** | **100** | **100** |
| `/blog/boring-architecture`（最长文章页） | **99** | **100** | **100** | **100** |

对照验收标准 AC-05（四项 ≥ 95）：**通过**。

## 2. 关键指标

| 指标 | 首页 | 文章页 | 阈值（良好） |
| --- | --- | --- | --- |
| First Contentful Paint | 1.5 s | 1.7 s | < 1.8 s |
| Largest Contentful Paint | 1.5 s | 1.7 s | < 2.5 s |
| Total Blocking Time | 0 ms | 0 ms | < 200 ms |
| Cumulative Layout Shift | 0.007 | 0 | < 0.1 |
| Speed Index | 1.5 s | 1.7 s | < 3.4 s |
| 页面总传输量 | 120 KiB | 149 KiB | — |

## 3. 首轮问题与修复

首轮测试发现文章页 Speed Index 为 8.4 s（Performance 91），与 FCP/LCP 1.5 s 明显矛盾。逐项排查后定位并修复了三个问题：

| # | 问题 | 证据 | 修复 |
| --- | --- | --- | --- |
| 1 | Google Fonts 远程 CSS 阻塞渲染，字体迟到触发整页重排 | `render-blocking-resources` 提示可节省 740 ms；SI 8.4 s 而 FCP 1.5 s | 改为自托管 woff2，移除第三方 `<link rel="stylesheet">` 与 preconnect |
| 2 | 可变字体单文件过大（Newsreader 132 KB + 斜体 147 KB），慢速网络下字体替换发生在 6 s 后 | `total-byte-weight` 340 KiB；filmstrip 末帧仍在重绘 | 用 fontTools 生成静态实例（400 / 600 / 斜体 400），斜体由 147 KB 降至 24 KB |
| 3 | Markdown 任务列表的禁用 checkbox 缺少标签，axe 判定 7 处违规 | `label` 审计：`input[type=checkbox][disabled]` × 7 | 构建期 rehype 插件加 `aria-hidden="true"` + `tabindex="-1"` |

修复后：文章页 Performance 92 → **99**，Accessibility 96 → **100**，总传输量 340 KiB → **149 KiB**。

## 4. 安全头与 CSP

自托管字体后，CSP 收紧为 `default-src 'self'`，不再需要 `fonts.googleapis.com` / `fonts.gstatic.com` 例外：

```
default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self';
img-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self';
frame-ancestors 'none'; base-uri 'self'; form-action 'self' https:
```

`unsafe-inline` 仅用于主题预置脚本与 Astro 内联样式，无外部脚本来源。

## 5. 复测方法

```bash
npm run build
npm run preview -- --port 4321
npx lighthouse http://localhost:4321/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --output=html --output-path=05-qa-testing/lighthouse-home.html
```

注意：Lighthouse 结果受本机负载影响，波动 ±3 分属正常。若 Performance 低于 95，先看 LCP 与 SI 是否同时劣化——同时劣化通常是字体或阻塞资源问题。

## 6. 剩余优化空间（非阻塞）

| 项 | 现状 | 潜在收益 |
| --- | --- | --- |
| 代码块语法高亮 CSS | 已内联在单一样式表中，体积 29 KB | 拆分可按需加载，收益 < 10 KB |
| 首页 hero 大标题 | 纯文本，无图片 | 已最优 |
| 预加载策略 | 仅预加载 Instrument Serif（21 KB） | Newsreader 走正常发现，避免抢占带宽 |
| 字体子集 | 已裁到 latin 基本字符 | 若要支持更多符号需重新生成 |

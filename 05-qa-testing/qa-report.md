# QA 报告

> 阶段 5 · 执行日期：2026-11-13 · 结论：**通过，可发布**

## 1. 结论摘要

| 项目 | 结果 |
| --- | --- |
| 自动化门禁（4 项） | 全部通过 |
| 路由覆盖 | 22 / 22 页可访问 |
| 浏览器功能验收 | 通过（桌面 + 移动断点 + 暗色主题 + 搜索） |
| Lighthouse（首页 / 文章页） | 100/100/100/100 与 99/100/100/100 |
| 缺陷 | 发现 4 个，全部修复，无遗留 P0/P1 |
| 发布建议 | 可进入阶段 6 部署 |

## 2. 执行记录

### 2.1 自动化门禁

```
$ npm run check
Result (30 files):
- 0 errors
- 0 warnings
- 0 hints

$ npm run build
22 page(s) built in 1.61s
[pagefind] Indexed 22 pages, 1 language (en)

$ npm run test:links
[links] checked 616 internal references across 22 pages
[links] all internal links and anchors resolve

$ npm run test:seo
[seo] audited 22 HTML pages
[seo] title, description, canonical, OG, JSON-LD, sitemap, RSS, robots all valid
```

### 2.2 构建产物

| 项 | 值 |
| --- | --- |
| HTML 页面 | 22 |
| 总文件数 | 79 |
| 总产物体积 | 约 1.6 MB（含 11 张 OG 图，共 363 KB） |
| 单页传输（首页） | 120 KiB |
| 单页传输（文章页） | 149 KiB |
| CSS | 单文件 29 KB（含设计系统与代码高亮） |
| 站点 JS | 全部内联，约 6 KB（无框架运行时） |
| 搜索资源 | Pagefind，按需加载 |

### 2.3 浏览器验收

在 `npm run preview`（http://localhost:4321）上逐页核对：

| 页面 | 结果 | 证据 |
| --- | --- | --- |
| `/` | 通过 | Header 导航、H1、精选、最新 3 篇、Topics、页脚均渲染；无控制台错误；无横向滚动 |
| `/blog` | 通过 | H1 "Writing"、10 篇列表、年份分组正常 |
| `/blog/boring-architecture` | 通过 | 正文、表格、目录（TOC）、分享区渲染正常；无控制台错误 |
| 主题切换 | 通过 | 点击后 `documentElement.dataset.theme = "dark"`，刷新后保持 |
| 搜索（Ctrl/Cmd+K） | 通过 | 对话框打开，输入 "architecture" 返回 10 条结果 |
| 移动端 390px | 通过 | 断点 `max-width: 900px` 生效，主导航折叠为汉堡菜单，`overflow-x: clip` 防止横向溢出 |

## 3. 缺陷清单

| ID | 级别 | 描述 | 根因 | 修复 | 状态 |
| --- | --- | --- | --- | --- | --- |
| BUG-01 | P0 | 页面内容全部渲染在 `</html>` 之后，导致 HTML 结构非法、Pagefind 索引 0 页 | `BaseHead.astro` 自身渲染了完整 `<html><head><body>` 外壳，`BaseLayout` 又在之后输出内容 | `BaseHead` 改为纯 `<head>` 片段，文档外壳只由 `BaseLayout` 负责 | 已修复 |
| BUG-02 | P1 | `astro check` 报错：`language` 不属于 `RSSOptions` | 把 `<language>` 误写成 RSS 配置字段 | 移除该字段，改为 `customData` 输出 `<language>en</language>` | 已修复 |
| BUG-03 | P1 | 3 处 SEO 不合规：`/about` 标题过短、`/tags` 标题过短、`/tags/writing` 与 `/blog` 标题重复 | 页面 title 未按长度与唯一性要求设置 | 分别改为 `About Jin Lo — Working Engineer`、`Tags — Essay Archive`、`<Tag> — Tagged Essays` | 已修复 |
| BUG-04 | P2 | `/newsletter` 在未配置订阅端点时，向访客显示 `Replace newsletter.endpoint in src/lib/site.ts...` 这类开发者说明 | 降级分支的文案写成给站长的操作提示 | 改写为面向读者的说明，并保留邮件订阅按钮 | 已修复 |

### 3.1 性能缺陷（首轮 Lighthouse 发现）

| ID | 级别 | 描述 | 修复 |
| --- | --- | --- | --- |
| PERF-01 | P1 | 文章页 Speed Index 8.4 s（Performance 91），字体加载后整页重排 | 字体改为自托管，去掉 Google Fonts 阻塞样式表与 preconnect |
| PERF-02 | P1 | 可变字体单文件过大（132 KB + 斜体 147 KB） | 用 fontTools 生成静态实例（400 / 600 / 斜体 400），斜体降至 24 KB |
| A11Y-01 | P1 | 文章内 Markdown 任务列表的禁用 checkbox 无标签，axe 报 7 处违规 | 构建期 rehype 插件加 `aria-hidden="true"` 与 `tabindex="-1"` |

修复后文章页 Performance 99、Accessibility 100、总传输量 149 KiB。详见 `lighthouse.md`。

## 4. 风险与遗留

| 项 | 影响 | 处置 |
| --- | --- | --- |
| 订阅端点未接入 | 表单降级为邮件订阅 | 属外部凭据依赖，已在 `07-launch-operations/launch-checklist.md` 登记 |
| 自定义域名与托管账号未提供 | 无法验证真实 HTTPS 与 DNS | 部署手册已覆盖，获得凭据后 30 分钟内可完成 |
| 未做真实浏览器矩阵（Firefox/Safari 实机） | 极端 CSS 差异未知 | 使用了广泛支持的 CSS（grid、clamp、:has 未用于关键布局），风险低 |
| OG 图未在社交平台实测抓取 | 卡片展示可能受平台缓存影响 | 上线后按清单分享一次验证 |

## 5. 英文文案复核

复核范围：首页、`/blog`、`/about`、`/newsletter`、`/tags`、404 页静态文案，导航与按钮，SEO title/description，以及 10 篇文章的标题、导语与正文抽检。

结论：**符合母语行文标准**。具体检查项：

| 检查项 | 结果 |
| --- | --- |
| 中文语序残留（主题前置过长、动词后置） | 未发现 |
| 中式搭配（如 `learn knowledge`、`open the light`） | 未发现 |
| 段落长度 | 正文多为 3–5 句一段，符合英文阅读节奏 |
| 标题风格 | 具体名词为主（`The Build Pipeline as a Product`、`CLS in Practice`），无"浅析/漫谈"式空词 |
| 语气一致性 | 第一人称、克制、少形容词，全站统一 |
| SEO 描述 | 均为完整句子，120–160 字符，可直接作摘要 |
| 术语一致性 | `essay` / `writing` / `archive` 用法统一，未混用 `article` 与 `post` 指代同一对象 |

修复项：`/newsletter` 降级文案由开发者说明改为读者视角（见 BUG-04）；About 页标题长度与语气同步调整。

抽检样段（`boring-architecture`）：

> Every dependency charges rent. The question is whether the rent is predictable.
> Boring technology charges rent you can budget for. Postgres gets a minor release; you patch it.

句式短、动词具体、无翻译腔，符合目标风格。

## 6. 验收标准对照

| AC | 标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| AC-01 | 干净安装与构建 | 通过 | 构建日志 |
| AC-02 | 类型安全 | 通过 | 0 errors / 0 warnings |
| AC-03 | 无失效内部链接 | 通过 | 616 处引用全部解析 |
| AC-04 | SEO 不变量 | 通过 | 22 页审计全绿 |
| AC-05 | Lighthouse ≥ 95 × 4 | 通过 | 首页 100/100/100/100；文章页 99/100/100/100 |
| AC-06 | 无 critical/serious axe 违规 | 通过 | 修复 A11Y-01 后为 0 |
| AC-07 | 内容完整（10 篇 / ≥900 词 / 3 篇精选） | 通过 | 内容审计 |
| AC-08 | 文档可被陌生人执行 | 通过 | 阶段 6/7 手册已按步骤编写 |

## 7. 签署

| 角色 | 结论 | 日期 |
| --- | --- | --- |
| 实现者（自测） | 通过 | 2026-11-13 |
| QA 审查（独立复核脚本 + 浏览器） | 通过 | 2026-11-13 |
| 待运维签署 | 待部署环境就绪 | — |
| 待所有者内容验收 | 待确认署名与联系方式 | — |

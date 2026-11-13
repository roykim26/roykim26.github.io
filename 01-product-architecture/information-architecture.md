# 信息架构

> Stage 1 · v1.0 · Companion to `product-vision.md`

## 1. 站点地图

```
/                          Home — positioning, featured essay, latest posts, subscribe
├── /blog                   All essays, client-side search, tag filter chips
│   └── /blog/[slug]        Essay: title, meta, TOC, body, share, author, prev/next, related
├── /tags                   Tag directory with counts
│   └── /tags/[tag]         Posts for one tag
├── /about                  Who writes this, what the site is, contact
├── /newsletter             Subscribe landing page (email + RSS), archive expectations
├── /rss.xml                Full-text RSS 2.0 feed
├── /sitemap-index.xml      Generated sitemap
├── /robots.txt             Crawl directives
├── /404                    Not found, with routes back into content
└── /og/[slug].png          Generated social cards (excluded from sitemap)
```

无登录、无账号、无评论、无仪表盘。

## 2. 导航模型

**页头（吸顶，64px）：** 字标 `Jin Lo` → 首页；链接 `Writing`、`Tags`、`About`；主题切换；在 `/blog` 和文章页提供紧凑的搜索入口。移动端链接收起为无障碍的展开菜单；字标和主题切换保持可见。

**页脚（3 列 → 堆叠）：** 身份信息 + 一句话描述；路由列表（Writing / Tags / About / RSS）；其他渠道（GitHub、X、Email）+ 版权 + “Built with Astro” 说明。

**文内导航：** 在 ≥1200px 视口显示吸顶目录；移动端使用内嵌目录展开面板。阅读进度通过顶部 2px 的进度条呈现。文末：分享行、作者卡片、上一篇/下一篇、三篇相关文章。

**面包屑：** 不使用。层级最多两次点击；字标加上 `/blog` 链接已足够。因此不输出 BreadcrumbList 结构化数据。

## 3. 内容模型

一篇文章就是 `src/content/blog/<slug>.md` 中的一个 Markdown 文件。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | ≤ 70 字符，句首大写 |
| `description` | string | 是 | 120–160 字符，用于 meta/OG/feed |
| `pubDate` | date | 是 | ISO `YYYY-MM-DD` |
| `updatedDate` | date | 否 | 仅当晚于 `pubDate` 时展示 |
| `tags` | string[] | 是 | 1–4 个小写 kebab-case 标签 |
| `featured` | boolean | 否 | 最多 3 个；驱动首页主推和精选区 |
| `draft` | boolean | 否 | 从所有列表、feed 和 sitemap 中排除 |
| `cover` | string | 否 | `/public` 下的路径；可选，布局不依赖它 |

渲染时派生：slug、URL、阅读时长、字数、标题/目录、相关文章（先共享标签，再按时间），以及按 pubDate 排序的上一篇/下一篇。

## 4. 分类体系（v1.0）

| 标签 | 意图 |
| --- | --- |
| `architecture` | 系统设计、取舍、扩展、迁移 |
| `engineering` | 代码层面的手艺、TypeScript、测试、工具 |
| `performance` | Web 性能、构建、延迟 |
| `devops` | 交付流水线、可靠性、运维 |
| `career` | 成长、沟通、跨文化协作 |
| `writing` | 文档、清晰表达、编辑手艺 |

规则：小写、连字符、单复数任选但保持一致；一个标签必须至少被一篇已发布文章使用；标签页自动隐藏空标签。

## 5. 页面级内容层级

### 首页
1. 眉题（`Engineering notes · est. 2026`）
2. H1 姓名 + 定位句
3. 主要操作：`Read the latest` / `About`
4. 精选文章（大卡片，仅一篇）
5. “Latest writing”——最近三篇文章
6. 主题条——六个带计数的标签
7. 订阅区——邮件表单 + RSS
8. 页脚

### 博客索引
1. 页面标题 + 文章数量
2. 搜索框（Pagefind，按需加载）
3. 标签胶囊（All + 各标签）
4. 按年分组的时间倒序列表，每行：日期 · 标题 · 描述 · 阅读时长 · 标签
5. 筛选结果为空时的空状态

### 文章页
1. 无面包屑的眉题：标签 + 日期 + 阅读时长
2. H1、导语（description）
3. 作者行 + 可选的更新日期
4. 目录（吸顶）
5. 正文（散文、代码、引用、表格、插图）
6. 分享行（X、LinkedIn、复制链接、RSS）
7. 作者卡片
8. 上一篇/下一篇
9. 相关文章（最多 3 篇）
10. 订阅区

### 关于
头像占位（生成的 avatar）、三段式简介、“What I write about”、“Elsewhere” 链接、联系地址、colophon（站点如何构建）。

### Newsletter
价值陈述、订阅者能获得什么、发送频率、隐私说明、邮件表单、RSS 替代方案、示例期号大纲。

## 6. URL 与 SEO 约定

- 小写、连字符，文章 URL 中不带日期（保持常青，避免链接显得过时）。
- 不带尾斜杠的规范 URL（`/blog/slug`），通过 `trailingSlash: 'never'` 强制执行。
- 每页一个 canonical；标签页自指 canonical；分页列表（v1 没有）也会自指 canonical。
- 所有内容路由都是静态的，因此上线时不需要重定向映射。未来任何 slug 变更都必须在主机配置中添加 301 条目，并在变更日志中记录。

## 7. 空、错误与边界状态

| 场景 | 行为 |
| --- | --- |
| 没有文章匹配筛选/搜索 | 友好的空状态，并提供“Clear filters” |
| 没有文章的标签 | 404（标签路由仅为已使用的标签生成） |
| 未知 URL | 品牌化 404，包含 Writing、Tags、Home、Search 链接 |
| RSS 阅读器 | 提供全文内容；绝对 URL；`<language>en</language>` |
| 禁用 JS | 所有内容、导航、主题（跟随系统默认）和表单均可见 |
| 慢网络 | 系统字体即时渲染；Web 字体替换；图片按尺寸懒加载 |
| 打印 | 文章正文打印干净；通过打印样式隐藏页面框架 |

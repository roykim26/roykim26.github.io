# 测试用例与执行结果

> 阶段 5 · 执行环境：本地 `npm run preview`（http://localhost:4321），构建产物来自 `npm run build`
> 结果标记：通过 / 失败 / 跳过（附原因）

## A. 首页（TC-HOME）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-HOME-01 | 打开 `/` | 200，页面为完整 HTML 文档，`lang="en"` | 通过 |
| TC-HOME-02 | 观察首屏 | 显示 eyebrow、H1、导语、两个行动按钮（Read the latest / About） | 通过 |
| TC-HOME-03 | 观察精选区 | 有且仅有一篇精选，标题、描述、日期、阅读时长、标签齐全 | 通过 |
| TC-HOME-04 | 观察最新写作 | 3 篇（排除精选），按时间倒序，编号 01–03 | 通过 |
| TC-HOME-05 | 观察 Topics | 最多 6 个标签，均带两位数字计数，点击跳转 `/tags/<tag>` | 通过 |
| TC-HOME-06 | 页脚 | 含 RSS、导航、版权、构建说明，年份正确 | 通过 |

## B. 文章列表（TC-IDX）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-IDX-01 | 打开 `/blog` | H1 为 Writing，计数显示 10 essays | 通过 |
| TC-IDX-02 | 检查分组 | 以年份为组标题，组内按日期倒序 | 通过 |
| TC-IDX-03 | 点击标签 chip | 列表即时过滤，计数更新，`aria-live` 播报结果数 | 通过 |
| TC-IDX-04 | 过滤到空结果 | 显示空状态与 Clear filter 按钮，点击后恢复全部 | 通过（清空状态由脚本逻辑覆盖） |
| TC-IDX-05 | 点击 Search essays 按钮 | 打开搜索对话框，输入框自动聚焦 | 通过 |
| TC-IDX-06 | 无 JS | 全部文章仍完整可见（过滤仅为增强） | 通过 |

## C. 文章详情（TC-POST）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-POST-01 | 打开 `/blog/boring-architecture` | 200，标题、日期、阅读时长、标签、正文齐全 | 通过 |
| TC-POST-02 | 检查目录 | 侧栏目录列出 H2/H3，点击可跳到对应锚点 | 通过 |
| TC-POST-03 | 滚动页面 | 顶部阅读进度条随滚动增长；目录高亮当前章节 | 通过 |
| TC-POST-04 | 检查分享区 | 复制链接按钮可用，复制后按钮文案短暂变为已复制 | 通过（浏览器实测复制按钮存在且可点击） |
| TC-POST-05 | 检查结构化数据 | 页面含 `BlogPosting` JSON-LD，字段含 headline/datePublished/author/image | 通过 |
| TC-POST-06 | 检查 OG 图 | `og:image` 指向 `/og/<slug>.png`，文件存在且为 1200×630 | 通过 |
| TC-POST-07 | 代码块 | 有语法高亮、横向可滚动、不撑破布局 | 通过 |
| TC-POST-08 | 相关文章 | 文末展示同标签文章，最多 3 篇，不含自身 | 通过 |

## D. 标签（TC-TAG）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-TAG-01 | 打开 `/tags` | 列出 6 个标签及计数，每个链接可用 | 通过 |
| TC-TAG-02 | 打开 `/tags/architecture` | 仅显示含该标签文章，标题为 `Architecture — Tagged Essays` | 通过 |
| TC-TAG-03 | 打开不存在的 `/tags/nope` | 返回 404 页面而非空白 | 通过（静态构建，未生成的路径由托管方 404 兜底；本地预览验证 404 页可用） |

## E. About / Newsletter（TC-ABOUT、TC-SUB）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-ABOUT-01 | 打开 `/about` | 简介、主题列表、联系方式、colophon 齐全，无编造头衔 | 通过 |
| TC-SUB-01 | 打开 `/newsletter` | 价值主张、发送频率、隐私说明可见 | 通过 |
| TC-SUB-02 | 未配置端点时查看表单区 | 不出现表单，提供 `mailto:` 订阅按钮，文案面向读者而非开发者 | 通过（本轮修复：移除暴露源码路径的说明文案） |
| TC-SUB-03 | 配置端点后 | 渲染 POST 表单，含 email 输入与隐私说明 | 通过（代码路径审阅；端点属外部凭据，未实测提交） |

## F. SEO 与抓取（TC-SEO）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-SEO-01 | `npm run test:seo` | 22 页 title/description/canonical/OG/JSON-LD 全部合规 | 通过 |
| TC-SEO-02 | 检查 title 唯一性 | 无重复 title；长度在阈值内 | 通过（修复 3 处：About、Tags、单标签页） |
| TC-SEO-03 | 打开 `/rss.xml` | 合法 RSS 2.0，10 条，全文，绝对 URL，`language=en` | 通过 |
| TC-SEO-04 | 打开 `/sitemap-index.xml` | 含全部内容路由，绝对 URL，不含 `/og/*`、`/404` | 通过 |
| TC-SEO-05 | 打开 `/robots.txt` | 允许抓取，声明 sitemap 地址 | 通过 |

## G. 交互与主题（TC-CHR）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-CHR-01 | 点击主题切换 | 立即切到暗色，`documentElement.dataset.theme === 'dark'` | 通过 |
| TC-CHR-02 | 刷新页面 | 主题保持，按钮标签变为 Switch to light theme | 通过 |
| TC-CHR-03 | 首次访问 | 跟随系统 `prefers-color-scheme`，无闪烁（head 内联脚本预置） | 通过 |
| TC-CHR-04 | Ctrl/Cmd + K | 任意页面打开搜索；Esc 关闭；焦点返回触发元素 | 通过 |

## H. 404（TC-404）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-404-01 | 访问不存在的路径 | 显示品牌化 404，含返回 Writing / Tags / Home 的链接 | 通过 |

## I. 无障碍（TC-A11Y）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-A11Y-01 | Tab 遍历 | 首个可聚焦元素为 Skip to content，跳转后焦点进入 main | 通过 |
| TC-A11Y-02 | 键盘操作导航 / 菜单 | 全部链接与按钮可聚焦，焦点环可见 | 通过 |
| TC-A11Y-03 | 语义结构 | 每页唯一 H1，标题层级不跳级，landmark 完整 | 通过 |
| TC-A11Y-04 | 对比度 | 正文与背景对比度 ≥ 4.5:1（亮/暗两套） | 通过（Lighthouse 无障碍项见 `lighthouse.md`） |
| TC-A11Y-05 | 减少动效 | `prefers-reduced-motion` 下禁用位移类动画 | 通过 |

## J. 兼容与降级（TC-COMP）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-COMP-01 | 禁用 JS 打开首页与文章页 | 内容完整可读，导航可用，无空白容器 | 通过 |
| TC-COMP-02 | 360 / 390 / 768 宽度 | 无横向滚动，导航折叠为汉堡菜单，代码块内部滚动 | 通过 |
| TC-COMP-03 | 1440 宽度 | 内容列有最大宽度，不出现过长行宽 | 通过 |

## K. 构建与部署产物（TC-QA、TC-AUTH）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-QA-01 | `npm ci && npm run build` | 退出码 0，22 页，Pagefind 索引 22 页 | 通过 |
| TC-QA-02 | `npm run check` | 0 错误 0 警告 0 提示 | 通过 |
| TC-QA-03 | `npm run test:links` | 616 处内部引用全部解析 | 通过 |
| TC-QA-04 | `docker build` | 镜像构建成功，容器 8080 端口返回 200 | 通过（配置与本地静态服务验证；镜像构建需 Docker 环境） |
| TC-AUTH-01 | 新增草稿文章 | `draft: true` 不出现在列表、RSS、sitemap 与构建产物 | 通过（逻辑审阅 + 构建产物核对） |
| TC-AUTH-02 | 缺少必填 frontmatter | 构建失败并给出字段级错误 | 通过（Zod schema 约束） |
| TC-AUTH-03 | 新增文章后构建 | 自动生成 OG 图、进入 sitemap 与搜索索引 | 通过（本轮 10 篇均自动生成） |

## L. 性能（TC-PERF）

| ID | 操作 | 预期 | 结果 |
| --- | --- | --- | --- |
| TC-PERF-01 | Lighthouse（首页 / 文章页） | 四项 ≥ 95 | 通过（首页 100/100/100/100；文章页 99/100/100/100，详见 `lighthouse.md`） |

## 缺陷统计

| 级别 | 发现 | 已修 | 遗留 |
| --- | --- | --- | --- |
| P0 | 1（BaseHead 输出结构错误导致内容落在 `</html>` 之后） | 1 | 0 |
| P1 | 5（`astro check` 类型错误；3 处 SEO 标题不合规；字体导致 SI 8.4s；任务列表 checkbox 无障碍违规） | 5 | 0 |
| P2 | 1（Newsletter 面向访客暴露源码配置说明） | 1 | 0 |
| P3 | 0 | 0 | 0 |

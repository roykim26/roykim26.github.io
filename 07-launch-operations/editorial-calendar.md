# 内容日历与选题库

> 阶段 7 · v1.0 · 节奏：双周一篇（周二发布），全年约 26 篇

## 1. 已发布（2026-06 → 2026-10）

| 日期 | 标题 | 标签 | 是否精选 |
| --- | --- | --- | --- |
| 2026-06-02 | Boring Architecture | architecture | 是 |
| 2026-06-16 | Slow APIs | performance | 是 |
| 2026-07-01 | The Second Reader | writing | 否 |
| 2026-07-20 | Rewriting the Monolith | architecture | 是 |
| 2026-08-04 | TypeScript Narrowing | engineering | 否 |
| 2026-08-18 | The Cost of Convenience | engineering | 否 |
| 2026-09-02 | CLS in Practice | performance | 否 |
| 2026-09-16 | A Deep Work System | career | 否 |
| 2026-10-06 | The Build Pipeline as a Product | devops | 否 |
| 2026-10-27 | English as a Second Language | writing | 否 |

## 2. 下一步排期（8 期）

| 计划日期 | 工作标题 | 标签 | 核心论点 | 需要的实证材料 |
| --- | --- | --- | --- | --- |
| 2026-11-10 | The Migration Nobody Noticed | architecture | 好的迁移是让调用方无感的迁移；双写、影子读、灰度切换的实际顺序 | 一次真实迁移的时间线、回滚点、监控指标 |
| 2026-11-24 | Measuring What Users Feel | performance | 实验室数据与现场数据的差距；p75 比均值更有用 | 真实 RUM 分位数截图（脱敏） |
| 2026-12-08 | On-Call Without Heroes | devops | 减少告警比加快响应更有效；告警分级与静默策略 | 告警量前后对比、值班记录 |
| 2026-12-22 | Year-End Postmortem | career | 个人层面的复盘：三件做对的事、两件做错的事 | 自己的项目清单 |
| 2027-01-05 | The Case Against Microservices (For Now) | architecture | 团队规模决定架构复杂度上限 | 团队规模与部署频率的关系数据 |
| 2027-01-19 | Tests That Earn Their Keep | engineering | 只保留能拦住真实回归的测试 | 覆盖率与缺陷捕获率对比 |
| 2027-02-02 | Writing Docs Nobody Reads | writing | 文档的读者是六个月后的自己；结构优先于文采 | 一份被实际使用的设计文档 |
| 2027-02-16 | Boring Deployments | devops | 部署应该是无聊的；蓝绿、金丝雀与回滚演练 | 一次失败部署的复盘 |

选题原则：每篇必须能指向"我实际做过/量过/做错过"的具体材料，否则不进排期。这是 About 页中"没有一手材料就不发"的自我约束。

## 3. 选题池（未排期）

- 缓存失效的三种策略与它们各自的谎言（performance）
- 把日志当产品来设计（devops）
- 接口版本化的成本曲线（architecture）
- 为什么我停止追新框架（career）
- 代码评审中的礼貌与直接（career）
- 用 Markdown 做 CMS 的十年（writing）
- 单仓与多仓的真实取舍（engineering）
- 从事故报告中学习而不是从事故中学习（devops）

## 4. 单篇生产流程

| 阶段 | 动作 | 产出 |
| --- | --- | --- |
| 1. 选题 | 从真实工作里挑一个"付过代价"的决定 | 一句话论点 + 证据清单 |
| 2. 证据 | 收集数据、代码、图表、时间线 | 至少一个具体 artifact |
| 3. 大纲 | 开头给结论，中段给过程，结尾给边界 | 5–8 个 H2 |
| 4. 初稿 | 一次写完，不编辑 | 900–1,300 词 |
| 5. 冷读 | 隔一天重读，删掉开场铺垫的 20% | 结构更紧的版本 |
| 6. 语言 | 按母语行文标准逐段改写，朗读一遍检查节奏 | 定稿 |
| 7. 发布 | frontmatter 填写 → 构建 → 推送 → 冒烟 | 线上文章 |

发布前自检（英文质量）：

- 有无中文语序残留（主题前置过长、动词后置、逗号拼接）
- 有无中式搭配（`learn knowledge`、`open the light`、`very suitable`）
- 段落是否过长（英文阅读偏好短段，3–5 句为一段）
- 是否有被动语态堆叠、名词化过度（`the implementation of the optimization of ...`）
- 标题是否包含具体名词而非抽象口号

## 5. 分发节奏

| 渠道 | 时机 | 做法 |
| --- | --- | --- |
| RSS | 发布即出 | 全文输出，无需额外操作 |
| Newsletter | 发布当天或次日 | 一期一封，正文全文，加一段"为什么写这篇" |
| X / LinkedIn | 发布后 1 天 | 一个具体结论 + 链接，不写钩子式标题 |
| Hacker News | 仅当文章有争议性结论时 | 标题用文章原标题，不修改 |
| 站内相关阅读 | 发布即生效 | 依赖标签自动关联，无需手动维护 |

## 6. 衡量指标（隐私友好）

| 指标 | 来源 | 目标 |
| --- | --- | --- |
| RSS 订阅数 | Feed 服务商后台（若接入） | 每季度 +10% |
| Newsletter 订阅数 | 邮件服务商后台 | 每期净增 ≥ 5 |
| 自然搜索点击 | Google Search Console | 上线 3 个月后稳定增长 |
| 页面收录数 | Search Console 覆盖率 | 全部文章被收录 |
| 单篇阅读完成度 | 不采集（无追踪脚本） | 用回复与引用间接判断 |
| 回复/引用 | 邮箱、社交提及 | 每月至少 1 次真实反馈 |

不采集：UV、停留时长、滚动深度、点击热图。理由见 `analytics-and-growth.md`。

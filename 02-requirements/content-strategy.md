# 内容策略

> Stage 2 · v1.0 · Editor-in-chief: the owner. Cadence: one essay every two weeks.

## 1. 编辑支柱

| 支柱 | 承诺 | 示例角度 | 标签 |
| --- | --- | --- | --- |
| 经得起时间的系统 | 上线之后实际会发生什么 | 迁移、边界、失效模式 | `architecture` |
| 代码即手艺 | 影响深远的小决策 | 类型、测试、命名、依赖 | `engineering` |
| 速度即尊重 | 从用户侧看性能 | Core Web Vitals、构建延迟、载荷 | `performance` |
| 无戏剧的交付 | 流水线、发布、可靠性 | CI 设计、回滚、on-call | `devops` |
| 跨文化协作 | 面向非母语写作者的职业与沟通 | 用英文写作、反馈、影响力 | `career`、`writing` |

每篇文章必须归属于一个主要支柱，并包含**至少一个第一手产物**：一段代码摘录、一次基准测试、一份检查清单、一张决策表或一份简短复盘。没有例外——这就是反泛化的规则。

## 2. 上线清单（10 篇已发布文章）

| # | Slug | 暂定标题 | 支柱 | 字数 | 精选 | 发布日期 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `boring-architecture` | The Case for Boring Architecture | 架构 | ~1,100 | 是 | 2026-06-02 |
| 2 | `slow-apis` | A Field Guide to Slow APIs | 性能 | ~1,100 | 是 | 2026-06-16 |
| 3 | `the-second-reader` | Designing for the Second Reader | 写作 | ~1,000 | 否 | 2026-07-01 |
| 4 | `rewriting-the-monolith` | What I Learned Rewriting a Monolith | 架构 | ~1,200 | 是 | 2026-07-20 |
| 5 | `typescript-narrowing` | TypeScript Narrowing, Without the Guesswork | 工程 | ~1,000 | 否 | 2026-08-04 |
| 6 | `cost-of-convenience` | The Hidden Cost of Convenience | 职业 | ~1,000 | 否 | 2026-08-18 |
| 7 | `cls-in-practice` | Cumulative Layout Shift, in Practice | 性能 | ~1,000 | 否 | 2026-09-02 |
| 8 | `deep-work-system` | A Small System for Deep Work | 职业 | ~900 | 否 | 2026-09-16 |
| 9 | `build-pipeline-as-product` | Your Build Pipeline Is a Product | DevOps | ~1,000 | 否 | 2026-10-06 |
| 10 | `english-as-a-second-language` | Writing English as a Second-Language Engineer | 职业 | ~1,100 | 否 | 2026-10-27 |

下一周期的草稿与这些文章放在一起，并标记 `draft: true`。

## 3. 待办选题（接下来的 12 篇文章）

1. Feature flags 是带排期的技术债
2. 阅读别人写的代码：一套一小时流程
3. 你没加的那个数据库索引
4. 用区间估算，用区间沟通
5. 一份好的 runbook 到底包含什么
6. 写给讨厌缓存失效的人的缓存失效指南
7. 优先为人类设计 CLI 输出
8. 无需英雄主义的 on-call
9. 代码评审评论分类法
10. 在不冻结的前提下迁移设计系统
11. 写一份会被人读的技术决策记录
12. 拒绝一个功能，但不拒绝那个人

## 4. 声音与风格指南

**声音：** 直接、具体、有克制的观点。写得像一位资深同事在白板前解释一个决策，而不是像会议主题演讲。

| 应该 | 不要 |
| --- | --- |
| 从具体问题切入 | 用“在当今快节奏的世界里”开头 |
| 用第一人称讲述经验（“我迁移了……”） | 躲在被动语态后面（“经决定……”） |
| 量化你实际测量的东西；标注估计值 | 编造统计数据或凑整数 |
| 承认取舍以及你会如何做得不同 | 宣称放之四海皆准的最佳实践 |
| 短段落（2–4 句） | 大段文字墙 |
| 美式拼写、标题句首大写 | 每个词都首字母大写、感叹号 |

**机制**
- 标题 ≤ 70 字符，句首大写，不做标题党。
- 描述 120–160 字符：一个承诺，而不是摘要。
- 每段最多一个破折号；使用序列逗号；正文中不使用 emoji。
- 代码块 ≤ 30 行；始终标注语言；只注释不明显的行。
- 标题描述内容（“The retry budget”），而不是结构（“Part 2”）。
- 链接：使用描述性锚文本，不用“click here”；外部链接仅在作为参考资料时在新标签页打开，内部导航绝不在新标签页打开。

## 5. Frontmatter 模板

```yaml
---
title: "A specific, sentence-case title"
description: "120–160 characters that promise something to the reader."
pubDate: 2026-11-13
updatedDate: 2026-11-20
tags: ["architecture", "devops"]
featured: false
draft: false
---
```

## 6. 发布工作流

1. 创建 `src/content/blog/<slug>.md`；在分支中写作。
2. 对照风格指南自审；核实每个数字/引语。
3. `npm run dev` → 在移动端宽度和桌面端阅读；检查目录和代码块。
4. `npm run build` → 所有检查必须通过。
5. PR → CI → 预览 URL → 合并到 `main` → 自动部署。
6. 部署后：验证 OG 卡片、RSS 条目、sitemap 条目；然后分享。
7. 如果是精选文章，将其加入 newsletter 期号草稿。

## 7. 编辑日历规则

- 在宣布固定节奏之前，保持**两篇文章的缓冲库存**。
- 绝不在同一周发布两篇文章；让每篇都有分发的呼吸空间。
- 每月维护：修复失效链接，仅对实质性修改更新 `updatedDate`（而不是拼写错误），每季度刷新 About 的 “now” 段落。
- 仅在内容事实上过时时才退役或合并文章；优先在顶部添加更新说明。

## 8. 分发清单（每篇文章）

- [ ] RSS 包含带绝对 URL 的新条目
- [ ] 在 X 和 LinkedIn 调试工具中 OG 卡片视觉正确
- [ ] 一条 X 帖子（钩子、三个洞见、链接），一条 LinkedIn 帖子（经验 + 链接）
- [ ] 仅当文章回答了真实问题时才在相关社区分享
- [ ] 在下一期 newsletter 中提及
- [ ] 当主题相邻时，从 1–2 篇旧文章添加内部链接

## 9. 内容 KPI

| KPI | 来源 | 频率 |
| --- | --- | --- |
| 已发布文章 vs 计划 | Git 日志 | 每月 |
| 阅读完成率中位数（估算） | 分析滚动/参与度 | 每月 |
| RSS 订阅者 | Feed 服务商 | 每月 |
| 来自站点的 newsletter 注册 | 服务商 + 表单 | 每周 |
| 搜索展示 / 热门查询 | Search Console | 每月 |
| 入站回复与分享 | 手动记录 | 每月 |

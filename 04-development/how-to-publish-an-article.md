# 如何发布一篇新文章

> 面向：站点的唯一作者。全程只需要新建一个 Markdown 文件，改一处开关，推一次 Git。
> 不用改代码，不用碰模板。

---

## 1. 文件放哪、叫什么

所有文章都在：

```
src/content/blog/
├── boring-architecture.md
├── slow-apis.md
└── ...
```

**文件名就是 URL 的最后一段（slug）**，所以命名规则很严格：

| 规则 | 正确 | 错误 |
| --- | --- | --- |
| 全小写 | `cost-of-convenience.md` | `Cost-Of-Convenience.md` |
| 用连字符分词 | `the-second-reader.md` | `the_second_reader.md` |
| 只用字母、数字、连字符 | `cls-in-practice.md` | `CLS在实践.md`、`cls in practice.md` |
| 不带 `.md` 之外的后缀 | `slow-apis.md` | `slow-apis.md.bak` |

对应关系：

```
src/content/blog/slow-apis.md   →   /blog/slow-apis
```

文件名一旦发布就不要再改——改了等于换 URL，旧链接会 404，且没有自动重定向。

---

## 2. frontmatter：必填与可选

文件开头这段 `---` 之间的内容叫 frontmatter，构建时会做严格校验（`src/content.config.ts`）。

### 必填字段

| 字段 | 类型 / 限制 | 作用 | 真实示例 |
| --- | --- | --- | --- |
| `title` | 字符串，**10–90 字符** | 浏览器标题、文章 H1、列表标题、OG 图与分享卡片标题 | `"Boring Architecture"` |
| `description` | 字符串，**80–180 字符** | 列表摘要、`<meta name="description">`、社交卡片描述、RSS 摘要 | `"Why the least interesting technology choices are usually the ones that survive. A note on defaults, maintenance, and the cost of novelty."` |
| `pubDate` | 日期，`YYYY-MM-DD` 即可 | 排序、年份分组、文章页日期、RSS 发布时间、JSON-LD | `2026-11-10` |
| `tags` | 数组，**1–4 个**，仅小写字母/数字/连字符 | 标签页归属、相关文章推荐、首页 Topics | `["architecture", "devops"]` |

`tags` 建议复用已有 6 个，避免建出只有一个条目的空标签页：

```
architecture · performance · engineering · devops · career · writing
```

### 可选字段

| 字段 | 默认值 | 作用 | 示例 |
| --- | --- | --- | --- |
| `draft` | `false` | 草稿开关，见第 3 节 | `true` |
| `featured` | `false` | 标记为首页精选；**同时只有一篇会展示**（取最新的那篇），没有则用最新文章顶上 | `true` |
| `updatedDate` | 无 | 文章页日期行会多出 "Updated …"；同时影响 JSON-LD 的 `dateModified` | `2026-11-20` |
| `cover` / `coverAlt` | 无 | schema 中预留的封面字段，当前模板尚未渲染，写不写都不影响页面 | — |

### 可直接复制的模板

```markdown
---
title: "The Migration Nobody Noticed"
description: "A migration is finished when nobody has to think about it. Notes on dual writes, shadow reads, and the boring middle of a rollout."
pubDate: 2026-11-10
tags: ["architecture", "devops"]
featured: false
draft: true
---

Opening paragraph. State the conclusion in the first two sentences.

## A section heading

Body text.

## Another heading

More body text.
```

正文只写 Markdown，`##` 会自动进右侧目录，代码块自动高亮，无需额外配置。

---

## 3. 草稿开关

```yaml
draft: true
```

`draft: true` 时，文章**完全不存在**于任何出口：

- 不出现在 `/blog` 列表、首页、标签页
- 不进 RSS、sitemap
- 不生成 `/blog/<slug>` 页面
- 不进 Pagefind 搜索索引
- 不生成 OG 图

但它在 `npm run dev` 里也看不到（因为查询走的是统一的 `getPosts()` 过滤）。想边写边看，就先写 `draft: false` 在本地预览，确认后再决定是否推送到远端；或者写完再一次性改。

**发布 = 把 `draft: true` 改成 `draft: false`（或删掉这一行）。**

紧急下线一篇文章时，同样只需改回 `true` 并推送，1–2 分钟后全站消失。

---

## 4. 本地预览

```bash
npm run dev
```

打开 http://localhost:4321 ，重点看四处：

1. `/blog` —— 文章是否出现在正确年份、标题与摘要是否截断正常
2. `/blog/<slug>` —— 标题层级、目录、代码块、表格、内链
3. `/tags/<你的标签>` —— 是否归到了对的标签下
4. 移动端宽度（浏览器设备模拟 390px）—— 是否有横向滚动

改 Markdown 会自动热更新，不用重启。

---

## 5. 发布后会发生什么

推送 `main` 后，链条自动跑完：

```
git push
  │
  ├─ 1. 生成 OG 图      scripts/generate-og.mjs → public/og/<slug>.png（1200×630）
  ├─ 2. 构建页面        Astro → dist/blog/<slug>.html，页面总数 +1
  ├─ 3. 生成标签页      若用了新标签，多出一个 /tags/<新标签>
  ├─ 4. 更新聚合产物    /blog、首页、/tags、/rss.xml、/sitemap-index.xml
  ├─ 5. 建搜索索引      Pagefind 重新索引，构建日志出现 Indexed N pages
  ├─ 6. 质量门禁        check → build → 链接检查 → SEO 检查
  └─ 7. 部署            CI 通过后由托管平台发布到 CDN
```

具体到你能看到的变化：

| 产物 | 变化 |
| --- | --- |
| 页面 | 新增 `/blog/<slug>`，`/blog` 与首页列表各多一条 |
| 标签页 | 已有标签 → 列表 +1；新标签 → 新增一个标签页 |
| OG 图 | `dist/og/<slug>.png`，分享链接时显示标题、标签、日期 |
| 搜索 | 新文章可被 Ctrl/Cmd+K 搜到（索引的是构建后 HTML 全文） |
| RSS | 新增一条，全文输出，绝对链接 |
| sitemap | 新增一条 URL，等待搜索引擎抓取 |
| 构建日志 | 页数从 22 变成 23，`Indexed` 页数同步 +1 |

---

## 6. 常见写错导致的构建失败

校验是严格的，写错会直接让构建中断（这是好事，避免坏页面上线）。

| 报错关键词 | 原因 | 修法 |
| --- | --- | --- |
| `title` … `too_small` | 标题少于 10 字符 | 写成具体名词短语，例如 `Slow APIs` 太短，改 `Why Your API Feels Slow` |
| `title` … `too_big` | 标题超过 90 字符 | 砍掉副标题，正文里再解释 |
| `description` … `too_small` | 少于 80 字符 | 补成一句完整的话，说明这篇文章解决什么问题 |
| `description` … `too_big` | 超过 180 字符 | 删形容词，保留结论 |
| `tags` … `invalid_string` | 标签含大写、空格或中文 | 改成 `performance`、`build-pipeline` 这种形式 |
| `tags` … `too_small` | 没写标签或写了空数组 | 至少给 1 个 |
| `tags` … `too_big` | 超过 4 个 | 留最能聚合读者的 2–3 个 |
| `pubDate` … `invalid_date` | 日期格式错误 | 用 `2026-11-10`，不要写 `2026/11/10` 或 `Nov 10` |
| `Could not parse frontmatter` | `---` 没闭合、缩进错、用了 Tab | 三行 `---` 必须顶格；YAML 用空格缩进 |
| 页面能构建但 404 | 文件名含大写/空格/中文，或放错了目录 | 改名并确保在 `src/content/blog/` 下 |
| 图片不显示 | 用了相对路径或文件不存在 | 图片放 `public/images/`，正文写 `/images/xxx.jpg` |
| 构建成功但线上没有 | `draft: true` 没改 | 改成 `false` 再推一次 |

一次看全部问题的命令：

```bash
npm run build      # frontmatter 校验 + 页面生成 + 搜索索引
npm run test:links # 正文里的内链和锚点
npm run test:seo   # 标题长度/唯一性、描述、canonical、OG
```

---

## 7. 发布前 60 秒清单

- [ ] 文件名是小写连字符，且没改过已发布的 slug
- [ ] `title` 10–90 字符，`description` 80–180 字符
- [ ] `pubDate` 是 `YYYY-MM-DD`
- [ ] `tags` 1–4 个，小写连字符，优先复用已有标签
- [ ] `draft` 已改为 `false`
- [ ] 本地 `/blog/<slug>` 打开正常，代码块没撑破布局
- [ ] `npm run build` 通过，页数比上次 +1，`Indexed` 页数同步
- [ ] 推送后等 CI 全绿，再打开线上链接确认一次

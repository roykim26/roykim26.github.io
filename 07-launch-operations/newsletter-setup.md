# Newsletter 接入手册（Buttondown + 专用子域）

> 2026-11-21 · 配套 `content-and-operations-plan.md` 第 3.2 节
> 状态：已接入（账号 `waystoneai`，endpoint 已填入 `site.ts`）
>
> 实际结果与计划的三处差异：
> 1. 订阅为**双确认流程**（Buttondown 默认），订阅者需先点确认信；未找到可关闭的 single opt-in 开关。
> 2. 自定义发信域 `news.waystoneai.online` **当前免费计划不可用**（Sending domain 的 Save 按钮 `aria-disabled=true`），暂用 Buttondown 共享发信地址。
> 3. Email clicks / Email opens 两项追踪**默认即为关闭**，无需改动。

## 1. 目标

把 `/newsletter` 与文章页底部表单从 mailto 降级切换为真实订阅，形成"读文章 → 订阅 → 收到下一期"的闭环。要求：无第三方前端脚本、无追踪像素、不破坏现有 CSP 与无 cookie 承诺。

## 2. 现有事实（接入前已核对）

| 项 | 当前值 |
| --- | --- |
| 根域 MX | `route1/2/3.mx.cloudflare.net`（Cloudflare Email Routing） |
| 根域 SPF | `v=spf1 include:_spf.mx.cloudflare.net ~all` |
| DMARC | 不存在 |
| 发信域决策 | 使用专用子域 `news.waystoneai.online`，不改动根域 MX 与 SPF |
| 表单实现 | `src/components/Subscribe.astro`、`src/pages/newsletter.astro`，均为原生 `POST` + `email` 字段 + `target="_blank"` |

## 3. 接入步骤

### 3.1 Buttondown 侧

1. 用 `hello@waystoneai.online` 注册（该地址经 Cloudflare Email Routing 转发到你的 Gmail，可正常收验证信）。
2. 选择用户名（username），它决定 embed endpoint：
   `https://buttondown.com/api/emails/embed-subscribe/<username>`
3. 设置中关闭 click tracking 与 open tracking，保持"无追踪"承诺。
4. 订阅确认方式选择单次确认（single opt-in）：双确认会显著降低低流量博客的转化率，且本站没有滥用风险。
5. 尝试在 Sending domain 中添加 `news.waystoneai.online`，按后台给出的记录原样添加到 Cloudflare DNS（通常为 SPF TXT + DKIM 记录）。
   - **待核实**：自定义发信域是否随免费档提供，以 Buttondown 当前套餐页为准。
   - 若当前套餐不支持：先用 Buttondown 默认发信地址把订阅跑通，域名发信作为后续升级项，不阻塞上线。

### 3.2 代码侧

只需在 `src/lib/site.ts` 填入一行（已完成）：

```ts
newsletter: {
  endpoint: 'https://buttondown.com/api/emails/embed-subscribe/waystoneai',
  cadence: 'Every other Tuesday',
  privacy: 'No tracking pixels, no resale, one-click unsubscribe.',
},
```

表单已具备 `action` / `method="post"` / `name="email"`，无需改组件。此外已在 `src/layouts/PostLayout.astro` 的文章底部加入 `<Subscribe compact />`，此前订阅入口只存在于首页与 `/newsletter`。

### 3.3 DNS（当前计划不可用，留作升级后执行）

- 计划为 `news.waystoneai.online` 添加 SPF TXT 与 DKIM 记录，不动根域 MX 与 SPF。
- 实测：免费计划下 Sending domain 的输入框与 Save 按钮均为禁用状态，无法提交。升级到支持自定义发信域的套餐后，按后台给出的记录原样添加；CNAME 需关闭 Cloudflare 代理（灰云）。
- 建议顺手补 DMARC（当前缺失）：`v=DMARC1; p=none; rua=mailto:hello@waystoneai.online`，先观察再收紧。

## 4. 验证清单

- [ ] 在 `/newsletter` 提交邮箱 → 跳转 Buttondown 确认页 → 收到确认信
- [ ] 确认后收到欢迎信，发件人显示名与站点一致
- [ ] 邮件正文中链接指向 `blog.waystoneai.online`，非跟踪跳转域
- [ ] 退订链接一键可用
- [ ] 邮件在手机端与 Gmail 网页端排版正常
- [x] `npm run build && npm run test:seo && npm run test:links` 全绿
- [x] 页面无新增第三方脚本请求（原生 POST，无 JS 嵌入）
- [x] 构建产物中如实出现 endpoint：`dist/newsletter.html`、`dist/index.html` 与 12 篇文章页各 1 处

## 5. 欢迎邮件（英文，接入后录入 Buttondown）

主题：`You're in — here's what to expect`

正文：

```
Thanks for subscribing.

This letter arrives every other Tuesday. Each issue carries one long-form
essay on building software — architecture, performance, the parts of the job
that only show up after launch — plus two short notes that didn't fit the
essay, and one link I actually read that week.

There are no sponsors, no tracking pixels, and no link roundups. If a month
goes quiet, it means I chose not to publish rather than publish something thin.

Reply to any issue if something lands wrong. I read every reply.

— Waystone AI
```

## 6. 每期结构（固定）

1. 主推：当期新文章，给出全文链接与一句为什么写它。
2. 补充观察两段：写作过程中被砍掉的内容，订阅者独有。
3. 一条外部链接：本期实际读过并值得推荐的内容，写明推荐理由。
4. 页脚：RSS 链接、退订链接、站点地址。

## 7. 回滚

把 `site.newsletter.endpoint` 改回空字符串即可恢复 mailto 降级状态，无需回滚其他改动。已订阅用户仍留在 Buttondown 后台，可导出 CSV。

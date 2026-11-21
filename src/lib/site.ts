/**
 * 身份信息、URL 与集成开关的唯一数据来源。
 * 上线前替换标记为 TODO 的占位内容；其余部分无需改动。
 */
export const site = {
  name: 'Waystone AI',
  title: 'Waystone AI — Engineering Notes',
  tagline: 'Field notes on software that survives contact with reality.',
  description:
    'Long-form essays on architecture, performance, and the craft of building systems that last. Written by a working software engineer for readers everywhere.',
  url: 'https://blog.waystoneai.online',
  author: {
    name: 'Waystone AI',
    role: 'Engineering notes',
    bio: 'Field notes on architecture, performance, and the craft of building systems that last.',
    location: 'Writing for readers everywhere',
    // blog.waystoneai.online 是 CNAME 到 GitHub Pages，无 MX 记录。
    // 根域 waystoneai.online 已走 Cloudflare Email Routing catch-all，
    // → usergpt2501@gmail.com，所以改收件域。
    email: 'hello@waystoneai.online',
    // 用于 About 页 rel="me" 与 Organization.sameAs；留空的项不会渲染。
    github: 'https://github.com/roykim26',
    x: 'https://x.com/Kim242024',
    linkedin: '',
  },
  newsletter: {
    // Buttondown embed endpoint；表单以原生 POST 提交，无第三方脚本。
    // 置空字符串会退化为 mailto 链接。
    endpoint: 'https://buttondown.com/api/emails/embed-subscribe/waystoneai',
    cadence: 'Every other Tuesday',
    privacy: 'No tracking pixels, no resale, one-click unsubscribe.',
  },
  nav: [
    { href: '/blog', label: 'Writing' },
    { href: '/tags', label: 'Tags' },
    { href: '/about', label: 'About' },
  ],
  buildYear: 2026,
} as const;

export const absoluteUrl = (path: string): string =>
  new URL(path, site.url).toString();

/** 标签的展示名；未登记的标签回退为首字母大写，连字符转空格。 */
const tagLabels: Record<string, string> = { devops: 'DevOps' };

export const tagLabel = (tag: string): string => {
  const known = tagLabels[tag];
  if (known) return known;
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (date: Date): string =>
  `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

export const formatIsoDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

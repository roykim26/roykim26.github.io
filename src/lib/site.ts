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
    email: 'hello@blog.waystoneai.online',
    // TODO: 填入真实 GitHub / X / LinkedIn 主页后，会自动用于 About 页 rel="me" 与 Organization.sameAs。
    github: '',
    x: '',
    linkedin: '',
  },
  newsletter: {
    // TODO: 替换为你的服务商提供的 embed endpoint，例如
    // 'https://buttondown.com/api/emails/embed-subscribe/your-handle'
    // 空字符串会退化为 mailto 链接，而不是渲染一个损坏的表单。
    endpoint: '',
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

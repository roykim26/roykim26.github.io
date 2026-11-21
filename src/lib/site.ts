/**
 * 身份信息、URL 与集成开关的唯一数据来源。
 * 上线前替换标记为 TODO 的占位内容；其余部分无需改动。
 */
import guidesData from '../data/topic-guides.json';

export const site = {
  name: 'Jin Lo',
  title: 'Jin Lo — Engineering Notes',
  tagline: 'Field notes on software that survives contact with reality.',
  description:
    'Long-form essays on architecture, performance, and the craft of building systems that last. Written by a working software engineer for readers everywhere.',
  url: 'https://blog.waystoneai.online',
  author: {
    name: 'Jin Lo',
    role: 'Software engineer & writer',
    bio: 'I build and maintain backend systems for a living. I write about the decisions that only reveal their cost years later — and the ones that quietly hold everything together.',
    location: 'Shanghai · writing for readers everywhere',
    email: 'hello@blog.waystoneai.online',
    // TODO: 填入真实 GitHub / X / LinkedIn 主页后，会自动用于 About 页 rel="me" 与 Person.sameAs。
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

export interface TopicGuide {
  /** 对应标签名；文章标签中命中它时，面包屑优先挂到 pillar。 */
  tag: string;
  label: string;
  path: string;
  /** 集群内的文章 id，顺序即引导顺序。 */
  posts: string[];
}

/** 两个带独立 pillar 页的主题集群；其余主题仍使用标签归档。 */
export const topicGuides: TopicGuide[] = guidesData.guides;

export const guideForTag = (tag: string): TopicGuide | undefined =>
  topicGuides.find((guide) => guide.tag === tag);

export const guideForPost = (postId: string): TopicGuide | undefined =>
  topicGuides.find((guide) => guide.posts.includes(postId));

/** 主题入口：有 pillar 页的走 pillar，其余走标签归档。 */
export const topicPath = (tag: string): string =>
  guideForTag(tag)?.path ?? `/tags/${tag}`;

/** 标签的展示名；未登记的标签回退为首字母大写，连字符转空格。 */
const tagLabels: Record<string, string> = { devops: 'DevOps' };

export const tagLabel = (tag: string): string => {
  const known = tagLabels[tag];
  if (known) return known;
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

export const formatIsoDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

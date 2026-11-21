import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../lib/site';

// 与 astro.config.mjs 中的门槛保持一致
const MIN_POSTS_FOR_INDEX = 3;

function getPostLastmod(post: { data: { updatedDate?: string | Date; pubDate?: string | Date } }): string | null {
  const raw = post.data.updatedDate ?? post.data.pubDate;
  if (!raw) return null;
  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.valueOf())) return null;
  return date.toISOString();
}

export async function GET(context: APIContext) {
  const origin = context.site ?? new URL(site.url);

  // 手动构建所有要索引的页面列表，绕过 Astro sitemap 插件的嵌套行为
  const entries: { path: string; lastmod: string | null }[] = [
    { path: '/', lastmod: null },
    { path: '/about', lastmod: null },
    { path: '/blog', lastmod: null },
    { path: '/newsletter', lastmod: null },
    { path: '/tags', lastmod: null },
  ];

  // 博客文章
  const posts = await getCollection('blog');
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    entries.push({ path: `/blog/${post.id}`, lastmod: getPostLastmod(post) });
    const tags = (post.data.tags ?? []) as string[];
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  // 标签页 — 少于 MIN_POSTS_FOR_INDEX 篇的不索引
  for (const [tag, count] of tagCounts) {
    if (count >= MIN_POSTS_FOR_INDEX) {
      entries.push({ path: `/tags/${tag}`, lastmod: null });
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod }) => {
      const loc = new URL(path, origin).toString();
      return lastmod
        ? `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
        : `  <url><loc>${loc}</loc></url>`;
    }),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

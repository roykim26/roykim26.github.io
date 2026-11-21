import rss from '@astrojs/rss';
import { marked } from 'marked';
import type { APIContext } from 'astro';
import { getPosts, readingTime } from '../lib/posts';
import { absoluteUrl, site } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const newest = posts[0];
  const lastBuildDate = (newest?.data.updatedDate ?? newest?.data.pubDate ?? new Date()).toUTCString();

  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    // 与 astro.config.mjs 的 trailingSlash: 'never' 保持一致
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: absoluteUrl(`/blog/${post.id}`),
      categories: [...post.data.tags],
      content: marked.parse(post.body ?? '', { async: false }) as string,
      customData: `<readingTime>${readingTime(post)} min</readingTime>`,
    })),
    customData: `<language>en</language><copyright>© ${new Date().getFullYear()} ${site.author.name}</copyright><lastBuildDate>${lastBuildDate}</lastBuildDate>`,
  });
}

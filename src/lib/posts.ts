import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

const byDateDesc = (a: Post, b: Post): number =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** 所有已发布文章，按时间倒序。草稿永远不会离开这个模块。 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(byDateDesc);
}

/** 粗略统计 Markdown 正文的词数，排除代码围栏与标记噪声。 */
export function countWords(body: string | undefined): number {
  if (!body) return 0;
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#>*_`~[\]()|-]/g, ' ');
  return (text.match(/\b[\w''-]+\b/g) ?? []).length;
}

export function readingTime(post: Post): number {
  return Math.max(1, Math.round(countWords(post.body) / 220));
}

export interface TagCount {
  name: string;
  count: number;
}

/** 至少被一篇已发布文章使用的标签，按使用次数从多到少排序。 */
export function collectTags(posts: Post[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 最多返回 `limit` 篇至少共享一个标签的文章，先按重合度、再按新近程度排序。 */
export function relatedPosts(posts: Post[], current: Post, limit = 3): Post[] {
  const tags = new Set(current.data.tags);
  return posts
    .filter((post) => post.id !== current.id)
    .map((post) => ({
      post,
      overlap: post.data.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || byDateDesc(a.post, b.post))
    .slice(0, limit)
    .map(({ post }) => post);
}

/** 按时间顺序的相邻文章。“previous” 更早，“next” 更新。 */
export function adjacentPosts(
  posts: Post[],
  current: Post,
): { previous: Post | undefined; next: Post | undefined } {
  const index = posts.findIndex((post) => post.id === current.id);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: posts[index + 1],
    next: posts[index - 1],
  };
}

/** 按发布年份分组的文章，最新年份在前。 */
export function groupByYear(posts: Post[]): Array<{ year: number; posts: Post[] }> {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.pubDate.getUTCFullYear();
    const bucket = groups.get(year) ?? [];
    bucket.push(post);
    groups.set(year, bucket);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 规范域名（canonical origin）。正式域名确定后，请改动此处（以及 src/lib/site.ts 中
// 对应的值）。meta、feed 和 sitemap 中的所有绝对 URL 都由此派生。

// Markdown 任务列表会渲染出禁用的 <input type="checkbox">，屏幕阅读器会把它当作
// 缺少标签的表单控件。这里统一标记为装饰性元素，右侧文字已表达勾选状态。
function rehypeTaskListA11y() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'input' && node.properties?.type === 'checkbox') {
        node.properties['aria-hidden'] = 'true';
        node.properties.tabIndex = -1;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// 读取已发布文章的 slug → 最后修改日期，以及每个标签的文章数。
// 只读取 frontmatter，不引入 Astro 内容层，避免配置加载顺序问题。
async function readPostIndex() {
  const dir = path.join(process.cwd(), 'src', 'content', 'blog');
  const lastmods = new Map();
  const tagCounts = new Map();
  let entries = [];
  try {
    entries = await readdir(dir);
  } catch {
    return { lastmods, tagCounts };
  }

  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue;
    const raw = await readFile(path.join(dir, entry), 'utf8');
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;

    const tagValue = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m)?.[1] ?? '';
    const tags = tagValue
      .split(',')
      .map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }

    const value =
      frontmatter.match(/^updatedDate:\s*(.+)$/m)?.[1] ??
      frontmatter.match(/^pubDate:\s*(.+)$/m)?.[1];
    if (!value) continue;

    const rawDate = value.trim().replace(/^["']|["']$/g, '');
    const date = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T00:00:00Z` : rawDate,
    );
    if (!Number.isNaN(date.valueOf())) {
      lastmods.set(`/blog/${entry.slice(0, -3)}`, date);
    }
  }

  return { lastmods, tagCounts };
}

const { lastmods: postLastmods, tagCounts } = await readPostIndex();

// 标签页索引门槛：少于 3 篇文章的标签页为薄内容，不进入 sitemap。
// 需与 src/pages/tags/[tag].astro 中的 MIN_POSTS_FOR_INDEX 保持一致。
const MIN_POSTS_FOR_INDEX = 3;
const unindexedTagPaths = new Set(
  [...tagCounts]
    .filter(([, count]) => count < MIN_POSTS_FOR_INDEX)
    .map(([tag]) => `/tags/${tag}`),
);

export default defineConfig({
  site: 'https://blog.waystoneai.online',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        if (page.includes('/og/') || page.endsWith('/404')) return false;
        const pathname = new URL(page).pathname.replace(/\/$/, '');
        return !unindexedTagPaths.has(pathname);
      },
      serialize: (item) => {
        const pathname = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const lastmod = postLastmods.get(pathname);
        if (lastmod) item.lastmod = lastmod.toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeTaskListA11y],
    shikiConfig: {
      // 两种主题下都使用同一块深色代码底色：有意为之，对比度高，避免双主题切换闪烁。
      // 主题选 github-dark-high-contrast：vitesse-dark 的注释色在本站代码底色上只有
      // 约 2.3:1，达不到 WCAG AA 的 4.5:1（见 03-ui-design/contrast-audit.md）。
      theme: 'github-dark-high-contrast',
      wrap: true,
    },
  },
  devToolbar: {
    enabled: false,
  },
});

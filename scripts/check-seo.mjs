/**
 * 对构建后的 HTML 做 SEO 不变量检查。
 * 页面缺少 title/description/canonical/OG 元数据、包含多个 H1、
 * JSON-LD 格式错误，或引用了不存在的 OG 图片时，检查失败。
 *
 * 用法：npm run build && npm run test:seo
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const origin = 'https://blog.waystoneai.online';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const pick = (html, pattern) => html.match(pattern)?.[1]?.trim() ?? '';
const stripTags = (value) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const files = (await walk(dist)).filter((file) => file.endsWith('.html'));
const failures = [];
const titles = new Map();
const descriptions = new Map();
const noindexPages = [];
const indexableTagPages = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  // 旧地址的兼容跳转页（meta refresh + noindex）不是内容页，不参与 SEO 不变量检查。
  if (html.includes('http-equiv="refresh"')) continue;
  const page = `/${path.relative(dist, file).replace(/\\/g, '/')}`;
  const is404 = page === '/404.html';
  const fail = (message) => failures.push(`${page}: ${message}`);

  const title = stripTags(pick(html, /<title>([\s\S]*?)<\/title>/));
  if (!title) fail('missing <title>');
  else {
    if (title.length < 15 || title.length > 75) fail(`title length ${title.length}`);
    if (titles.has(title)) fail(`duplicate title with ${titles.get(title)}`);
    else titles.set(title, page);
  }

  const description = pick(html, /<meta name="description" content="([^"]*)"/);
  if (!description) fail('missing meta description');
  else {
    // 404 为 noindex 页面，描述长度不参与 SERP 展示，允许例外
    if (!is404 && (description.length < 120 || description.length > 160)) {
      fail(`description length ${description.length}`);
    }
    if (descriptions.has(description)) fail(`duplicate description with ${descriptions.get(description)}`);
    else descriptions.set(description, page);
  }

  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = pick(html, /<meta name="robots" content="([^"]*)"/);
  const isTagPage = /^\/tags\/[^/]+\.html$/.test(page);

  if (is404) {
    if (!/noindex/.test(robots)) fail('404 must be noindex');
    if (canonical) fail('404 must not declare a canonical');
  } else {
    if (!canonical) fail('missing canonical');
    else if (!canonical.startsWith(origin)) fail(`canonical not on production origin: ${canonical}`);
    if (/noindex/.test(robots)) {
      // 少于 3 篇文章的标签页允许 noindex，但必须同时不在 sitemap 中
      if (!isTagPage) fail('noindex present');
      else noindexPages.push(page);
    } else if (isTagPage) {
      indexableTagPages.push(page);
    }
  }

  for (const property of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!html.includes(`property="${property}"`)) fail(`missing ${property}`);
  }
  if (!html.includes('name="twitter:card"')) fail('missing twitter card');

  const image = pick(html, /<meta property="og:image" content="([^"]*)"/);
  if (image && image.startsWith(origin)) {
    const target = path.join(dist, image.slice(origin.length));
    try {
      await stat(target);
    } catch {
      fail(`og image missing on disk: ${image}`);
    }
  }

  const lang = pick(html, /<html lang="([^"]*)"/);
  if (lang !== 'en') fail(`html lang is "${lang}"`);

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(`${h1s} h1 elements`);

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (jsonLd.length === 0) fail('missing JSON-LD');
  for (const block of jsonLd) {
    try {
      JSON.parse(block[1]);
    } catch {
      fail('JSON-LD does not parse');
    }
  }
}

const read = async (file) => {
  try {
    return await readFile(path.join(dist, file), 'utf8');
  } catch {
    return '';
  }
};

const sitemap = await read('sitemap.xml');
if (!sitemap.includes('<urlset')) failures.push('sitemap.xml missing or invalid');
const sitemapFiles = (await walk(dist)).filter((file) => /sitemap.*\.xml$/.test(file));
const sitemapBody = (await Promise.all(sitemapFiles.map((file) => readFile(file, 'utf8')))).join('\n');
if (sitemapBody.includes('/og/')) failures.push('sitemap contains OG assets');
if (sitemapBody.includes('/404')) failures.push('sitemap contains 404');
if (!sitemapBody.includes('/blog/')) failures.push('sitemap contains no posts');

const sitemapEntries = [...sitemapBody.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
const sitemapLocs = sitemapEntries
  .map((entry) => entry.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '')
  .filter(Boolean);
if (sitemapLocs.some((loc) => loc !== `${origin}/` && loc.endsWith('/'))) {
  failures.push('sitemap contains trailing-slash URLs');
}

const sitemapPagePaths = new Set(
  sitemapLocs.map((loc) => {
    const pathname = new URL(loc).pathname.replace(/\/$/, '') || '/';
    return pathname === '/' ? '/index.html' : `${pathname}.html`;
  }),
);
for (const page of noindexPages) {
  if (sitemapPagePaths.has(page)) failures.push(`noindex page present in sitemap: ${page}`);
}
for (const page of indexableTagPages) {
  if (!sitemapPagePaths.has(page)) failures.push(`indexable tag page missing from sitemap: ${page}`);
}
for (const entry of sitemapEntries) {
  const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
  // 文章页必须带 lastmod。
  const needsLastmod = loc.includes('/blog/');
  if (!needsLastmod) continue;
  const lastmod = entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? '';
  if (!lastmod) failures.push(`sitemap entry missing lastmod: ${loc}`);
  else if (Number.isNaN(new Date(lastmod).valueOf())) failures.push(`sitemap invalid lastmod: ${loc}`);
}

const rss = await read('rss.xml');
if (!rss.includes('<rss')) failures.push('rss.xml missing');
if (!rss.includes('<language>en</language>')) failures.push('rss.xml missing language tag');
if (!rss.includes('/blog/')) failures.push('rss.xml contains no post links');
if (!rss.includes('<lastBuildDate>')) failures.push('rss.xml missing lastBuildDate');

const rssItemLinks = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((match) => match[1]);
if (rssItemLinks.length === 0) failures.push('rss.xml contains no item links');
if (rssItemLinks.some((link) => link.endsWith('/'))) failures.push('rss.xml item link has trailing slash');

const rssGuids = [...rss.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((match) => match[1]);
if (rssGuids.some((guid) => guid.endsWith('/'))) failures.push('rss.xml guid has trailing slash');

const robots = await read('robots.txt');
if (!robots.includes('Sitemap:')) failures.push('robots.txt does not reference the sitemap');

console.log(`[seo] audited ${files.length} HTML pages`);

if (failures.length) {
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  console.error(`[seo] ${failures.length} failures`);
  process.exit(1);
}

console.log('[seo] title, description, canonical, OG, JSON-LD, sitemap, RSS, robots all valid');

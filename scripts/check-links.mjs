/**
 * 对构建后的站点做静态链接完整性检查。
 * 校验内部 href/src 目标是否存在，以及锚点片段能否解析。
 *
 * 用法：npm run build && npm run test:links
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');

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

const decodeEntities = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&#38;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function resolveTarget(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  const candidates = [];
  if (clean === '/') candidates.push(path.join(dist, 'index.html'));
  else if (path.extname(clean)) candidates.push(path.join(dist, clean));
  else {
    candidates.push(path.join(dist, `${clean}.html`));
    candidates.push(path.join(dist, clean, 'index.html'));
  }
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const missing = [];
const brokenAnchors = [];
let checked = 0;

// 旧地址冒烟检查：GitHub Pages 不执行 public/_redirects，这些路径必须由构建产物
// 提供 meta refresh 页面。清单写死在这里，才能在构建配置被改动时报警。
// /blog/ 不在此列：它由 public/blog/index.html 的静态 stub 兜底，不是 astro.config
// 生成的重定向。若把它写回 astro.config 的 redirects，构建会把重定向写进
// blog.html 并覆盖真实列表页，形成 /blog 自引用死循环。
const legacyPaths = [
  ['/architecture', '/about'],
  ['/performance', '/about'],
  ['/feed', '/rss.xml'],
];

for (const [from, to] of legacyPaths) {
  const target = await resolveTarget(from);
  if (!target) {
    missing.push({ page: '(legacy)', ref: `${from} -> ${to}` });
    continue;
  }
  const html = await readFile(target, 'utf8');
  const refresh = html.match(/http-equiv="refresh" content="0;url=([^"]+)"/)?.[1];
  if (refresh !== to) missing.push({ page: '(legacy)', ref: `${from} -> ${to} (refresh: ${refresh ?? 'none'})` });
}

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = `/${path.relative(dist, file).replace(/\\/g, '/')}`;
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => decodeEntities(match[1]));

  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
    checked += 1;

    const [rawPath, hash] = ref.split('#');
    const [pathname] = rawPath.split('?');
    if (!pathname) continue;

    const target = pathname.startsWith('/')
      ? await resolveTarget(pathname)
      : await resolveTarget(path.posix.join(path.posix.dirname(page), pathname));

    if (!target) {
      missing.push({ page, ref });
      continue;
    }

    if (hash && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasAnchor = new RegExp(`id=["']${escaped}["']`).test(targetHtml);
      if (!hasAnchor) brokenAnchors.push({ page, ref, target: path.relative(dist, target) });
    }
  }
}

console.log(
  `[links] checked ${checked} internal references across ${htmlFiles.length} pages, ` +
    `${legacyPaths.length} legacy redirects`,
);

if (missing.length || brokenAnchors.length) {
  for (const item of missing) console.error(`  MISSING  ${item.page} -> ${item.ref}`);
  for (const item of brokenAnchors) console.error(`  ANCHOR   ${item.page} -> ${item.ref}`);
  console.error(`[links] ${missing.length} missing targets, ${brokenAnchors.length} broken anchors`);
  process.exit(1);
}

console.log('[links] all internal links and anchors resolve');

/**
 * 为每篇已发布文章生成一张 1200x630 的品牌化 Open Graph 卡片，
 * 并为非文章页面生成一张默认卡片。
 *
 * 作为 `prebuild` 运行，因此 `npm run build` 始终能在 public/og/ 中得到最新图片。
 */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const contentDir = path.join(root, 'src', 'content', 'blog');
const outDir = path.join(root, 'public', 'og');
const defaultOut = path.join(root, 'public', 'og-default.png');

const paper = '#F6F2E9';
const ink = '#16130E';
const soft = '#4A443A';
const rule = '#D9D1C2';
const accent = '#B23A1B';

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!key) continue;
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }
  return data;
}

function wrapTitle(title, maxChars) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function truncateMeta(value, maxChars = 80) {
  const text = String(value).trim();
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.trimEnd()}…`;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(date)
    .toUpperCase();
}

function buildSvg({ title, label, meta }) {
  const fontSize = title.length > 92 ? 50 : title.length > 62 ? 56 : 64;
  const maxChars = Math.floor(1010 / (fontSize * 0.47));
  const lines = wrapTitle(title, maxChars);
  const lineHeight = Math.round(fontSize * 1.16);
  const blockHeight = lines.length * lineHeight;
  const startY = 330 - Math.round(blockHeight / 2) + fontSize;

  const titleTspans = lines
    .map(
      (line, index) =>
        `<tspan x="72" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${paper}"/>
  <rect width="1200" height="8" fill="${ink}"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="72" y="96" font-size="36" fill="${ink}">Jin Lo<tspan fill="${accent}">.</tspan></text>
    <text x="72" y="160" font-family="'Courier New', monospace" font-size="17" letter-spacing="3" fill="${accent}">${escapeXml(label)}</text>
    <text x="72" y="${startY}" font-size="${fontSize}" fill="${ink}">${titleTspans}</text>
    <line x1="72" y1="500" x2="1128" y2="500" stroke="${rule}" stroke-width="1"/>
    <text x="72" y="542" font-family="'Courier New', monospace" font-size="16" letter-spacing="2" fill="${soft}">${escapeXml(meta)}</text>
    <text x="1128" y="542" text-anchor="end" font-family="'Courier New', monospace" font-size="16" letter-spacing="2" fill="${soft}">JINLO.DEV</text>
  </g>
  <circle cx="1128" cy="90" r="6" fill="${accent}"/>
</svg>`;
}

async function render(svg, file) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  let files = [];
  try {
    files = (await readdir(contentDir)).filter((file) => file.endsWith('.md'));
  } catch {
    files = [];
  }

  let count = 0;
  for (const file of files) {
    const raw = await readFile(path.join(contentDir, file), 'utf8');
    const data = parseFrontmatter(raw);
    if (data.draft === true) continue;

    const slug = file.replace(/\.md$/, '');
    const label = data.featured === true ? 'Featured essay' : (data.tags?.[0] ?? 'Essay');
    const svg = buildSvg({
      title: data.title ?? slug,
      label: `${label} · ${formatDate(data.pubDate)}`,
      meta: truncateMeta(data.description ?? ''),
    });
    await render(svg, path.join(outDir, `${slug}.png`));
    count += 1;
  }

  const fallback = buildSvg({
    title: 'Field notes on software that survives contact with reality.',
    label: 'Engineering notes · est. 2026',
    meta: 'Architecture · Performance · Craft',
  });
  await render(fallback, defaultOut);

  // 即使全新克隆时 public/og 为空，也要让构建产物中保留一个 OG 文件。
  await writeFile(path.join(outDir, '.gitkeep'), '', 'utf8');

  console.log(`[og] generated ${count} post cards + default (${outDir})`);
}

main().catch((error) => {
  console.error('[og] generation failed:', error);
  process.exit(1);
});

import type { APIContext } from 'astro';
import { site } from '../lib/site';

export function GET(context: APIContext) {
  const origin = context.site ?? new URL(site.url);
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', origin).toString()}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const site = import.meta.env.PUBLIC_SITE_URL || 'https://studio-pilates.vercel.app';
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${site}/sitemap-index.xml\n`,
    { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};

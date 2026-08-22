import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const origin = site?.href.replace(/\/$/, '') ?? 'https://thomas-montage.be';
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

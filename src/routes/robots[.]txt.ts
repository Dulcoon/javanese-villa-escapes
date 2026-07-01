import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const text = `User-agent: *
Allow: /

Sitemap: https://marmevillajogja.com/sitemap.xml`;

        return new Response(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400'
          }
        });
      }
    }
  }
});

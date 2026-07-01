import { createFileRoute } from '@tanstack/react-router';
import { api, IMAGE_BASE_URL } from '@/lib/api';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        let villas: any[] = [];
        try {
          const response = await api.getVillas();
          villas = response.data || [];
        } catch (e) {
          console.error("Failed to fetch villas for sitemap", e);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>https://marmevillajogja.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Availability Search -->
  <url>
    <loc>https://marmevillajogja.com/availability</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Villa Rooms Detail Pages -->
  ${villas.map(villa => {
    const mainImg = villa.images && villa.images[0] ? `${IMAGE_BASE_URL}${villa.images[0].image_url}` : null;
    return `
  <url>
    <loc>https://marmevillajogja.com/rooms/${villa.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${mainImg ? `
    <image:image>
      <image:loc>${mainImg}</image:loc>
      <image:title>${villa.name}</image:title>
    </image:image>` : ''}${(villa.images || []).slice(1, 5).map((img: any) => `
    <image:image>
      <image:loc>${IMAGE_BASE_URL}${img.image_url}</image:loc>
      <image:title>${villa.name} - ${img.album || 'Gallery'}</image:title>
    </image:image>`).join('')}
  </url>`;
  }).join('')}
</urlset>`;

        return new Response(xml.trim(), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
          }
        });
      }
    }
  }
});

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile', '/saved'],
      },
    ],
    sitemap: 'https://sellchecker.app/sitemap.xml',
  };
}

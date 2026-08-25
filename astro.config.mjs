import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://meubelmonteur.be',
  integrations: [sitemap()],
  i18n: {
    locales: ['nl', 'fr'],
    defaultLocale: 'nl',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

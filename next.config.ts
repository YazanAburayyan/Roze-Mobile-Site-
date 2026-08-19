import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Real product photography will be dropped into /public/products.
    // Remote patterns stay empty until the client supplies a CDN.
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'i18n'],
  },
};

export default withNextIntl(nextConfig);

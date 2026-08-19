import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Product photography lives in the public Supabase Storage bucket
    // `products`. next/image refuses to optimise a remote host that is not
    // listed here, so an unlisted host shows as a broken image rather than a
    // warning — hence reading it from the same env var lib/product-image.ts
    // uses, so the two can never disagree.
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_HOST
      ? [
          {
            protocol: 'https' as const,
            hostname: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_HOST,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'i18n'],
  },
};

export default withNextIntl(nextConfig);

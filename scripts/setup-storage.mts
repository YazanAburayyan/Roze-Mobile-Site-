import './load-env';
import { PrismaClient } from '@prisma/client';

/**
 * Creates the public `products` storage bucket.
 *
 * Done in SQL over the existing direct Postgres connection rather than through
 * the Storage API, because the Storage API would require a service_role key —
 * and this project deliberately holds no Supabase keys at all.
 *
 * Public-read is the right call for a retail catalogue: product photos are
 * public by definition. Signed URLs would add expiry handling and defeat CDN
 * caching for no benefit.
 *
 * Idempotent.
 */
const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

await prisma.$executeRawUnsafe(`
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('products', 'products', true, 2097152,
          array['image/webp','image/jpeg','image/png','image/avif'])
  on conflict (id) do update
    set public = true,
        file_size_limit = 2097152,
        allowed_mime_types = array['image/webp','image/jpeg','image/png','image/avif']
`);

const rows = await prisma.$queryRawUnsafe<
  { id: string; public: boolean; file_size_limit: bigint | null; allowed_mime_types: string[] | null }[]
>(`select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'products'`);

for (const r of rows) {
  console.log('bucket      :', r.id);
  console.log('public read :', r.public);
  console.log('size limit  :', r.file_size_limit ? Number(r.file_size_limit) / 1048576 + ' MB' : '(none)');
  console.log('mime types  :', (r.allowed_mime_types ?? []).join(', '));
}

const ref = new URL(process.env.DIRECT_URL!).username.split('.')[1];
console.log('storage host:', `${ref}.supabase.co`);
await prisma.$disconnect();

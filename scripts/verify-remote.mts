import '../scripts/load-env';
import { PrismaClient } from '@prisma/client';

// Runs through the POOLER (DATABASE_URL), exactly like the running app does.
const prisma = new PrismaClient();

const [cats, brands, products, images, attrs, services, oos, disc] = await Promise.all([
  prisma.category.count(),
  prisma.brand.count(),
  prisma.product.count(),
  prisma.productImage.count(),
  prisma.attribute.count(),
  prisma.serviceType.count(),
  prisma.product.count({ where: { inStock: false } }),
  prisma.product.count({ where: { compareAtPrice: { not: null } } }),
]);

console.log('categories :', cats);
console.log('brands     :', brands);
console.log('products   :', products);
console.log('images     :', images);
console.log('attributes :', attrs);
console.log('services   :', services);
console.log('out of stock:', oos);
console.log('discounted  :', disc);

// Exercise the real query paths the app uses, over the pooler.
const deep = await prisma.category.findFirst({ where: { slug: 'chargers-cables' } });
console.log('3-level category present:', Boolean(deep));

const withRels = await prisma.product.findFirst({
  where: { slug: 'iphone-15-pro' },
  include: { images: true, brand: true, category: true, attributes: true },
});
console.log('product joins ok        :', Boolean(withRels?.brand && withRels.images.length && withRels.attributes.length));
console.log('price is integer fils   :', Number.isInteger(withRels?.price), withRels?.price);

await prisma.$disconnect();

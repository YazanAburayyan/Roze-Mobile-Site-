import '../scripts/load-env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Money utility: JOD to fils (1 JOD = 1000 fils)
 */
function jod(amount: number): number {
  return Math.round(amount * 1000);
}

async function main() {
  console.log('🌿 Seeding ROZE demo catalogue...');

  // ===================================================================
  // CATEGORIES
  // ===================================================================
  console.log('📁 Seeding categories...');

  const phonesCategory = await prisma.category.upsert({
    where: { slug: 'phones' },
    update: {},
    create: {
      slug: 'phones',
      nameAr: 'الهواتف',
      nameEn: 'Mobile Phones',
      descriptionAr: 'أحدث أجهزة الهواتف الذكية من أفضل الماركات',
      descriptionEn: 'Latest smartphones from premium brands',
      icon: 'smartphone',
      sortOrder: 1,
    },
  });

  const phoneAccessoriesCategory = await prisma.category.upsert({
    where: { slug: 'phone-accessories' },
    update: {},
    create: {
      slug: 'phone-accessories',
      nameAr: 'اكسسوارات الهواتف',
      nameEn: 'Phone Accessories',
      descriptionAr: 'حافظات وشواحن وأغطية شاشة للهواتف الذكية',
      descriptionEn: 'Cases, chargers, screen protectors',
      icon: 'shield',
      parentId: phonesCategory.id,
      sortOrder: 1,
    },
  });

  // Third-level child for demonstrating arbitrary depth
  const chargersCablesCategory = await prisma.category.upsert({
    where: { slug: 'chargers-cables' },
    update: {},
    create: {
      slug: 'chargers-cables',
      nameAr: 'الشواحن والكابلات',
      nameEn: 'Chargers & Cables',
      descriptionAr: 'شواحن سريعة وكابلات عالية الجودة',
      descriptionEn: 'Fast chargers and quality cables',
      icon: 'zap',
      parentId: phoneAccessoriesCategory.id,
      sortOrder: 1,
    },
  });

  const laptopsCategory = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      slug: 'laptops',
      nameAr: 'اللابتوبات والكمبيوترات',
      nameEn: 'Laptops & Computers',
      descriptionAr: 'أجهزة لابتوب وحواسيب محمولة بأحدث المعالجات',
      descriptionEn: 'Laptops and computers with latest processors',
      icon: 'laptop',
      sortOrder: 2,
    },
  });

  const laptopAccessoriesCategory = await prisma.category.upsert({
    where: { slug: 'laptop-accessories' },
    update: {},
    create: {
      slug: 'laptop-accessories',
      nameAr: 'اكسسوارات اللابتوبات',
      nameEn: 'Laptop Accessories',
      descriptionAr: 'أكياس وفئران وشاشات وملحقات للابتوبات',
      descriptionEn: 'Bags, mice, monitors, and laptop accessories',
      icon: 'mouse',
      parentId: laptopsCategory.id,
      sortOrder: 1,
    },
  });

  const entertainmentCategory = await prisma.category.upsert({
    where: { slug: 'entertainment' },
    update: {},
    create: {
      slug: 'entertainment',
      nameAr: 'أجهزة الترفيه',
      nameEn: 'Entertainment & Gaming',
      descriptionAr: 'أجهزة ألعاب وأجهزة ترفيهية',
      descriptionEn: 'Gaming devices and entertainment systems',
      icon: 'gamepad-2',
      sortOrder: 3,
    },
  });

  const gamingAccessoriesCategory = await prisma.category.upsert({
    where: { slug: 'gaming-accessories' },
    update: {},
    create: {
      slug: 'gaming-accessories',
      nameAr: 'اكسسوارات الألعاب',
      nameEn: 'Gaming Accessories',
      descriptionAr: 'أجهزة تحكم ووسادات ألعاب وملحقات',
      descriptionEn: 'Controllers, gaming pads, and accessories',
      icon: 'headphones',
      parentId: entertainmentCategory.id,
      sortOrder: 1,
    },
  });

  const maintenanceCategory = await prisma.category.upsert({
    where: { slug: 'maintenance' },
    update: {},
    create: {
      slug: 'maintenance',
      nameAr: 'الصيانة',
      nameEn: 'Maintenance & Repair',
      descriptionAr: 'خدمات صيانة وإصلاح الهواتف والأجهزة',
      descriptionEn: 'Phone and device repair & maintenance services',
      icon: 'wrench',
      sortOrder: 4,
    },
  });

  // ===================================================================
  // BRANDS
  // ===================================================================
  console.log('🏢 Seeding brands...');

  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: {
        slug: 'apple',
        name: 'Apple',
        descriptionAr: 'أجهزة آبل الموثوقة والمتقدمة',
        descriptionEn: 'Reliable and advanced Apple devices',
        sortOrder: 1,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: {
        slug: 'samsung',
        name: 'Samsung',
        descriptionAr: 'تكنولوجيا سامسونج المبتكرة',
        descriptionEn: 'Innovative Samsung technology',
        sortOrder: 2,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'xiaomi' },
      update: {},
      create: {
        slug: 'xiaomi',
        name: 'Xiaomi',
        descriptionAr: 'أجهزة شاومي بأسعار منافسة',
        descriptionEn: 'Xiaomi devices at competitive prices',
        sortOrder: 3,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'huawei' },
      update: {},
      create: {
        slug: 'huawei',
        name: 'Huawei',
        descriptionAr: 'هواتف وأجهزة هواوي المتطورة',
        descriptionEn: 'Advanced Huawei phones and devices',
        sortOrder: 4,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'honor' },
      update: {},
      create: {
        slug: 'honor',
        name: 'Honor',
        descriptionAr: 'أجهزة أونور بتصميم عصري',
        descriptionEn: 'Honor devices with modern design',
        sortOrder: 5,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'realme' },
      update: {},
      create: {
        slug: 'realme',
        name: 'Realme',
        descriptionAr: 'هواتف ريلمي الاقتصادية',
        descriptionEn: 'Budget-friendly Realme phones',
        sortOrder: 6,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'oppo' },
      update: {},
      create: {
        slug: 'oppo',
        name: 'Oppo',
        descriptionAr: 'أوبو للتصوير الفوتوغرافي المتقدم',
        descriptionEn: 'Oppo for advanced photography',
        sortOrder: 7,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'nokia' },
      update: {},
      create: {
        slug: 'nokia',
        name: 'Nokia',
        descriptionAr: 'هواتف نوكيا الموثوقة والقوية',
        descriptionEn: 'Reliable and durable Nokia phones',
        sortOrder: 8,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'lenovo' },
      update: {},
      create: {
        slug: 'lenovo',
        name: 'Lenovo',
        descriptionAr: 'أجهزة لينوفو الاحترافية',
        descriptionEn: 'Professional Lenovo devices',
        sortOrder: 9,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'hp' },
      update: {},
      create: {
        slug: 'hp',
        name: 'HP',
        descriptionAr: 'أجهزة إتش بي القوية',
        descriptionEn: 'Powerful HP machines',
        sortOrder: 10,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'dell' },
      update: {},
      create: {
        slug: 'dell',
        name: 'Dell',
        descriptionAr: 'أجهزة ديل الموثوقة',
        descriptionEn: 'Reliable Dell computers',
        sortOrder: 11,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'asus' },
      update: {},
      create: {
        slug: 'asus',
        name: 'Asus',
        descriptionAr: 'أجهزة آسوس الاحترافية والألعاب',
        descriptionEn: 'Professional and gaming Asus devices',
        sortOrder: 12,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'anker' },
      update: {},
      create: {
        slug: 'anker',
        name: 'Anker',
        descriptionAr: 'ملحقات أنكر عالية الجودة',
        descriptionEn: 'High-quality Anker accessories',
        sortOrder: 13,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'jbl' },
      update: {},
      create: {
        slug: 'jbl',
        name: 'JBL',
        descriptionAr: 'أجهزة صوت جي بي إل احترافية',
        descriptionEn: 'Professional JBL audio devices',
        sortOrder: 14,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'sony' },
      update: {},
      create: {
        slug: 'sony',
        name: 'Sony',
        descriptionAr: 'أجهزة سوني الترفيهية المتطورة',
        descriptionEn: 'Advanced Sony entertainment devices',
        sortOrder: 15,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'acer' },
      update: {},
      create: {
        slug: 'acer',
        name: 'Acer',
        descriptionAr: 'أجهزة Acer الموثوقة والاقتصادية',
        descriptionEn: 'Reliable and affordable Acer devices',
        sortOrder: 16,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'msi' },
      update: {},
      create: {
        slug: 'msi',
        name: 'MSI',
        descriptionAr: 'أجهزة MSI للألعاب والأداء العالي',
        descriptionEn: 'MSI gaming and high-performance devices',
        sortOrder: 17,
      },
    }),
  ]);

  const brandMap = Object.fromEntries(brands.map((b) => [b.name, b]));

  // ===================================================================
  // PRODUCTS
  // ===================================================================
  console.log('📱 Seeding products...');

  // Helper to create a product with images and attributes
  async function createProduct(data: {
    slug: string;
    sku: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    categoryId: string;
    brandId?: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    imageAltAr: string;
    imageAltEn: string;
    attributes: Array<{
      nameAr: string;
      nameEn: string;
      valueAr: string;
      valueEn: string;
      group?: string;
    }>;
  }) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        slug: data.slug,
        sku: data.sku,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stockQuantity: data.stock,
        inStock: data.stock > 0,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
      },
    });

    // Find or create primary image (idempotent via manual check)
    const existingImage = await prisma.productImage.findFirst({
      where: {
        productId: product.id,
        url: '/products/placeholder.svg',
      },
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: '/products/placeholder.svg',
          altAr: data.imageAltAr,
          altEn: data.imageAltEn,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    // Find or create attributes (idempotent via manual check)
    for (const attr of data.attributes) {
      const existingAttr = await prisma.attribute.findFirst({
        where: {
          productId: product.id,
          nameAr: attr.nameAr,
          nameEn: attr.nameEn,
        },
      });

      if (existingAttr) {
        await prisma.attribute.update({
          where: { id: existingAttr.id },
          data: {
            valueAr: attr.valueAr,
            valueEn: attr.valueEn,
          },
        });
      } else {
        await prisma.attribute.create({
          data: {
            productId: product.id,
            nameAr: attr.nameAr,
            nameEn: attr.nameEn,
            valueAr: attr.valueAr,
            valueEn: attr.valueEn,
            group: attr.group,
          },
        });
      }
    }

    return product;
  }

  // PHONES (12 products, 3 out of stock)
  await createProduct({
    slug: 'iphone-15-pro',
    sku: 'APPLE-IP15P-256GB',
    titleAr: 'آيفون 15 برو',
    titleEn: 'iPhone 15 Pro',
    descriptionAr:
      'هاتف آيفون 15 برو مع معالج A17 Pro وكاميرا تايتانيوم 48 ميجابكسل. يدعم 5G وشاشة ProMotion 120Hz. بطارية قوية تدوم طول اليوم.',
    descriptionEn:
      'iPhone 15 Pro with A17 Pro chip and titanium 48MP camera. 5G support with 120Hz ProMotion display. All-day battery life.',
    price: jod(799),
    compareAtPrice: jod(899),
    stock: 5,
    categoryId: phonesCategory.id,
    brandId: brandMap['Apple'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'آيفون 15 برو لون فضي',
    imageAltEn: 'iPhone 15 Pro in titanium silver',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.1 إنش OLED',
        valueEn: '6.1-inch OLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Apple A17 Pro',
        valueEn: 'Apple A17 Pro',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '48 ميجابكسل',
        valueEn: '48 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '3274 مللي أمبير',
        valueEn: '3274 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'samsung-galaxy-s24',
    sku: 'SAMSUNG-S24-256GB',
    titleAr: 'سامسونج جالاكسي S24',
    titleEn: 'Samsung Galaxy S24',
    descriptionAr:
      'جالاكسي S24 مع معالج Snapdragon 8 Gen 3 وشاشة Dynamic AMOLED 6.2 إنش. كاميرا ذكية 50 ميجابكسل مع AI تحسين الصور. بطارية 4000 مللي أمبير.',
    descriptionEn:
      'Galaxy S24 with Snapdragon 8 Gen 3 and 6.2-inch Dynamic AMOLED display. Smart 50MP camera with AI image enhancement. 4000 mAh battery.',
    price: jod(699),
    compareAtPrice: jod(799),
    stock: 8,
    categoryId: phonesCategory.id,
    brandId: brandMap['Samsung'].id,
    isFeatured: true,
    imageAltAr: 'سامسونج جالاكسي S24',
    imageAltEn: 'Samsung Galaxy S24',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.2 إنش Dynamic AMOLED',
        valueEn: '6.2-inch Dynamic AMOLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon 8 Gen 3',
        valueEn: 'Snapdragon 8 Gen 3',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '4000 مللي أمبير',
        valueEn: '4000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'xiaomi-redmi-note-13',
    sku: 'XIAOMI-RN13-128GB',
    titleAr: 'شاومي ريدمي نوت 13',
    titleEn: 'Xiaomi Redmi Note 13',
    descriptionAr:
      'ريدمي نوت 13 مع شاشة AMOLED 120Hz وكاميرة 50 ميجابكسل. معالج MediaTek Helio G99 وبطارية 5000 مللي أمبير. أداء ممتاز بسعر رخيص.',
    descriptionEn:
      'Redmi Note 13 with 120Hz AMOLED display and 50MP camera. MediaTek Helio G99 processor and 5000 mAh battery. Excellent performance at budget price.',
    price: jod(229),
    stock: 12,
    categoryId: phonesCategory.id,
    brandId: brandMap['Xiaomi'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'شاومي ريدمي نوت 13',
    imageAltEn: 'Xiaomi Redmi Note 13',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.67 إنش AMOLED 120Hz',
        valueEn: '6.67-inch AMOLED 120Hz',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'MediaTek Helio G99',
        valueEn: 'MediaTek Helio G99',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '6 جيجابايت',
        valueEn: '6 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'samsung-galaxy-a55',
    sku: 'SAMSUNG-A55-128GB',
    titleAr: 'سامسونج جالاكسي A55',
    titleEn: 'Samsung Galaxy A55',
    descriptionAr:
      'جالاكسي A55 مع شاشة Super AMOLED وكاميرا رئيسية 50 ميجابكسل. معالج Exynos 1380 وبطارية 5000 مللي أمبير مع الشحن السريع. موثوق وطويل الأمد.',
    descriptionEn:
      'Galaxy A55 with Super AMOLED display and 50MP main camera. Exynos 1380 processor and 5000 mAh battery with fast charging. Reliable and long-lasting.',
    price: jod(289),
    compareAtPrice: jod(349),
    stock: 7,
    categoryId: phonesCategory.id,
    brandId: brandMap['Samsung'].id,
    imageAltAr: 'سامسونج جالاكسي A55',
    imageAltEn: 'Samsung Galaxy A55',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.6 إنش Super AMOLED 120Hz',
        valueEn: '6.6-inch Super AMOLED 120Hz',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Exynos 1380',
        valueEn: 'Exynos 1380',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'honor-100',
    sku: 'HONOR-H100-256GB',
    titleAr: 'أونور 100',
    titleEn: 'Honor 100',
    descriptionAr:
      'أونور 100 مع كاميرا Harcourt بتصميم فريد وشاشة OLED. معالج Snapdragon 8 Gen 2 وبطارية 5110 مللي أمبير مع شحن سريع 100W. أداء ممتازة والتصوير احترافي.',
    descriptionEn:
      'Honor 100 with distinctive Harcourt camera design and OLED display. Snapdragon 8 Gen 2 and 5110 mAh battery with 100W fast charging. Excellent performance and professional photography.',
    price: jod(449),
    compareAtPrice: jod(529),
    stock: 4,
    categoryId: phonesCategory.id,
    brandId: brandMap['Honor'].id,
    isNewArrival: true,
    imageAltAr: 'أونور 100 من الأمام',
    imageAltEn: 'Honor 100 front view',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.7 إنش OLED',
        valueEn: '6.7-inch OLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon 8 Gen 2',
        valueEn: 'Snapdragon 8 Gen 2',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '12 جيجابايت',
        valueEn: '12 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل فائقة',
        valueEn: '50 MP ultra',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5110 مللي أمبير',
        valueEn: '5110 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'realme-12-pro',
    sku: 'REALME-R12P-256GB',
    titleAr: 'ريلمي 12 برو',
    titleEn: 'Realme 12 Pro',
    descriptionAr:
      'ريلمي 12 برو بكاميرا 50 ميجابكسل وشاشة AMOLED 120Hz. معالج Snapdragon 7s Gen 2 وبطارية 5000 مللي أمبير. أداء قوية بسعر اقتصادي.',
    descriptionEn:
      'Realme 12 Pro with 50MP camera and 120Hz AMOLED display. Snapdragon 7s Gen 2 and 5000 mAh battery. Strong performance at economical price.',
    price: jod(349),
    stock: 6,
    categoryId: phonesCategory.id,
    brandId: brandMap['Realme'].id,
    imageAltAr: 'ريلمي 12 برو',
    imageAltEn: 'Realme 12 Pro',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.7 إنش AMOLED 120Hz',
        valueEn: '6.7-inch AMOLED 120Hz',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon 7s Gen 2',
        valueEn: 'Snapdragon 7s Gen 2',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'oppo-a78',
    sku: 'OPPO-A78-256GB',
    titleAr: 'أوبو A78',
    titleEn: 'Oppo A78',
    descriptionAr:
      'أوبو A78 بكاميرا 50 ميجابكسل وشاشة IPS LCD. معالج MediaTek Helio G99 وبطارية 5000 مللي أمبير مع شحن سريع. بطل التصوير الليلي.',
    descriptionEn:
      'Oppo A78 with 50MP camera and IPS LCD display. MediaTek Helio G99 and 5000 mAh battery with fast charging. Night photography champion.',
    price: jod(259),
    compareAtPrice: jod(299),
    stock: 0,
    categoryId: phonesCategory.id,
    brandId: brandMap['Oppo'].id,
    imageAltAr: 'أوبو A78 باللون الأزرق',
    imageAltEn: 'Oppo A78 in blue',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.56 إنش IPS LCD',
        valueEn: '6.56-inch IPS LCD',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'MediaTek Helio G99',
        valueEn: 'MediaTek Helio G99',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '6 جيجابايت',
        valueEn: '6 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'nokia-g60-5g',
    sku: 'NOKIA-G60-128GB',
    titleAr: 'نوكيا G60 5G',
    titleEn: 'Nokia G60 5G',
    descriptionAr:
      'نوكيا G60 5G بتصميم متين وشاشة 6.58 إنش. معالج Snapdragon 695 وبطارية 5000 مللي أمبير. يدعم 5G والتحديثات السنوية.',
    descriptionEn:
      'Nokia G60 5G with durable design and 6.58-inch display. Snapdragon 695 and 5000 mAh battery. 5G support and annual updates.',
    price: jod(289),
    stock: 3,
    categoryId: phonesCategory.id,
    brandId: brandMap['Nokia'].id,
    imageAltAr: 'نوكيا G60 5G',
    imageAltEn: 'Nokia G60 5G',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.58 إنش IPS LCD',
        valueEn: '6.58-inch IPS LCD',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon 695',
        valueEn: 'Snapdragon 695',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '6 جيجابايت',
        valueEn: '6 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الشبكة',
        nameEn: 'Network',
        valueAr: '5G',
        valueEn: '5G',
        group: 'الأداء',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'huawei-p60-pro',
    sku: 'HUAWEI-P60P-512GB',
    titleAr: 'هواوي P60 برو',
    titleEn: 'Huawei P60 Pro',
    descriptionAr:
      'هواوي P60 برو مع كاميرا تصوير احترافية وشاشة OLED 6.34 إنش. معالج Kirin 9000S وبطارية 4815 مللي أمبير. تصوير فوتوغرافي عالمي الجودة.',
    descriptionEn:
      'Huawei P60 Pro with professional photography camera and 6.34-inch OLED display. Kirin 9000S and 4815 mAh battery. World-class photography.',
    price: jod(749),
    compareAtPrice: jod(849),
    stock: 2,
    categoryId: phonesCategory.id,
    brandId: brandMap['Huawei'].id,
    isFeatured: true,
    imageAltAr: 'هواوي P60 برو',
    imageAltEn: 'Huawei P60 Pro',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.34 إنش OLED',
        valueEn: '6.34-inch OLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Kirin 9000S',
        valueEn: 'Kirin 9000S',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '12 جيجابايت',
        valueEn: '12 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت',
        valueEn: '512 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '48 ميجابكسل احترافية',
        valueEn: '48 MP pro',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '4815 مللي أمبير',
        valueEn: '4815 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'iphone-15',
    sku: 'APPLE-IP15-128GB',
    titleAr: 'آيفون 15',
    titleEn: 'iPhone 15',
    descriptionAr:
      'آيفون 15 مع معالج A16 Bionic وكاميرا 48 ميجابكسل. شاشة Super Retina XDR ودعم 5G كامل. بطارية قوية وشحن USB-C.',
    descriptionEn:
      'iPhone 15 with A16 Bionic chip and 48MP camera. Super Retina XDR display with full 5G support. Powerful battery and USB-C charging.',
    price: jod(549),
    compareAtPrice: jod(649),
    stock: 0,
    categoryId: phonesCategory.id,
    brandId: brandMap['Apple'].id,
    imageAltAr: 'آيفون 15 باللون الأحمر',
    imageAltEn: 'iPhone 15 in red',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.1 إنش Super Retina XDR',
        valueEn: '6.1-inch Super Retina XDR',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Apple A16 Bionic',
        valueEn: 'Apple A16 Bionic',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '6 جيجابايت',
        valueEn: '6 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '48 ميجابكسل',
        valueEn: '48 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '3349 مللي أمبير',
        valueEn: '3349 mAh',
        group: 'الطاقة',
      },
    ],
  });

  // PHONE ACCESSORIES (10 products, 2 out of stock)
  await createProduct({
    slug: 'anker-powercore-30000',
    sku: 'ANKER-PC30K',
    titleAr: 'أنكر PowerCore 30000 mAh',
    titleEn: 'Anker PowerCore 30000 mAh',
    descriptionAr:
      'بطارية خارجية عملاقة 30000 مللي أمبير من أنكر. شحن سريع 65W لـ 3 أجهزة معاً. تدوم 15 يوماً على شحنة واحدة.',
    descriptionEn:
      'Massive 30000 mAh external battery from Anker. 65W fast charging for 3 devices simultaneously. Lasts 15 days on a single charge.',
    price: jod(45),
    compareAtPrice: jod(55),
    stock: 15,
    categoryId: chargersCablesCategory.id,
    brandId: brandMap['Anker'].id,
    isFeatured: true,
    imageAltAr: 'بطارية أنكر PowerCore 30000',
    imageAltEn: 'Anker PowerCore 30000 battery',
    attributes: [
      {
        nameAr: 'السعة',
        nameEn: 'Capacity',
        valueAr: '30000 مللي أمبير',
        valueEn: '30000 mAh',
        group: 'البطارية',
      },
      {
        nameAr: 'الشحن السريع',
        nameEn: 'Fast Charging',
        valueAr: '65W',
        valueEn: '65W',
        group: 'الشحن',
      },
      {
        nameAr: 'المنافذ',
        nameEn: 'Ports',
        valueAr: 'USB-C و USB-A',
        valueEn: 'USB-C and USB-A',
        group: 'الاتصال',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '650 غرام',
        valueEn: '650g',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'spigen-tough-armor',
    sku: 'SPIGEN-TA-IP15',
    titleAr: 'Spigen Tough Armor لـ iPhone 15',
    titleEn: 'Spigen Tough Armor for iPhone 15',
    descriptionAr:
      'حافظة Tough Armor من سبايجن لـ iPhone 15. حماية عسكرية ضد الصدمات والسقوط من ارتفاعات عالية. تصميم رفيع وخفيف.',
    descriptionEn:
      'Spigen Tough Armor case for iPhone 15. Military-grade protection against drops and impacts from high heights. Slim and lightweight design.',
    price: jod(22),
    stock: 25,
    categoryId: phoneAccessoriesCategory.id,
    brandId: brandMap['Anker'].id,
    imageAltAr: 'حافظة Spigen Tough Armor',
    imageAltEn: 'Spigen Tough Armor case',
    attributes: [
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'TPU + Polycarbonate',
        valueEn: 'TPU + Polycarbonate',
        group: 'الحماية',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '45 غرام',
        valueEn: '45g',
        group: 'المواصفات',
      },
      {
        nameAr: 'الضمان',
        nameEn: 'Warranty',
        valueAr: 'سنة واحدة',
        valueEn: '1 year',
        group: 'الضمان',
      },
    ],
  });

  await createProduct({
    slug: 'baseus-type-c-cable',
    sku: 'BASEUS-TC-2M',
    titleAr: 'كابل Baseus USB-C 2م',
    titleEn: 'Baseus USB-C Cable 2m',
    descriptionAr:
      'كابل USB-C من بيسوس بطول 2 متر. يدعم شحن سريع 100W ونقل البيانات. متين ومرن وسهل الاستخدام.',
    descriptionEn:
      'Baseus USB-C cable 2 meters long. Supports 100W fast charging and data transfer. Durable, flexible, and easy to use.',
    price: jod(12),
    stock: 0,
    categoryId: chargersCablesCategory.id,
    imageAltAr: 'كابل Baseus USB-C',
    imageAltEn: 'Baseus USB-C cable',
    attributes: [
      {
        nameAr: 'الطول',
        nameEn: 'Length',
        valueAr: '2 متر',
        valueEn: '2 meters',
        group: 'المواصفات',
      },
      {
        nameAr: 'الشحن السريع',
        nameEn: 'Fast Charging',
        valueAr: 'حتى 100W',
        valueEn: 'Up to 100W',
        group: 'الشحن',
      },
      {
        nameAr: 'نقل البيانات',
        nameEn: 'Data Transfer',
        valueAr: 'USB 3.1',
        valueEn: 'USB 3.1',
        group: 'الأداء',
      },
    ],
  });

  await createProduct({
    slug: 'jbl-tune-510bt',
    sku: 'JBL-T510BT',
    titleAr: 'JBL Tune 510BT سماعات',
    titleEn: 'JBL Tune 510BT Headphones',
    descriptionAr:
      'سماعات JBL Tune 510BT اللاسلكية. صوت عميق وتطبيق معادل للصوت. بطارية تدوم 40 ساعة. مريحة للاستخدام اليومي.',
    descriptionEn:
      'JBL Tune 510BT wireless headphones. Deep sound with EQ app. 40-hour battery life. Comfortable for daily use.',
    price: jod(68),
    compareAtPrice: jod(85),
    stock: 8,
    categoryId: phoneAccessoriesCategory.id,
    brandId: brandMap['JBL'].id,
    isFeatured: true,
    imageAltAr: 'سماعات JBL Tune 510BT',
    imageAltEn: 'JBL Tune 510BT headphones',
    attributes: [
      {
        nameAr: 'التقنية',
        nameEn: 'Technology',
        valueAr: 'Bluetooth 5.0',
        valueEn: 'Bluetooth 5.0',
        group: 'الاتصال',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '40 ساعة',
        valueEn: '40 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '190 غرام',
        valueEn: '190g',
        group: 'المواصفات',
      },
      {
        nameAr: 'الصوت',
        nameEn: 'Sound',
        valueAr: 'معادل ديناميكي',
        valueEn: 'Dynamic EQ',
        group: 'الصوت',
      },
    ],
  });

  await createProduct({
    slug: 'nillkin-screen-protector-15pro',
    sku: 'NILLKIN-SP-IP15P',
    titleAr: 'حامي شاشة Nillkin لـ iPhone 15 Pro',
    titleEn: 'Nillkin Screen Protector for iPhone 15 Pro',
    descriptionAr:
      'حامي شاشة زجاجي من Nillkin لـ iPhone 15 Pro. مقاومة للخدوش والبصمات. غير ملحوظ وسهل التركيب.',
    descriptionEn:
      'Nillkin glass screen protector for iPhone 15 Pro. Scratch and fingerprint resistant. Invisible and easy to apply.',
    price: jod(18),
    stock: 20,
    categoryId: phoneAccessoriesCategory.id,
    imageAltAr: 'حامي شاشة Nillkin',
    imageAltEn: 'Nillkin screen protector',
    attributes: [
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'زجاج مقسّى',
        valueEn: 'Tempered glass',
        group: 'الحماية',
      },
      {
        nameAr: 'الصلابة',
        nameEn: 'Hardness',
        valueAr: '9H',
        valueEn: '9H',
        group: 'الحماية',
      },
      {
        nameAr: 'الشفافية',
        nameEn: 'Transparency',
        valueAr: '99.9%',
        valueEn: '99.9%',
        group: 'الرؤية',
      },
    ],
  });

  await createProduct({
    slug: 'apple-20w-usb-c-charger',
    sku: 'APPLE-USB20W',
    titleAr: 'شاحن Apple USB-C 20W',
    titleEn: 'Apple USB-C Power Adapter 20W',
    descriptionAr:
      'شاحن USB-C أصلي من آبل 20W. متوافق مع iPhone و iPad. شحن سريع وآمن مع حماية ذكية.',
    descriptionEn:
      'Original Apple USB-C charger 20W. Compatible with iPhone and iPad. Fast and safe charging with intelligent protection.',
    price: jod(35),
    stock: 12,
    categoryId: chargersCablesCategory.id,
    brandId: brandMap['Apple'].id,
    isFeatured: true,
    imageAltAr: 'شاحن Apple USB-C 20W',
    imageAltEn: 'Apple 20W USB-C charger',
    attributes: [
      {
        nameAr: 'القدرة',
        nameEn: 'Power',
        valueAr: '20W',
        valueEn: '20W',
        group: 'الشحن',
      },
      {
        nameAr: 'المنفذ',
        nameEn: 'Port',
        valueAr: 'USB-C',
        valueEn: 'USB-C',
        group: 'الاتصال',
      },
      {
        nameAr: 'الضمان',
        nameEn: 'Warranty',
        valueAr: 'سنة واحدة',
        valueEn: '1 year',
        group: 'الضمان',
      },
    ],
  });

  await createProduct({
    slug: 'samsung-45w-super-fast-charger',
    sku: 'SAMSUNG-CHARGER45W',
    titleAr: 'شاحن سامسونج 45W Super Fast',
    titleEn: 'Samsung 45W Super Fast Charger',
    descriptionAr:
      'شاحن سامسونج الأصلي 45W. شحن سريع فائق للهواتف الذكية. آمن وموثوق من الشركة المصنعة.',
    descriptionEn:
      'Official Samsung 45W charger. Super fast charging for smartphones. Safe and reliable from the manufacturer.',
    price: jod(42),
    compareAtPrice: jod(52),
    stock: 0,
    categoryId: chargersCablesCategory.id,
    brandId: brandMap['Samsung'].id,
    imageAltAr: 'شاحن سامسونج 45W',
    imageAltEn: 'Samsung 45W charger',
    attributes: [
      {
        nameAr: 'القدرة',
        nameEn: 'Power',
        valueAr: '45W',
        valueEn: '45W',
        group: 'الشحن',
      },
      {
        nameAr: 'المنفذ',
        nameEn: 'Port',
        valueAr: 'USB-C',
        valueEn: 'USB-C',
        group: 'الاتصال',
      },
      {
        nameAr: 'التوافق',
        nameEn: 'Compatibility',
        valueAr: 'سامسونج جميع الموديلات',
        valueEn: 'All Samsung models',
        group: 'التوافق',
      },
    ],
  });

  await createProduct({
    slug: 'belkin-car-vent-mount',
    sku: 'BELKIN-CARVENT',
    titleAr: 'حامل Belkin للسيارة',
    titleEn: 'Belkin Car Vent Mount',
    descriptionAr:
      'حامل هاتف للسيارة من بيلكين يثبت على فتحة التهوية. دوار 360 درجة وآمن للهاتف.',
    descriptionEn:
      'Belkin car phone holder mounts on air vent. 360-degree rotation and secure grip on phone.',
    price: jod(15),
    stock: 18,
    categoryId: phoneAccessoriesCategory.id,
    imageAltAr: 'حامل Belkin للسيارة',
    imageAltEn: 'Belkin car vent mount',
    attributes: [
      {
        nameAr: 'الدوران',
        nameEn: 'Rotation',
        valueAr: '360 درجة',
        valueEn: '360 degrees',
        group: 'الميزات',
      },
      {
        nameAr: 'التوافق',
        nameEn: 'Compatibility',
        valueAr: 'جميع الهواتف',
        valueEn: 'All phones',
        group: 'التوافق',
      },
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'بلاستيك ABS',
        valueEn: 'ABS plastic',
        group: 'المواصفات',
      },
    ],
  });

  // LAPTOPS (8 products, 1 out of stock)
  await createProduct({
    slug: 'macbook-pro-14-m3-max',
    sku: 'APPLE-MBP14-M3MAX',
    titleAr: 'MacBook Pro 14 M3 Max',
    titleEn: 'MacBook Pro 14 M3 Max',
    descriptionAr:
      'MacBook Pro 14 إنش مع معالج M3 Max. شاشة Liquid Retina 120Hz وتصميم ألومنيوم احترافي. بطارية تدوم 18 ساعة.',
    descriptionEn:
      'MacBook Pro 14 inches with M3 Max chip. Liquid Retina 120Hz display and professional aluminum design. 18-hour battery life.',
    price: jod(3499),
    compareAtPrice: jod(3999),
    stock: 2,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Apple'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'MacBook Pro 14 M3 Max',
    imageAltEn: 'MacBook Pro 14 M3 Max',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '14 إنش Liquid Retina XDR',
        valueEn: '14-inch Liquid Retina XDR',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Apple M3 Max',
        valueEn: 'Apple M3 Max',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '18 جيجابايت',
        valueEn: '18 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: 'حتى 18 ساعة',
        valueEn: 'Up to 18 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.6 كيلوغرام',
        valueEn: '1.6 kg',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'lenovo-ideapad-5-pro',
    sku: 'LENOVO-IP5PRO-RTX4060',
    titleAr: 'Lenovo IdeaPad 5 Pro',
    titleEn: 'Lenovo IdeaPad 5 Pro',
    descriptionAr:
      'لابتوب Lenovo IdeaPad 5 Pro مع معالج Intel Core i7 وكرت جرافيك RTX 4060. شاشة 16 إنش بدقة 4K. أداء عالية للعمل والألعاب.',
    descriptionEn:
      'Lenovo IdeaPad 5 Pro with Intel Core i7 and RTX 4060 graphics. 16-inch 4K display. High performance for work and gaming.',
    price: jod(1299),
    compareAtPrice: jod(1499),
    stock: 4,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Lenovo'].id,
    isFeatured: true,
    imageAltAr: 'Lenovo IdeaPad 5 Pro',
    imageAltEn: 'Lenovo IdeaPad 5 Pro',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '16 إنش 4K IPS',
        valueEn: '16-inch 4K IPS',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Intel Core i7-13700H',
        valueEn: 'Intel Core i7-13700H',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '16 جيجابايت DDR5',
        valueEn: '16 GB DDR5',
        group: 'الأداء',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'NVIDIA RTX 4060',
        valueEn: 'NVIDIA RTX 4060',
        group: 'الرسوميات',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD NVMe',
        valueEn: '512 GB SSD NVMe',
        group: 'التخزين',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '2.2 كيلوغرام',
        valueEn: '2.2 kg',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'hp-victus-16-gaming',
    sku: 'HP-VICTUS16-RTX4080',
    titleAr: 'HP Victus 16 Gaming',
    titleEn: 'HP Victus 16 Gaming',
    descriptionAr:
      'لابتوب ألعاب HP Victus 16 بمعالج i9 وكرت RTX 4080. شاشة 16 إنش 165Hz للألعاب السلسة. نظام تبريد متقدم.',
    descriptionEn:
      'HP Victus 16 gaming laptop with i9 and RTX 4080. 16-inch 165Hz display for smooth gaming. Advanced cooling system.',
    price: jod(2099),
    compareAtPrice: jod(2399),
    stock: 1,
    categoryId: laptopsCategory.id,
    brandId: brandMap['HP'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'HP Victus 16',
    imageAltEn: 'HP Victus 16 gaming laptop',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '16 إنش 165Hz IPS',
        valueEn: '16-inch 165Hz IPS',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Intel Core i9-13900HX',
        valueEn: 'Intel Core i9-13900HX',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '32 جيجابايت DDR5',
        valueEn: '32 GB DDR5',
        group: 'الأداء',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'NVIDIA RTX 4080',
        valueEn: 'NVIDIA RTX 4080',
        group: 'الرسوميات',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '1 تيرابايت SSD NVMe',
        valueEn: '1 TB SSD NVMe',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '6 ساعات',
        valueEn: '6 hours',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'dell-xps-13-plus',
    sku: 'DELL-XPS13P-IRIS',
    titleAr: 'Dell XPS 13 Plus',
    titleEn: 'Dell XPS 13 Plus',
    descriptionAr:
      'Dell XPS 13 Plus بتصميم رفيع وخفيف وعصري. معالج Intel Core Ultra وشاشة OLED 13.4 إنش. بطارية تدوم حتى 20 ساعة.',
    descriptionEn:
      'Dell XPS 13 Plus with sleek and modern design. Intel Core Ultra processor and 13.4-inch OLED display. Battery lasts up to 20 hours.',
    price: jod(1699),
    compareAtPrice: jod(1999),
    stock: 3,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Dell'].id,
    isNewArrival: true,
    imageAltAr: 'Dell XPS 13 Plus',
    imageAltEn: 'Dell XPS 13 Plus',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '13.4 إنش OLED',
        valueEn: '13.4-inch OLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Intel Core Ultra 5',
        valueEn: 'Intel Core Ultra 5',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '16 جيجابايت LPDDR5X',
        valueEn: '16 GB LPDDR5X',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.2 كيلوغرام',
        valueEn: '1.2 kg',
        group: 'المواصفات',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: 'حتى 20 ساعة',
        valueEn: 'Up to 20 hours',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'asus-vivobook-15',
    sku: 'ASUS-VB15-R7-RTX3050',
    titleAr: 'ASUS VivoBook 15',
    titleEn: 'ASUS VivoBook 15',
    descriptionAr:
      'لابتوب ASUS VivoBook 15 بمعالج Ryzen 7 وكرت RTX 3050. شاشة 15.6 إنش بتصميم عصري. خفيف الوزن وبطارية قوية.',
    descriptionEn:
      'ASUS VivoBook 15 with Ryzen 7 and RTX 3050. 15.6-inch display with modern design. Lightweight and powerful battery.',
    price: jod(749),
    compareAtPrice: jod(899),
    stock: 0,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Asus'].id,
    imageAltAr: 'ASUS VivoBook 15',
    imageAltEn: 'ASUS VivoBook 15',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '15.6 إنش FHD IPS',
        valueEn: '15.6-inch FHD IPS',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'AMD Ryzen 7 5700U',
        valueEn: 'AMD Ryzen 7 5700U',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '16 جيجابايت DDR4',
        valueEn: '16 GB DDR4',
        group: 'الأداء',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'NVIDIA RTX 3050',
        valueEn: 'NVIDIA RTX 3050',
        group: 'الرسوميات',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.8 كيلوغرام',
        valueEn: '1.8 kg',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'macbook-air-m2',
    sku: 'APPLE-MBA-M2-256GB',
    titleAr: 'MacBook Air M2',
    titleEn: 'MacBook Air M2',
    descriptionAr:
      'MacBook Air 13 إنش مع معالج M2. شاشة Retina عالية الدقة وتصميم ألومنيوم رفيع. بطارية تدوم حتى 15 ساعة.',
    descriptionEn:
      'MacBook Air 13 inches with M2 chip. High-resolution Retina display and slim aluminum design. Battery lasts up to 15 hours.',
    price: jod(1399),
    stock: 5,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Apple'].id,
    isFeatured: true,
    imageAltAr: 'MacBook Air M2',
    imageAltEn: 'MacBook Air M2',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '13.6 إنش Retina',
        valueEn: '13.6-inch Retina',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Apple M2',
        valueEn: 'Apple M2',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت SSD',
        valueEn: '256 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: 'حتى 15 ساعة',
        valueEn: 'Up to 15 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.24 كيلوغرام',
        valueEn: '1.24 kg',
        group: 'المواصفات',
      },
    ],
  });

  // LAPTOP ACCESSORIES (6 products, 2 out of stock)
  await createProduct({
    slug: 'logitech-mx-master-3s',
    sku: 'LOGITECH-MXM3S',
    titleAr: 'Logitech MX Master 3S',
    titleEn: 'Logitech MX Master 3S',
    descriptionAr:
      'ماوس Logitech MX Master 3S للعمل الاحترافي. دقة عالية وتتبع سلس على جميع الأسطح. متوافقة مع Windows و Mac و Linux.',
    descriptionEn:
      'Logitech MX Master 3S mouse for professional work. High precision and smooth tracking on all surfaces. Compatible with Windows, Mac, and Linux.',
    price: jod(89),
    compareAtPrice: jod(119),
    stock: 7,
    categoryId: laptopAccessoriesCategory.id,
    isFeatured: true,
    imageAltAr: 'ماوس Logitech MX Master 3S',
    imageAltEn: 'Logitech MX Master 3S mouse',
    attributes: [
      {
        nameAr: 'التقنية',
        nameEn: 'Technology',
        valueAr: 'Bluetooth و USB',
        valueEn: 'Bluetooth and USB',
        group: 'الاتصال',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '70 يوماً',
        valueEn: '70 days',
        group: 'الطاقة',
      },
      {
        nameAr: 'الدقة',
        nameEn: 'DPI',
        valueAr: '4000 DPI',
        valueEn: '4000 DPI',
        group: 'الأداء',
      },
      {
        nameAr: 'الأزرار',
        nameEn: 'Buttons',
        valueAr: '8 أزرار قابلة للتخصيص',
        valueEn: '8 customizable buttons',
        group: 'الميزات',
      },
    ],
  });

  await createProduct({
    slug: 'keychron-k8-pro',
    sku: 'KEYCHRON-K8PRO',
    titleAr: 'لوحة مفاتيح Keychron K8 Pro',
    titleEn: 'Keychron K8 Pro Keyboard',
    descriptionAr:
      'لوحة مفاتيح ميكانيكية Keychron K8 Pro لاسلكية. إضاءة RGB قابلة للتخصيص وبطارية تدوم 160 ساعة.',
    descriptionEn:
      'Keychron K8 Pro wireless mechanical keyboard. Customizable RGB lighting and 160-hour battery life.',
    price: jod(125),
    stock: 5,
    categoryId: laptopAccessoriesCategory.id,
    isFeatured: true,
    imageAltAr: 'لوحة مفاتيح Keychron K8 Pro',
    imageAltEn: 'Keychron K8 Pro keyboard',
    attributes: [
      {
        nameAr: 'نوع المفاتيح',
        nameEn: 'Key Switch',
        valueAr: 'ميكانيكي Keychron',
        valueEn: 'Mechanical Keychron',
        group: 'الميزات',
      },
      {
        nameAr: 'الإضاءة',
        nameEn: 'Lighting',
        valueAr: 'RGB قابلة للتخصيص',
        valueEn: 'Customizable RGB',
        group: 'الميزات',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '160 ساعة',
        valueEn: '160 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'التقنية',
        nameEn: 'Technology',
        valueAr: 'Bluetooth 5.1 و USB',
        valueEn: 'Bluetooth 5.1 and USB',
        group: 'الاتصال',
      },
    ],
  });

  await createProduct({
    slug: 'anker-portable-monitor-15',
    sku: 'ANKER-MON15',
    titleAr: 'شاشة محمولة Anker 15.6 إنش',
    titleEn: 'Anker Portable Monitor 15.6 inch',
    descriptionAr:
      'شاشة محمولة Anker 15.6 إنش بدقة Full HD. اتصال USB-C وتصميم رفيع خفيف الوزن. مثالية للعمل أثناء التنقل.',
    descriptionEn:
      'Anker portable monitor 15.6 inch with Full HD resolution. USB-C connection and slim lightweight design. Perfect for mobile work.',
    price: jod(199),
    compareAtPrice: jod(249),
    stock: 0,
    categoryId: laptopAccessoriesCategory.id,
    brandId: brandMap['Anker'].id,
    imageAltAr: 'شاشة محمولة Anker',
    imageAltEn: 'Anker portable monitor',
    attributes: [
      {
        nameAr: 'الحجم',
        nameEn: 'Size',
        valueAr: '15.6 إنش',
        valueEn: '15.6 inch',
        group: 'الشاشة',
      },
      {
        nameAr: 'الدقة',
        nameEn: 'Resolution',
        valueAr: '1920 × 1080 Full HD',
        valueEn: '1920 × 1080 Full HD',
        group: 'الشاشة',
      },
      {
        nameAr: 'الاتصال',
        nameEn: 'Connectivity',
        valueAr: 'USB-C و HDMI',
        valueEn: 'USB-C and HDMI',
        group: 'الاتصال',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '430 غرام',
        valueEn: '430g',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'targus-laptop-bag-15',
    sku: 'TARGUS-BAG15',
    titleAr: 'حقيبة لابتوب Targus',
    titleEn: 'Targus Laptop Bag 15 inch',
    descriptionAr:
      'حقيبة لابتوب Targus متينة لأجهزة حتى 15.6 إنش. جيوب منظمة وحماية مبطنة. مريحة وعملية للاستخدام اليومي.',
    descriptionEn:
      'Durable Targus laptop bag for devices up to 15.6 inches. Organized compartments and padded protection. Comfortable and practical for daily use.',
    price: jod(45),
    stock: 12,
    categoryId: laptopAccessoriesCategory.id,
    imageAltAr: 'حقيبة لابتوب Targus',
    imageAltEn: 'Targus laptop bag',
    attributes: [
      {
        nameAr: 'السعة',
        nameEn: 'Capacity',
        valueAr: 'حتى 15.6 إنش',
        valueEn: 'Up to 15.6 inch',
        group: 'المواصفات',
      },
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'نيلون متين مع حشوة',
        valueEn: 'Durable nylon with padding',
        group: 'المواصفات',
      },
      {
        nameAr: 'الجيوب',
        nameEn: 'Pockets',
        valueAr: 'جيوب متعددة منظمة',
        valueEn: 'Multiple organized compartments',
        group: 'الميزات',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueEn: '380g',
        valueAr: '380 غرام',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'crucial-2tb-ssd',
    sku: 'CRUCIAL-SSD2TB',
    titleAr: 'وحدة Crucial 2TB SSD',
    titleEn: 'Crucial 2TB SSD',
    descriptionAr:
      'وحدة تخزين Crucial 2TB NVMe. سرعة قراءة حتى 7000 MB/s وسرعة كتابة حتى 6000 MB/s. أداء عالية وموثوقية عالية.',
    descriptionEn:
      'Crucial 2TB NVMe SSD. Read speeds up to 7000 MB/s and write speeds up to 6000 MB/s. High performance and reliability.',
    price: jod(185),
    compareAtPrice: jod(225),
    stock: 9,
    categoryId: laptopAccessoriesCategory.id,
    isFeatured: true,
    imageAltAr: 'وحدة Crucial 2TB SSD',
    imageAltEn: 'Crucial 2TB SSD',
    attributes: [
      {
        nameAr: 'السعة',
        nameEn: 'Capacity',
        valueAr: '2 تيرابايت',
        valueEn: '2 TB',
        group: 'التخزين',
      },
      {
        nameAr: 'الواجهة',
        nameEn: 'Interface',
        valueAr: 'M.2 NVMe PCIe 4.0',
        valueEn: 'M.2 NVMe PCIe 4.0',
        group: 'الأداء',
      },
      {
        nameAr: 'سرعة القراءة',
        nameEn: 'Read Speed',
        valueAr: 'حتى 7000 MB/s',
        valueEn: 'Up to 7000 MB/s',
        group: 'الأداء',
      },
      {
        nameAr: 'سرعة الكتابة',
        nameEn: 'Write Speed',
        valueAr: 'حتى 6000 MB/s',
        valueEn: 'Up to 6000 MB/s',
        group: 'الأداء',
      },
    ],
  });

  // ENTERTAINMENT & GAMING (8 products, 1 out of stock)
  await createProduct({
    slug: 'ps5-console',
    sku: 'SONY-PS5-1TB',
    titleAr: 'جهاز PlayStation 5',
    titleEn: 'PlayStation 5 Console',
    descriptionAr:
      'جهاز PlayStation 5 نسخة 2024 مع 1TB تخزين وكرت رسوميات RDNA2. دعم ألعاب 4K و 120fps. أداء عملاق للألعاب.',
    descriptionEn:
      'PlayStation 5 console 2024 edition with 1TB storage and RDNA2 GPU. 4K and 120fps gaming support. Massive gaming performance.',
    price: jod(499),
    stock: 3,
    categoryId: entertainmentCategory.id,
    brandId: brandMap['Sony'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'جهاز PlayStation 5',
    imageAltEn: 'PlayStation 5 console',
    attributes: [
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '1 تيرابايت SSD',
        valueEn: '1 TB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'RDNA2 10TFLOPS',
        valueEn: 'RDNA2 10TFLOPS',
        group: 'الأداء',
      },
      {
        nameAr: 'الألعاب',
        nameEn: 'Gaming',
        valueAr: '4K و 120Hz',
        valueEn: '4K and 120Hz',
        group: 'الأداء',
      },
      {
        nameAr: 'المتحكمات',
        nameEn: 'Controllers',
        valueAr: 'DualSense واحد',
        valueEn: '1x DualSense',
        group: 'الملحقات',
      },
    ],
  });

  await createProduct({
    slug: 'xbox-series-x',
    sku: 'MICROSOFT-XSX',
    titleAr: 'Xbox Series X',
    titleEn: 'Xbox Series X',
    descriptionAr:
      'جهاز Xbox Series X الأقوى حالياً. معالج 12TFLOPS وتخزين 1TB SSD. ألعاب 4K و 120fps والخدمات السحابية.',
    descriptionEn:
      'Most powerful Xbox Series X. 12TFLOPS processor and 1TB SSD storage. 4K and 120fps gaming with cloud services.',
    price: jod(449),
    compareAtPrice: jod(549),
    stock: 2,
    categoryId: entertainmentCategory.id,
    isFeatured: true,
    imageAltAr: 'جهاز Xbox Series X',
    imageAltEn: 'Xbox Series X console',
    attributes: [
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '1 تيرابايت SSD',
        valueEn: '1 TB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الأداء',
        nameEn: 'Performance',
        valueAr: '12 TFLOPS',
        valueEn: '12 TFLOPS',
        group: 'الأداء',
      },
      {
        nameAr: 'الدقة',
        nameEn: 'Resolution',
        valueAr: '4K و 120Hz',
        valueEn: '4K and 120Hz',
        group: 'الأداء',
      },
      {
        nameAr: 'الخدمات',
        nameEn: 'Services',
        valueAr: 'Game Pass و Xbox Live',
        valueEn: 'Game Pass and Xbox Live',
        group: 'الخدمات',
      },
    ],
  });

  await createProduct({
    slug: 'nintendo-switch-oled',
    sku: 'NINTENDO-SWITOLED',
    titleAr: 'Nintendo Switch OLED',
    titleEn: 'Nintendo Switch OLED',
    descriptionAr:
      'نينتندو سويتش OLED بشاشة 7 إنش ملونة. يدعم اللعب المحمول والموصول. ألعاب حصرية وشاشة جميلة.',
    descriptionEn:
      'Nintendo Switch OLED with vibrant 7-inch display. Supports portable and docked gameplay. Exclusive games and beautiful screen.',
    price: jod(359),
    compareAtPrice: jod(399),
    stock: 0,
    categoryId: entertainmentCategory.id,
    brandId: brandMap['Sony'].id,
    imageAltAr: 'Nintendo Switch OLED',
    imageAltEn: 'Nintendo Switch OLED console',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '7 إنش OLED',
        valueEn: '7-inch OLED',
        group: 'الشاشة',
      },
      {
        nameAr: 'الأداء',
        nameEn: 'Performance',
        valueAr: 'NVIDIA Tegra X1',
        valueEn: 'NVIDIA Tegra X1',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '64 جيجابايت',
        valueEn: '64 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '4.5 – 9 ساعات',
        valueEn: '4.5 – 9 hours',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'Sony-wh1000xm5-headphones',
    sku: 'SONY-WH1000XM5',
    titleAr: 'سماعات Sony WH-1000XM5',
    titleEn: 'Sony WH-1000XM5 Headphones',
    descriptionAr:
      'سماعات Sony WH-1000XM5 بإلغاء ضوضاء عالي الجودة. بطارية تدوم 30 ساعة وصوت قوي واضح. مريحة للاستخدام الطويل.',
    descriptionEn:
      'Sony WH-1000XM5 headphones with premium noise cancellation. 30-hour battery life and powerful clear sound. Comfortable for long use.',
    price: jod(299),
    compareAtPrice: jod(379),
    stock: 6,
    categoryId: gamingAccessoriesCategory.id,
    brandId: brandMap['Sony'].id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'سماعات Sony WH-1000XM5',
    imageAltEn: 'Sony WH-1000XM5 headphones',
    attributes: [
      {
        nameAr: 'إلغاء الضوضاء',
        nameEn: 'Noise Cancellation',
        valueAr: 'فعال جداً',
        valueEn: 'Highly effective',
        group: 'الصوت',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '30 ساعة',
        valueEn: '30 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'الاتصال',
        nameEn: 'Connectivity',
        valueAr: 'Bluetooth 5.0',
        valueEn: 'Bluetooth 5.0',
        group: 'الاتصال',
      },
      {
        nameAr: 'التحكم',
        nameEn: 'Control',
        valueAr: 'تحكم لمسي ذكي',
        valueEn: 'Smart touch control',
        group: 'الميزات',
      },
    ],
  });

  await createProduct({
    slug: 'dualsense-controller-white',
    sku: 'SONY-DUALSE-WHITE',
    titleAr: 'متحكم DualSense أبيض',
    titleEn: 'DualSense Controller White',
    descriptionAr:
      'متحكم DualSense الأصلي لـ PlayStation 5 باللون الأبيض. رد فعل حسي متقدم ومايكروفون مدمج. دقة عالية وراحة تامة.',
    descriptionEn:
      'Official DualSense controller for PlayStation 5 in white. Advanced haptic feedback and built-in microphone. High precision and comfort.',
    price: jod(72),
    stock: 11,
    categoryId: gamingAccessoriesCategory.id,
    brandId: brandMap['Sony'].id,
    isFeatured: true,
    imageAltAr: 'متحكم DualSense أبيض',
    imageAltEn: 'DualSense controller white',
    attributes: [
      {
        nameAr: 'التقنية',
        nameEn: 'Technology',
        valueAr: 'Bluetooth 5.1',
        valueEn: 'Bluetooth 5.1',
        group: 'الاتصال',
      },
      {
        nameAr: 'الرد الحسي',
        nameEn: 'Haptic Feedback',
        valueAr: 'متقدم جداً',
        valueEn: 'Very advanced',
        group: 'الميزات',
      },
      {
        nameAr: 'المايكروفون',
        nameEn: 'Microphone',
        valueAr: 'مدمج',
        valueEn: 'Built-in',
        group: 'الميزات',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '4-6 ساعات',
        valueEn: '4-6 hours',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'corsair-k95-platinum',
    sku: 'CORSAIR-K95PLAT',
    titleAr: 'لوحة مفاتيح Corsair K95 Platinum',
    titleEn: 'Corsair K95 Platinum Keyboard',
    descriptionAr:
      'لوحة مفاتيح ميكانيكية Corsair K95 Platinum للألعاب. مفاتيح Cherry MX وإضاءة RGB كاملة. أداء ممتاز للاعبين المحترفين.',
    descriptionEn:
      'Corsair K95 Platinum mechanical gaming keyboard. Cherry MX switches and full RGB lighting. Excellent performance for pros.',
    price: jod(199),
    compareAtPrice: jod(249),
    stock: 4,
    categoryId: gamingAccessoriesCategory.id,
    imageAltAr: 'لوحة مفاتيح Corsair K95 Platinum',
    imageAltEn: 'Corsair K95 Platinum keyboard',
    attributes: [
      {
        nameAr: 'نوع المفاتيح',
        nameEn: 'Switch Type',
        valueAr: 'Cherry MX',
        valueEn: 'Cherry MX',
        group: 'الميزات',
      },
      {
        nameAr: 'الإضاءة',
        nameEn: 'Lighting',
        valueAr: 'RGB كاملة قابلة للتخصيص',
        valueEn: 'Full customizable RGB',
        group: 'الميزات',
      },
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'ألومنيوم وبلاستيك قوي',
        valueEn: 'Aluminum and durable plastic',
        group: 'المواصفات',
      },
      {
        nameAr: 'الاتصال',
        nameEn: 'Connectivity',
        valueAr: 'USB',
        valueEn: 'USB',
        group: 'الاتصال',
      },
    ],
  });

  await createProduct({
    slug: 'razer-basilisk-v3',
    sku: 'RAZER-BASILISKV3',
    titleAr: 'ماوس Razer Basilisk V3',
    titleEn: 'Razer Basilisk V3 Mouse',
    descriptionAr:
      'ماوس Razer Basilisk V3 للألعاب بدقة 30000 DPI. مفاتيح Razer Focus وتصميم محسّن للراحة. خفيف الوزن وسريع الاستجابة.',
    descriptionEn:
      'Razer Basilisk V3 gaming mouse with 30000 DPI precision. Razer Focus Pro switches and ergonomic design. Lightweight and fast response.',
    price: jod(125),
    stock: 8,
    categoryId: gamingAccessoriesCategory.id,
    imageAltAr: 'ماوس Razer Basilisk V3',
    imageAltEn: 'Razer Basilisk V3 gaming mouse',
    attributes: [
      {
        nameAr: 'الدقة',
        nameEn: 'DPI',
        valueAr: 'حتى 30000 DPI',
        valueEn: 'Up to 30000 DPI',
        group: 'الأداء',
      },
      {
        nameAr: 'المفاتيح',
        nameEn: 'Switches',
        valueAr: 'Razer Focus Pro',
        valueEn: 'Razer Focus Pro',
        group: 'الميزات',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '90 غرام',
        valueEn: '90g',
        group: 'المواصفات',
      },
      {
        nameAr: 'الاتصال',
        nameEn: 'Connectivity',
        valueAr: 'USB 3.5mm أو لاسلكي',
        valueEn: 'USB 3.5mm or wireless',
        group: 'الاتصال',
      },
    ],
  });

  // ENTERTAINMENT - NEW (4 products)
  await createProduct({
    slug: 'xbox-series-s',
    sku: 'MICROSOFT-XSS',
    titleAr: 'Xbox Series S',
    titleEn: 'Xbox Series S',
    descriptionAr:
      'Xbox Series S جهاز الألعاب المدمج والقوي. معالج 10TFLOPS وتخزين 512GB SSD. ألعاب 1440p و 120fps مع Game Pass.',
    descriptionEn:
      'Xbox Series S compact and powerful gaming console. 10TFLOPS processor and 512GB SSD storage. 1440p and 120fps gaming with Game Pass.',
    price: jod(299),
    compareAtPrice: jod(349),
    stock: 5,
    categoryId: entertainmentCategory.id,
    isFeatured: true,
    isNewArrival: true,
    imageAltAr: 'جهاز Xbox Series S',
    imageAltEn: 'Xbox Series S console',
    attributes: [
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الأداء',
        nameEn: 'Performance',
        valueAr: '10 TFLOPS',
        valueEn: '10 TFLOPS',
        group: 'الأداء',
      },
      {
        nameAr: 'الدقة',
        nameEn: 'Resolution',
        valueAr: '1440p و 120Hz',
        valueEn: '1440p and 120Hz',
        group: 'الأداء',
      },
      {
        nameAr: 'الخدمات',
        nameEn: 'Services',
        valueAr: 'Game Pass',
        valueEn: 'Game Pass',
        group: 'الخدمات',
      },
    ],
  });

  await createProduct({
    slug: 'ps5-slim-digital',
    sku: 'SONY-PS5SLIM-DIG',
    titleAr: 'PlayStation 5 Slim Digital',
    titleEn: 'PlayStation 5 Slim Digital Edition',
    descriptionAr:
      'PlayStation 5 Slim النسخة الرقمية بحجم أصغر وأخف وزناً. تخزين 1TB وكرت رسوميات RDNA2. ألعاب 4K و 120fps بدون أقراص.',
    descriptionEn:
      'PlayStation 5 Slim Digital Edition compact and lightweight. 1TB storage and RDNA2 GPU. 4K and 120fps gaming without disc drive.',
    price: jod(469),
    compareAtPrice: jod(549),
    stock: 3,
    categoryId: entertainmentCategory.id,
    brandId: brandMap['Sony'].id,
    isNewArrival: true,
    imageAltAr: 'PlayStation 5 Slim Digital',
    imageAltEn: 'PlayStation 5 Slim Digital Edition',
    attributes: [
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '1 تيرابايت SSD',
        valueEn: '1 TB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'RDNA2 10TFLOPS',
        valueEn: 'RDNA2 10TFLOPS',
        group: 'الأداء',
      },
      {
        nameAr: 'الألعاب',
        nameEn: 'Gaming',
        valueAr: '4K و 120Hz',
        valueEn: '4K and 120Hz',
        group: 'الأداء',
      },
      {
        nameAr: 'الإصدار',
        nameEn: 'Edition',
        valueAr: 'رقمي بدون قارئ أقراص',
        valueEn: 'Digital no disc drive',
        group: 'الميزات',
      },
    ],
  });

  await createProduct({
    slug: 'nintendo-switch-lite',
    sku: 'NINTENDO-SWLITE',
    titleAr: 'Nintendo Switch Lite',
    titleEn: 'Nintendo Switch Lite',
    descriptionAr:
      'Nintendo Switch Lite نسخة محمولة خفيفة الوزن. شاشة 5.5 إنش وتصميم مدمج. ألعاب حصرية وبطارية طويلة الأمد.',
    descriptionEn:
      'Nintendo Switch Lite lightweight portable version. 5.5-inch screen and compact design. Exclusive games and long battery life.',
    price: jod(159),
    compareAtPrice: jod(199),
    stock: 8,
    categoryId: entertainmentCategory.id,
    isNewArrival: true,
    imageAltAr: 'Nintendo Switch Lite',
    imageAltEn: 'Nintendo Switch Lite',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '5.5 إنش',
        valueEn: '5.5 inch',
        group: 'الشاشة',
      },
      {
        nameAr: 'الأداء',
        nameEn: 'Performance',
        valueAr: 'NVIDIA Tegra X1',
        valueEn: 'NVIDIA Tegra X1',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '32 جيجابايت',
        valueEn: '32 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery Life',
        valueAr: '5.5 – 6.5 ساعات',
        valueEn: '5.5 – 6.5 hours',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'meta-quest-3',
    sku: 'META-QUEST3-128GB',
    titleAr: 'Meta Quest 3',
    titleEn: 'Meta Quest 3',
    descriptionAr:
      'Meta Quest 3 نظارة واقع افتراضي متقدمة. معالج Snapdragon XR Gen 2 وتخزين 128GB. تجربة VR immersive مع ألعاب حصرية.',
    descriptionEn:
      'Meta Quest 3 advanced VR headset. Snapdragon XR Gen 2 processor and 128GB storage. Immersive VR experience with exclusive games.',
    price: jod(449),
    stock: 0,
    categoryId: entertainmentCategory.id,
    imageAltAr: 'Meta Quest 3 VR نظارة',
    imageAltEn: 'Meta Quest 3 VR headset',
    attributes: [
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon XR Gen 2',
        valueEn: 'Snapdragon XR Gen 2',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: 'عدسات مزدوجة Pancake',
        valueEn: 'Dual Pancake lenses',
        group: 'الشاشة',
      },
      {
        nameAr: 'الميزات',
        nameEn: 'Features',
        valueAr: 'تتبع العين والوجه',
        valueEn: 'Eye and face tracking',
        group: 'الميزات',
      },
    ],
  });

  // LAPTOPS - NEW (3 products)
  await createProduct({
    slug: 'acer-aspire-5',
    sku: 'ACER-ASP5-R7',
    titleAr: 'Acer Aspire 5',
    titleEn: 'Acer Aspire 5',
    descriptionAr:
      'لابتوب Acer Aspire 5 بمعالج Ryzen 7 وكرت RTX 4050. شاشة 15.6 إنش FHD وتصميم عصري. أداء جيدة للعمل والألعاب.',
    descriptionEn:
      'Acer Aspire 5 with Ryzen 7 and RTX 4050. 15.6-inch FHD display and modern design. Good performance for work and gaming.',
    price: jod(549),
    compareAtPrice: jod(649),
    stock: 6,
    categoryId: laptopsCategory.id,
    brandId: brandMap['Acer'].id,
    imageAltAr: 'Acer Aspire 5 لابتوب',
    imageAltEn: 'Acer Aspire 5 laptop',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '15.6 إنش FHD IPS',
        valueEn: '15.6-inch FHD IPS',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'AMD Ryzen 7 5800H',
        valueEn: 'AMD Ryzen 7 5800H',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '16 جيجابايت DDR4',
        valueEn: '16 GB DDR4',
        group: 'الأداء',
      },
      {
        nameAr: 'كرت الرسوميات',
        nameEn: 'GPU',
        valueAr: 'NVIDIA RTX 4050',
        valueEn: 'NVIDIA RTX 4050',
        group: 'الرسوميات',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.9 كيلوغرام',
        valueEn: '1.9 kg',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'msi-modern-14',
    sku: 'MSI-MOD14-ULTRA',
    titleAr: 'MSI Modern 14',
    titleEn: 'MSI Modern 14',
    descriptionAr:
      'لابتوب MSI Modern 14 مع معالج Intel Core Ultra وشاشة 14 إنش 3K. تصميم رفيع احترافي وبطارية طويلة. مثالي للعمل المكتبي.',
    descriptionEn:
      'MSI Modern 14 with Intel Core Ultra and 14-inch 3K display. Professional thin design and long battery. Perfect for office work.',
    price: jod(699),
    compareAtPrice: jod(799),
    stock: 4,
    categoryId: laptopsCategory.id,
    brandId: brandMap['MSI'].id,
    isNewArrival: true,
    imageAltAr: 'MSI Modern 14 لابتوب',
    imageAltEn: 'MSI Modern 14 laptop',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '14 إنش 3K IPS',
        valueEn: '14-inch 3K IPS',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Intel Core Ultra 7',
        valueEn: 'Intel Core Ultra 7',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '16 جيجابايت LPDDR5X',
        valueEn: '16 GB LPDDR5X',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '512 جيجابايت SSD',
        valueEn: '512 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: 'حتى 14 ساعة',
        valueEn: 'Up to 14 hours',
        group: 'الطاقة',
      },
      {
        nameAr: 'الوزن',
        nameEn: 'Weight',
        valueAr: '1.4 كيلوغرام',
        valueEn: '1.4 kg',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'hp-pavilion-x360-14',
    sku: 'HP-PAVX360-14',
    titleAr: 'HP Pavilion x360 14',
    titleEn: 'HP Pavilion x360 14',
    descriptionAr:
      'لابتوب HP Pavilion x360 14 دوار لمس 2-في-1. معالج Intel Core i5 وشاشة FHD دوارة 360 درجة. مرونة للعمل والترفيه.',
    descriptionEn:
      '2-in-1 HP Pavilion x360 14 touchscreen convertible. Intel Core i5 and 360-degree rotatable FHD display. Flexibility for work and entertainment.',
    price: jod(599),
    stock: 0,
    categoryId: laptopsCategory.id,
    brandId: brandMap['HP'].id,
    imageAltAr: 'HP Pavilion x360 14',
    imageAltEn: 'HP Pavilion x360 14',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '14 إنش FHD Touchscreen دوار',
        valueEn: '14-inch FHD touchscreen convertible',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Intel Core i5-1335U',
        valueEn: 'Intel Core i5-1335U',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت DDR4',
        valueEn: '8 GB DDR4',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت SSD',
        valueEn: '256 GB SSD',
        group: 'التخزين',
      },
      {
        nameAr: 'الميزات',
        nameEn: 'Features',
        valueAr: 'دوار 360 درجة',
        valueEn: '360-degree hinge',
        group: 'الميزات',
      },
    ],
  });

  // PHONES - NEW (2 products)
  await createProduct({
    slug: 'samsung-galaxy-a35',
    sku: 'SAMSUNG-A35-128GB',
    titleAr: 'سامسونج جالاكسي A35',
    titleEn: 'Samsung Galaxy A35',
    descriptionAr:
      'جالاكسي A35 بشاشة Super AMOLED وكاميرا 50 ميجابكسل. معالج Exynos 1380 وبطارية 5000 مللي أمبير. موثوق وقوي في الفئة المتوسطة.',
    descriptionEn:
      'Galaxy A35 with Super AMOLED display and 50MP camera. Exynos 1380 and 5000 mAh battery. Reliable and powerful mid-range.',
    price: jod(269),
    compareAtPrice: jod(319),
    stock: 9,
    categoryId: phonesCategory.id,
    brandId: brandMap['Samsung'].id,
    imageAltAr: 'سامسونج جالاكسي A35',
    imageAltEn: 'Samsung Galaxy A35',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.6 إنش Super AMOLED 120Hz',
        valueEn: '6.6-inch Super AMOLED 120Hz',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Exynos 1380',
        valueEn: 'Exynos 1380',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '8 جيجابايت',
        valueEn: '8 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '128 جيجابايت',
        valueEn: '128 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل',
        valueEn: '50 MP',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  await createProduct({
    slug: 'xiaomi-poco-x6-pro',
    sku: 'XIAOMI-POCOX6P-256GB',
    titleAr: 'شاومي Poco X6 Pro',
    titleEn: 'Xiaomi Poco X6 Pro',
    descriptionAr:
      'Poco X6 Pro بمعالج Snapdragon 7s Gen 2 وشاشة AMOLED 1.5K. كاميرا 50 ميجابكسل وبطارية 5000 مللي أمبير. أداء عالية بسعر مناسب.',
    descriptionEn:
      'Poco X6 Pro with Snapdragon 7s Gen 2 and 1.5K AMOLED display. 50MP camera and 5000 mAh battery. High performance at right price.',
    price: jod(249),
    stock: 7,
    categoryId: phonesCategory.id,
    brandId: brandMap['Xiaomi'].id,
    imageAltAr: 'شاومي Poco X6 Pro',
    imageAltEn: 'Xiaomi Poco X6 Pro',
    attributes: [
      {
        nameAr: 'الشاشة',
        nameEn: 'Display',
        valueAr: '6.67 إنش AMOLED 1.5K 120Hz',
        valueEn: '6.67-inch AMOLED 1.5K 120Hz',
        group: 'الشاشة',
      },
      {
        nameAr: 'المعالج',
        nameEn: 'Processor',
        valueAr: 'Snapdragon 7s Gen 2',
        valueEn: 'Snapdragon 7s Gen 2',
        group: 'الأداء',
      },
      {
        nameAr: 'الذاكرة',
        nameEn: 'RAM',
        valueAr: '12 جيجابايت',
        valueEn: '12 GB',
        group: 'الأداء',
      },
      {
        nameAr: 'التخزين',
        nameEn: 'Storage',
        valueAr: '256 جيجابايت',
        valueEn: '256 GB',
        group: 'التخزين',
      },
      {
        nameAr: 'الكاميرا الخلفية',
        nameEn: 'Rear Camera',
        valueAr: '50 ميجابكسل OIS',
        valueEn: '50 MP OIS',
        group: 'الكاميرا',
      },
      {
        nameAr: 'البطارية',
        nameEn: 'Battery',
        valueAr: '5000 مللي أمبير',
        valueEn: '5000 mAh',
        group: 'الطاقة',
      },
    ],
  });

  // PHONE ACCESSORIES - NEW (3 products)
  await createProduct({
    slug: 'anker-65w-gan-charger',
    sku: 'ANKER-GAN65W',
    titleAr: 'شاحن Anker 65W GaN',
    titleEn: 'Anker 65W GaN Charger',
    descriptionAr:
      'شاحن Anker GaN 65W صغير وقوي. يشحن 3 أجهزة في نفس الوقت. تقنية GaN آمنة وسريعة جداً.',
    descriptionEn:
      'Compact and powerful Anker 65W GaN charger. Charges 3 devices simultaneously. Safe and ultra-fast GaN technology.',
    price: jod(28),
    stock: 20,
    categoryId: chargersCablesCategory.id,
    brandId: brandMap['Anker'].id,
    isFeatured: true,
    imageAltAr: 'شاحن Anker 65W GaN',
    imageAltEn: 'Anker 65W GaN charger',
    attributes: [
      {
        nameAr: 'القدرة',
        nameEn: 'Power',
        valueAr: '65W',
        valueEn: '65W',
        group: 'الشحن',
      },
      {
        nameAr: 'التكنولوجيا',
        nameEn: 'Technology',
        valueAr: 'GaN',
        valueEn: 'GaN',
        group: 'الميزات',
      },
      {
        nameAr: 'المنافذ',
        nameEn: 'Ports',
        valueAr: '2 USB-C + 1 USB-A',
        valueEn: '2 USB-C + 1 USB-A',
        group: 'الاتصال',
      },
      {
        nameAr: 'الحجم',
        nameEn: 'Size',
        valueAr: 'صغير وخفيف',
        valueEn: 'Compact and lightweight',
        group: 'المواصفات',
      },
    ],
  });

  await createProduct({
    slug: 'ugreen-wireless-charger-15w',
    sku: 'UGREEN-WIRELESS15',
    titleAr: 'شاحن UGREEN لاسلكي 15W',
    titleEn: 'UGREEN Wireless Charger 15W',
    descriptionAr:
      'شاحن UGREEN لاسلكي 15W سريع. متوافق مع جميع الهواتف الذكية. تصميم عصري وآمن مع حماية ذكية.',
    descriptionEn:
      'UGREEN fast 15W wireless charger. Compatible with all smartphones. Modern design and safe with smart protection.',
    price: jod(19),
    stock: 16,
    categoryId: chargersCablesCategory.id,
    imageAltAr: 'شاحن UGREEN لاسلكي',
    imageAltEn: 'UGREEN wireless charger',
    attributes: [
      {
        nameAr: 'القدرة',
        nameEn: 'Power',
        valueAr: '15W',
        valueEn: '15W',
        group: 'الشحن',
      },
      {
        nameAr: 'التقنية',
        nameEn: 'Technology',
        valueAr: 'Qi Wireless',
        valueEn: 'Qi Wireless',
        group: 'الاتصال',
      },
      {
        nameAr: 'التوافق',
        nameEn: 'Compatibility',
        valueAr: 'جميع الهواتف الذكية',
        valueEn: 'All smartphones',
        group: 'التوافق',
      },
      {
        nameAr: 'الحماية',
        nameEn: 'Protection',
        valueAr: 'حماية ذكية',
        valueEn: 'Smart protection',
        group: 'الأمان',
      },
    ],
  });

  await createProduct({
    slug: 'nillkin-tempered-glass-pack',
    sku: 'NILLKIN-GLASS-PACK',
    titleAr: 'حامي شاشة Nillkin مجموعة',
    titleEn: 'Nillkin Tempered Glass Screen Protector Pack',
    descriptionAr:
      'مجموعة حامي شاشة Nillkin الزجاجي 3 قطع. مقاومة للخدوش والبصمات والدهون. تثبيت سهل بدون فقاعات.',
    descriptionEn:
      'Pack of 3 Nillkin tempered glass screen protectors. Scratch, fingerprint, and oil resistant. Easy bubble-free installation.',
    price: jod(12),
    stock: 30,
    categoryId: phoneAccessoriesCategory.id,
    imageAltAr: 'مجموعة حامي شاشة Nillkin',
    imageAltEn: 'Nillkin tempered glass screen protector pack',
    attributes: [
      {
        nameAr: 'المادة',
        nameEn: 'Material',
        valueAr: 'زجاج مقسّى 9H',
        valueEn: 'Tempered glass 9H',
        group: 'الحماية',
      },
      {
        nameAr: 'الكمية',
        nameEn: 'Quantity',
        valueAr: '3 قطع',
        valueEn: '3 pcs',
        group: 'المواصفات',
      },
      {
        nameAr: 'الشفافية',
        nameEn: 'Transparency',
        valueAr: '99.9%',
        valueEn: '99.9%',
        group: 'الرؤية',
      },
      {
        nameAr: 'التثبيت',
        nameEn: 'Installation',
        valueAr: 'سهل بدون فقاعات',
        valueEn: 'Easy bubble-free',
        group: 'الميزات',
      },
    ],
  });

  // ===================================================================
  // SERVICE TYPES
  // ===================================================================
  console.log('🔧 Seeding service types...');

  const serviceTypes = [
    {
      slug: 'phone-screen-replacement',
      nameAr: 'صيانة شاشة الهاتف',
      nameEn: 'Phone Screen Replacement',
      descriptionAr: 'استبدال شاشة الهاتف الذكي المكسورة أو التالفة. صيانة احترافية خلال 24-48 ساعة.',
      descriptionEn: 'Replace broken or damaged smartphone screen. Professional repair within 24-48 hours.',
      deviceType: 'phone',
      priceMinFils: jod(35),
      priceMaxFils: jod(80),
      estimatedHours: 2,
      warrantyDays: 90,
    },
    {
      slug: 'phone-battery-replacement',
      nameAr: 'استبدال بطارية الهاتف',
      nameEn: 'Phone Battery Replacement',
      descriptionAr: 'تغيير بطارية الهاتف الضعيفة أو التالفة. بطاريات أصلية وموثوقة.',
      descriptionEn: 'Replace weak or damaged phone battery. Original and reliable batteries.',
      deviceType: 'phone',
      priceMinFils: jod(25),
      priceMaxFils: jod(55),
      estimatedHours: 1,
      warrantyDays: 180,
    },
    {
      slug: 'charging-port-repair',
      nameAr: 'إصلاح منفذ الشحن',
      nameEn: 'Charging Port Repair',
      descriptionAr: 'إصلاح أو استبدال منفذ الشحن للهاتف واللابتوب. فحص مجاني وصيانة سريعة.',
      descriptionEn: 'Repair or replace charging port for phones and laptops. Free inspection and quick service.',
      deviceType: 'phone',
      priceMinFils: jod(20),
      priceMaxFils: jod(50),
      estimatedHours: 1,
      warrantyDays: 60,
    },
    {
      slug: 'water-damage-treatment',
      nameAr: 'معالجة الأضرار المائية',
      nameEn: 'Water Damage Treatment',
      descriptionAr: 'معالجة احترافية للأجهزة المتضررة من الماء. تنظيف وتجفيف وإعادة إحياء.',
      descriptionEn: 'Professional water damage treatment. Cleaning, drying, and restoration.',
      deviceType: 'phone',
      priceMinFils: jod(40),
      priceMaxFils: jod(120),
      estimatedHours: 3,
      warrantyDays: 30,
    },
    {
      slug: 'software-flashing',
      nameAr: 'تثبيت نظام التشغيل (فلاش)',
      nameEn: 'Software Flashing',
      descriptionAr: 'إعادة تثبيت نظام التشغيل لحل المشاكل البرمجية. نسخة احترافية وآمنة.',
      descriptionEn: 'Reinstall operating system to fix software issues. Professional and safe version.',
      deviceType: 'phone',
      priceMinFils: jod(15),
      priceMaxFils: jod(35),
      estimatedHours: 2,
      warrantyDays: 14,
    },
    {
      slug: 'laptop-screen-replacement',
      nameAr: 'استبدال شاشة اللابتوب',
      nameEn: 'Laptop Screen Replacement',
      descriptionAr: 'تغيير شاشة اللابتوب المكسورة بأصلية أو عالية الجودة. صيانة احترافية.',
      descriptionEn: 'Replace broken laptop screen with original or high-quality. Professional service.',
      deviceType: 'laptop',
      priceMinFils: jod(60),
      priceMaxFils: jod(150),
      estimatedHours: 3,
      warrantyDays: 120,
    },
    {
      slug: 'laptop-keyboard-replacement',
      nameAr: 'استبدال لوحة مفاتيح اللابتوب',
      nameEn: 'Laptop Keyboard Replacement',
      descriptionAr: 'تغيير لوحة المفاتيح التالفة. مفاتيح أصلية وتثبيت احترافي.',
      descriptionEn: 'Replace damaged keyboard. Original keys and professional installation.',
      deviceType: 'laptop',
      priceMinFils: jod(50),
      priceMaxFils: jod(100),
      estimatedHours: 2,
      warrantyDays: 90,
    },
    {
      slug: 'thermal-paste-cleaning',
      nameAr: 'تنظيف ومعجون حراري',
      nameEn: 'Thermal Paste & Cleaning',
      descriptionAr: 'تنظيف عميق وتبديل معجون حراري لتحسين التبريد. للابتوبات والحواسيب.',
      descriptionEn: 'Deep cleaning and thermal paste replacement to improve cooling. For laptops and computers.',
      deviceType: 'laptop',
      priceMinFils: jod(20),
      priceMaxFils: jod(40),
      estimatedHours: 1,
      warrantyDays: 60,
    },
    {
      slug: 'ram-ssd-upgrade',
      nameAr: 'ترقية الذاكرة أو التخزين',
      nameEn: 'RAM/SSD Upgrade',
      descriptionAr: 'ترقية ذاكرة الرام أو SSD لتحسين الأداء. استشارة حرة وتثبيت احترافي.',
      descriptionEn: 'Upgrade RAM or SSD to improve performance. Free consultation and professional installation.',
      deviceType: 'laptop',
      priceMinFils: jod(30),
      priceMaxFils: jod(80),
      estimatedHours: 1,
      warrantyDays: 180,
    },
    {
      slug: 'data-recovery',
      nameAr: 'استرجاع البيانات',
      nameEn: 'Data Recovery',
      descriptionAr: 'استرجاع البيانات المفقودة من الأجهزة. معايير آمنة واحترافية عالية.',
      descriptionEn: 'Recover lost data from devices. Safe standards and high professionalism.',
      deviceType: 'laptop',
      priceMinFils: jod(100),
      priceMaxFils: jod(300),
      estimatedHours: 8,
      warrantyDays: null,
    },
  ];

  for (const service of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

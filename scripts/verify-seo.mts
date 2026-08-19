import { localBusinessJsonLd, organizationJsonLd, productJsonLd, breadcrumbJsonLd } from '../lib/seo';
import { address, phones, reputation, social } from '../lib/site';

const lb: any = localBusinessJsonLd('ar');
const checks: [string, boolean, string][] = [];

checks.push(['@type includes LocalBusiness', lb['@type'].includes('LocalBusiness'), String(lb['@type'])]);
checks.push(['street matches site.ts', lb.address.streetAddress === address.street.ar, lb.address.streetAddress]);
checks.push(['lat matches', lb.geo.latitude === address.coordinates.lat, String(lb.geo.latitude)]);
checks.push(['lng matches', lb.geo.longitude === address.coordinates.lng, String(lb.geo.longitude)]);
checks.push(['phone matches showroom', lb.telephone === phones.showroom.e164, lb.telephone]);
checks.push(['rating 4.5', lb.aggregateRating.ratingValue === reputation.ratingValue, String(lb.aggregateRating.ratingValue)]);
checks.push(['159 reviews', lb.aggregateRating.reviewCount === reputation.reviewCount, String(lb.aggregateRating.reviewCount)]);
checks.push(['facebook in sameAs', lb.sameAs.includes(social.facebook), lb.sameAs.join(',')]);
checks.push(['maps url', lb.hasMap === address.mapsUrl, lb.hasMap]);

// Opening hours: Sat-Thu 10:00, Fri 13:00, all closing at end of day.
const spec = lb.openingHoursSpecification;
const fri = spec.find((s: any) => s.dayOfWeek.includes('Friday'));
const sat = spec.find((s: any) => s.dayOfWeek.includes('Saturday'));
checks.push(['Friday opens 13:00', fri.opens === '13:00', `${fri.opens}-${fri.closes}`]);
checks.push(['Saturday opens 10:00', sat.opens === '10:00', `${sat.opens}-${sat.closes}`]);
checks.push(['closes 23:59 (schema-legal midnight)', spec.every((s: any) => s.closes === '23:59'), spec[0].closes]);
const days = new Set(spec.flatMap((s: any) => s.dayOfWeek));
checks.push(['all 7 days covered', days.size === 7, [...days].join(',')]);

const org: any = organizationJsonLd('en');
checks.push(['Organization type', org['@type'] === 'Organization', org['@type']]);

const prod: any = productJsonLd(
  { slug: 'x', sku: 'SKU1', titleAr: 'آيفون', titleEn: 'iPhone', descriptionAr: 'وصف', descriptionEn: 'desc',
    price: 799000, inStock: true, images: [{ url: '/products/placeholder.svg' }], brand: { name: 'Apple' } },
  'en',
);
checks.push(['Product price is decimal JOD', prod.offers.price === '799.000', prod.offers.price]);
checks.push(['Product currency JOD', prod.offers.priceCurrency === 'JOD', prod.offers.priceCurrency]);
checks.push(['Product availability InStock', prod.offers.availability.endsWith('InStock'), prod.offers.availability]);

const bc: any = breadcrumbJsonLd([{ name: 'Home', path: '' }, { name: 'Phones', path: 'category/phones' }], 'en');
checks.push(['Breadcrumb positions 1..n', bc.itemListElement[0].position === 1 && bc.itemListElement[1].position === 2, 'ok']);

// Every block must be JSON-serialisable (they are embedded in a <script>).
for (const [name, obj] of [['localBusiness', lb], ['organization', org], ['product', prod], ['breadcrumb', bc]] as const) {
  try { JSON.parse(JSON.stringify(obj)); checks.push([`${name} serialises`, true, 'ok']); }
  catch { checks.push([`${name} serialises`, false, 'FAILED']); }
}

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(36)} ${detail}`);
}
console.log(failed === 0 ? '\nAll JSON-LD checks passed.' : `\n${failed} CHECK(S) FAILED`);

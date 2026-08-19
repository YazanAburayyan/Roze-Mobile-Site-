import { whatsapp, phones } from '../lib/site';
import { whatsappUrl, serviceRequestMessage, orderMessage } from '../lib/whatsapp';

const url = whatsappUrl(
  whatsapp.service,
  serviceRequestMessage(
    {
      reference: 'ROZE-S-TEST',
      customerName: 'اختبار',
      customerPhone: '+962790000000',
      deviceType: 'phone',
      deviceModel: 'iPhone 15',
      serviceName: 'تغيير شاشة',
      issueDescription: 'الشاشة مكسورة',
      preferredTime: null,
    },
    'ar',
  ),
);

console.log('service number  :', whatsapp.service);
console.log('showroom number :', phones.showroom.e164);
console.log('booking uses SERVICE :', url.includes('962796003040'));
console.log('booking uses SHOWROOM:', url.includes('962799000301'));

const decoded = decodeURIComponent(url.split('text=')[1]);
console.log('arabic intact   :', decoded.includes('حجز موعد صيانة'));
console.log('no mojibake     :', !decoded.includes('%D8') && !/Ã|Ø/.test(decoded));
console.log('newlines kept   :', decoded.includes('\n'));

const sales = whatsappUrl(
  whatsapp.sales,
  orderMessage(
    {
      reference: 'ROZE-TEST', customerName: 'اختبار', customerPhone: '+962790000000',
      governorate: 'amman', area: 'الجبيهة', street: 'شارع أبو نصير', notes: null,
      items: [{ productId: '1', titleAr: 'آيفون 15 برو', titleEn: 'iPhone 15 Pro', sku: 'SKU1', unitPriceFils: 799000, quantity: 1, lineTotalFils: 799000 }],
      subtotalFils: 799000, shippingFils: 0, totalFils: 799000,
    },
    'ar',
  ),
);
const sd = decodeURIComponent(sales.split('text=')[1]);
console.log('--- order handoff ---');
console.log('order uses SALES:', sales.includes('962799000301'));
console.log('price formatted :', sd.includes('799.000'));
console.log(sd.split('\n').slice(0, 3).join(' / '));

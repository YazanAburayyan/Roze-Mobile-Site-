'use client';

import * as React from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QuantityStepper } from '@/components/commerce';
import { Button, buttonClasses } from '@/components/ui';
import { useCart } from '@/lib/cart/store';

export interface AddToCartPanelProduct {
  id: string;
  slug: string;
  sku: string;
  titleAr: string;
  titleEn: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  inStock: boolean;
}

export interface AddToCartPanelProps {
  product: AddToCartPanelProduct;
  image: string;
  whatsappHref: string;
}

/**
 * The buy box.
 *
 * CRITICAL BEHAVIOUR: add-to-cart is disabled whenever the product is out of
 * stock (or has zero counted stock), but the WhatsApp enquiry button is never
 * disabled by stock. A customer must always be able to ask about a device
 * that's out of stock — for a shop this size that enquiry IS the sale.
 */
export function AddToCartPanel({ product, image, whatsappHref }: AddToCartPanelProps) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');

  const add = useCart((state) => state.add);
  const maxQuantity = Math.max(product.stockQuantity, 0);
  const canAddToCart = product.inStock && maxQuantity > 0;

  const [quantity, setQuantity] = React.useState(1);

  function handleAddToCart() {
    if (!canAddToCart) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        sku: product.sku,
        titleAr: product.titleAr,
        titleEn: product.titleEn,
        unitPriceFils: product.price,
        compareAtPriceFils: product.compareAtPrice,
        image,
        maxQuantity,
      },
      quantity
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={Math.min(quantity, Math.max(maxQuantity, 1))}
          onChange={setQuantity}
          max={Math.max(maxQuantity, 1)}
          disabled={!canAddToCart}
        />
        <Button
          type="button"
          size="lg"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          iconStart={<ShoppingCart className="size-5" aria-hidden="true" />}
          className="flex-1 sm:flex-initial"
        >
          {canAddToCart ? tCommon('addToCart') : t('outOfStock')}
        </Button>
      </div>

      {/* Always live, even out of stock — see the module doc above. */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses({ variant: 'outline', size: 'lg' })}
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        {t('askOnWhatsapp')}
      </a>
    </div>
  );
}

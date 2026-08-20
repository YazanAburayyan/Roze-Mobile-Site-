import { Phone, MessageCircle, Facebook } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { phones, social, whatsapp } from '@/lib/site';

/**
 * Slim utility bar above the header: how to reach the shop, nothing else.
 *
 * NOTE ON THE REFERENCE DESIGN: the mockup this follows showed a phone number
 * and an email address in this bar. ROZE has three real phone numbers (see
 * lib/site.ts) and **no confirmed email address**, so this renders the real
 * showroom line, WhatsApp and Facebook instead. An invented inbox would be a
 * dead end for a customer who wrote to it. If the client supplies an address,
 * add it to lib/site.ts and it belongs here.
 *
 * Hidden below `sm`: at phone width the header itself already carries a
 * call button, and stacking two bars eats the viewport.
 */
export async function TopBar() {
  const t = await getTranslations();

  return (
    <div className="band-ink hidden border-b border-line-invert sm:block">
      <div className="wrap flex h-10 items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <a
            href={`tel:${phones.showroom.e164}`}
            className="inline-flex items-center gap-2 text-small text-mist transition-colors hover:text-paper"
          >
            <Phone aria-hidden="true" className="size-3.5 shrink-0" />
            <span data-numeric dir="ltr">
              {phones.showroom.display}
            </span>
          </a>

          <a
            href={`https://wa.me/${whatsapp.sales.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-small text-mist transition-colors hover:text-paper"
          >
            <MessageCircle aria-hidden="true" className="size-3.5 shrink-0" />
            <span>{t('header.whatsapp')}</span>
          </a>
        </div>

        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="text-mist transition-colors hover:text-paper"
        >
          <Facebook aria-hidden="true" className="size-4" />
        </a>
      </div>
    </div>
  );
}

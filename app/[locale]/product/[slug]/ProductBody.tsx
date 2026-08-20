import * as React from 'react';
import { Facebook, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import type { Locale } from '@/i18n/routing';
import { pick } from '@/lib/catalog';
import { Tabs } from '@/components/ui';

/**
 * The lower half of the product page: description and specifications as tabs,
 * plus the share row.
 *
 * WHAT THE REFERENCE LAYOUT HAD THAT THIS DELIBERATELY DOES NOT:
 *
 * - **A "Review" tab.** ROZE has no product reviews and none may be invented.
 *   The 4.5★ on the homepage is a shop-level Google rating, not a per-product
 *   score, and printing stars on a product would be a fabricated claim.
 * - **Colour swatches.** There is no variant or colour data in the schema.
 * - **A wishlist.** Not built.
 * - **A tag list.** No tag data exists; the category and brand links above
 *   already do that job honestly.
 *
 * So the tab strip is Description | Specifications — the two things that are
 * real. Sharing is genuine: WhatsApp and Facebook take a URL, no API needed.
 */

/** Text that reads as numbers/Latin — force LTR so bidi never scrambles it. */
function isArabicText(value: string): boolean {
  return /[؀-ۿ]/.test(value);
}

export type SpecAttribute = {
  id: string;
  nameAr: string;
  nameEn: string;
  valueAr: string;
  valueEn: string;
  group: string | null;
};

export type SpecGroup = { key: string; group: string | null; items: SpecAttribute[] };

function SpecTable({ groups, locale }: { groups: SpecGroup[]; locale: Locale }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full border-collapse font-mono text-small">
        <tbody>
          {groups.map((bucket) => (
            <React.Fragment key={bucket.key}>
              {bucket.group ? (
                <tr>
                  <th
                    colSpan={2}
                    scope="colgroup"
                    className="border-b border-line bg-mist/40 px-4 py-2.5 text-start font-medium text-ink"
                  >
                    {bucket.group}
                  </th>
                </tr>
              ) : null}
              {bucket.items.map((attr) => {
                const name = pick(locale, attr.nameAr, attr.nameEn);
                const value = pick(locale, attr.valueAr, attr.valueEn);
                return (
                  <tr
                    key={attr.id}
                    className="border-b border-line last:border-b-0 odd:bg-surface even:bg-sand/60"
                  >
                    <th
                      scope="row"
                      className="w-2/5 px-4 py-2.5 text-start font-normal text-muted"
                    >
                      {name}
                    </th>
                    <td
                      dir={isArabicText(value) ? undefined : 'ltr'}
                      className="px-4 py-2.5 text-ink"
                    >
                      {value}
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function ProductBody({
  locale,
  description,
  specGroups,
  productUrl,
  whatsappHref,
}: {
  locale: Locale;
  description: string;
  specGroups: SpecGroup[];
  productUrl: string;
  whatsappHref: string;
}) {
  const t = await getTranslations('product');

  const items = [
    {
      value: 'description',
      label: t('description'),
      content: (
        <p
          className="text-body text-muted"
          style={{ maxInlineSize: 'var(--roze-measure)' }}
        >
          {description}
        </p>
      ),
    },
    ...(specGroups.length > 0
      ? [
          {
            value: 'specifications',
            label: t('specifications'),
            content: <SpecTable groups={specGroups} locale={locale} />,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <Tabs items={items} defaultValue="description" />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <span className="text-small font-medium text-ink">{t('shareProduct')}</span>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="inline-flex size-9 items-center justify-center rounded-sm border border-line text-teal-deep transition-colors hover:bg-mist motion-reduce:transition-none"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="inline-flex size-9 items-center justify-center rounded-sm border border-line text-teal-deep transition-colors hover:bg-mist motion-reduce:transition-none"
        >
          <Facebook aria-hidden="true" className="size-4" />
        </a>
      </div>
    </div>
  );
}

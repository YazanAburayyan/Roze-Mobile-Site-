'use client';

import * as React from 'react';
import {
  ChevronDown,
  Smartphone,
  Laptop,
  Gamepad2,
  Wrench,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/components/ui';
import type { Locale } from '@/i18n/routing';
import type { getTopLevelCategories } from '@/lib/catalog';

export type MegaMenuCategory = Awaited<ReturnType<typeof getTopLevelCategories>>[number];
type MegaMenuChild = MegaMenuCategory['children'][number];

const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  'gamepad-2': Gamepad2,
  wrench: Wrench,
};

function CategoryIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = (icon && ICONS[icon]) || Package;
  return <Icon aria-hidden="true" className={className} />;
}

function categoryName(category: { nameAr: string; nameEn: string }, locale: Locale): string {
  return locale === 'ar' ? category.nameAr : category.nameEn;
}

/**
 * Desktop category navigation, driven by `getTopLevelCategories()`.
 *
 * Maintenance is a top-level peer of the sales categories in the data (it has
 * no `parentId`), and every top-level row here renders with the same
 * button/link markup and type scale — no special-cased "smaller" or
 * "secondary" styling for the entry with no children. That equal weight is a
 * brand requirement: the logo's two intersecting circles are sales and
 * service meeting as equals.
 *
 * Keyboard: Escape closes the open panel and returns focus to its trigger.
 * A pointerdown outside the nav also closes it. `aria-expanded` tracks state
 * on every trigger button.
 */
export function MegaMenu({
  categories,
  className,
}: {
  categories: MegaMenuCategory[];
  className?: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [openId, setOpenId] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const triggerRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const closeMenu = React.useCallback((restoreFocusTo?: string | null) => {
    setOpenId(null);
    if (restoreFocusTo) triggerRefs.current.get(restoreFocusTo)?.focus();
  }, []);

  React.useEffect(() => {
    if (!openId) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(openId);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenId(null);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openId, closeMenu]);

  return (
    <nav
      ref={navRef}
      aria-label={t('a11y.mainNavigation')}
      className={cn('hidden items-stretch lg:flex', className)}
    >
      {categories.map((category) => {
        const hasChildren = category.children.length > 0;
        const label = categoryName(category, locale);

        if (!hasChildren) {
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex items-center gap-2 px-3 text-body font-medium text-ink transition-colors hover:text-teal-deep motion-reduce:transition-none"
            >
              <CategoryIcon icon={category.icon} className="size-4 text-teal-deep" />
              {label}
            </Link>
          );
        }

        const isOpen = openId === category.id;

        return (
          <div key={category.id} className="relative flex">
            <button
              type="button"
              ref={(el) => {
                if (el) triggerRefs.current.set(category.id, el);
                else triggerRefs.current.delete(category.id);
              }}
              aria-expanded={isOpen}
              aria-haspopup="true"
              onClick={() => setOpenId(isOpen ? null : category.id)}
              className="flex items-center gap-2 px-3 text-body font-medium text-ink transition-colors hover:text-teal-deep motion-reduce:transition-none"
            >
              <CategoryIcon icon={category.icon} className="size-4 text-teal-deep" />
              {label}
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'size-3.5 transition-transform motion-reduce:transition-none',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {isOpen ? (
              <div
                role="menu"
                className="absolute inset-inline-start-0 top-full z-40 min-w-64 rounded-md border border-line bg-paper p-3 shadow-roze"
              >
                <Link
                  href={`/category/${category.slug}`}
                  role="menuitem"
                  onClick={() => setOpenId(null)}
                  className="block rounded-sm px-3 py-2 text-small font-semibold text-teal-deep hover:bg-mist"
                >
                  {t('nav.allCategories')}
                </Link>
                <ul className="mt-1 flex flex-col">
                  {category.children.map((child: MegaMenuChild) => (
                    <li key={child.id}>
                      <Link
                        href={`/category/${category.slug}/${child.slug}`}
                        role="menuitem"
                        onClick={() => setOpenId(null)}
                        className="block rounded-sm px-3 py-2 text-small text-ink hover:bg-mist"
                      >
                        {categoryName(child, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

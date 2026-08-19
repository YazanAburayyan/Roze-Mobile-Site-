"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import { localeDirection } from "@/i18n/routing";
import { cn } from "@/components/ui";
import { buildQueryString } from "./query-params";

export interface PaginationProps {
  page: number;
  pageCount: number;
  className?: string;
}

/**
 * Previous/next chevrons flip direction in RTL — "next" points toward
 * reading-start, which is visually left in Arabic. We flip the icon glyph
 * itself rather than reordering the DOM, and keep the buttons in logical
 * (start/end) order so tab order stays natural in both directions.
 */
export function Pagination({ page, pageCount, className }: PaginationProps) {
  const t = useTranslations("a11y");
  const locale = useLocale() as Locale;
  const isRtl = localeDirection[locale] === "rtl";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  function goToPage(target: number) {
    const clamped = Math.min(pageCount, Math.max(1, target));
    const query = buildQueryString(searchParams, {
      page: clamped === 1 ? null : String(clamped),
    });
    router.push(`${pathname}${query}`);
  }

  const canGoPrevious = page > 1;
  const canGoNext = page < pageCount;

  // In RTL, "previous" (toward the start, i.e. earlier pages) visually
  // points right, and "next" points left — so the chevrons swap glyphs.
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={t("pagination")} className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        aria-label={t("previousPage")}
        disabled={!canGoPrevious}
        onClick={() => goToPage(page - 1)}
        className="inline-flex size-10 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
      >
        <PreviousIcon className="size-4" aria-hidden="true" />
      </button>

      <span aria-current="page" className="px-2 text-small text-muted">
        {t("pageOfTotal", { page, total: pageCount })}
      </span>

      <button
        type="button"
        aria-label={t("nextPage")}
        disabled={!canGoNext}
        onClick={() => goToPage(page + 1)}
        className="inline-flex size-10 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
      >
        <NextIcon className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

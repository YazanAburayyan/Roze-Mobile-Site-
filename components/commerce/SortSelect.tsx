"use client";

import type * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type { SortKey } from "@/lib/catalog";
import { Select, type SelectOption } from "@/components/ui";
import { buildQueryString } from "./query-params";

export interface SortSelectProps {
  className?: string;
}

const SORT_KEYS: SortKey[] = ["newest", "price-asc", "price-desc", "name"];

/**
 * Sort control, state lives entirely in the `sort` query param. Changing the
 * sort resets pagination back to page 1.
 */
export function SortSelect({ className }: SortSelectProps) {
  const t = useTranslations("category");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const labels: Record<SortKey, string> = {
    newest: t("sortNewest"),
    "price-asc": t("sortPriceLowToHigh"),
    "price-desc": t("sortPriceHighToLow"),
    name: t("sortName"),
  };

  const options: SelectOption[] = SORT_KEYS.map((key) => ({
    value: key,
    label: labels[key],
  }));

  const currentSort = (searchParams.get("sort") as SortKey | null) ?? "newest";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const query = buildQueryString(searchParams, {
      sort: value === "newest" ? null : value,
      page: null,
    });
    router.push(`${pathname}${query}`);
  }

  return (
    <Select
      label={t("sort")}
      options={options}
      value={currentSort}
      onChange={handleChange}
      className={className}
    />
  );
}

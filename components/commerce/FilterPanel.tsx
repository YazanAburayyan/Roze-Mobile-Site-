"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Checkbox, Input, Button } from "@/components/ui";
import { buildQueryString } from "./query-params";

export interface FilterPanelBrand {
  slug: string;
  name: string;
}

export interface FilterPanelProps {
  brands: FilterPanelBrand[];
  className?: string;
}

/**
 * Brand checkboxes, price min/max, in-stock-only toggle, and clear-filters.
 * All state lives in the URL query string (`brand`, `minPrice`, `maxPrice`,
 * `inStock`) so filters are shareable and the back button works. Any filter
 * change resets pagination to page 1.
 */
export function FilterPanel({ brands, className }: FilterPanelProps) {
  const t = useTranslations("category");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedBrands = searchParams.getAll("brand");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStockOnly = searchParams.get("inStock") === "1";

  const hasActiveFilters =
    selectedBrands.length > 0 || minPrice !== "" || maxPrice !== "" || inStockOnly;

  function pushParams(next: URLSearchParams) {
    next.delete("page");
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  function toggleBrand(slug: string, checked: boolean) {
    const next = new URLSearchParams(searchParams.toString());
    const current = next.getAll("brand").filter((value) => value !== slug);
    next.delete("brand");
    for (const value of checked ? [...current, slug] : current) {
      next.append("brand", value);
    }
    pushParams(next);
  }

  function handlePriceCommit(key: "minPrice" | "maxPrice", value: string) {
    const query = buildQueryString(searchParams, { [key]: value, page: null });
    router.push(`${pathname}${query}`);
  }

  function toggleInStock(checked: boolean) {
    const query = buildQueryString(searchParams, {
      inStock: checked ? "1" : null,
      page: null,
    });
    router.push(`${pathname}${query}`);
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("brand");
    next.delete("minPrice");
    next.delete("maxPrice");
    next.delete("inStock");
    next.delete("page");
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h3">{t("filters")}</h2>
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            {t("clearFilters")}
          </Button>
        ) : null}
      </div>

      {brands.length > 0 ? (
        <fieldset className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          <legend className="mb-1 text-small font-medium text-ink">{t("brandFilter")}</legend>
          {brands.map((brand) => (
            <Checkbox
              key={brand.slug}
              label={brand.name}
              checked={selectedBrands.includes(brand.slug)}
              onChange={(event) => toggleBrand(brand.slug, event.target.checked)}
            />
          ))}
        </fieldset>
      ) : null}

      <fieldset className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
        <legend className="mb-1 text-small font-medium text-ink">{t("priceFilter")}</legend>
        {/* Each field is min-w-0 so the pair shares the row and shrinks with the
            sidebar instead of overflowing it. */}
        <div className="grid grid-cols-2 items-start gap-2">
          <Input
            label={t("minPrice")}
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={minPrice}
            key={`min-${minPrice}`}
            onBlur={(event) => handlePriceCommit("minPrice", event.target.value)}
            className="font-mono tabular-nums"
          />
          <Input
            label={t("maxPrice")}
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={maxPrice}
            key={`max-${maxPrice}`}
            onBlur={(event) => handlePriceCommit("maxPrice", event.target.value)}
            className="font-mono tabular-nums"
          />
        </div>
      </fieldset>

      <fieldset className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
        <legend className="mb-1 text-small font-medium text-ink">
          {t("availabilityFilter")}
        </legend>
        <Checkbox
          label={t("inStockOnly")}
          checked={inStockOnly}
          onChange={(event) => toggleInStock(event.target.checked)}
        />
      </fieldset>
    </div>
  );
}

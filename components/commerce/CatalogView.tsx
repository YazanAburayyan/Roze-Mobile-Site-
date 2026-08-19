import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { buttonClasses, cn } from "@/components/ui";
import { ProductCard, type ProductCardProduct } from "./ProductCard";
import { FilterPanel, type FilterPanelBrand } from "./FilterPanel";
import { SortSelect } from "./SortSelect";
import { Pagination } from "./Pagination";

export interface CatalogViewEmptyState {
  title: string;
  body: string;
  browseHref: string;
  browseLabel: string;
  contactHref: string;
  contactLabel: string;
}

export interface CatalogViewProps {
  /** Brands available to filter by. Pass an empty array to hide the filter column entirely. */
  brands: FilterPanelBrand[];
  products: ProductCardProduct[];
  total: number;
  page: number;
  pageCount: number;
  emptyState: CatalogViewEmptyState;
  className?: string;
}

/**
 * The filterable, sortable, paginated product grid.
 *
 * This is the SINGLE implementation of the catalogue grid. It backs the
 * category page, every brand page, and the offers page — filters/sort/
 * pagination all live in FilterPanel/SortSelect/Pagination (state in the URL
 * query string), and this component only lays out the result count, the
 * grid itself, and the empty state around them. Do not copy this markup
 * into another page — import CatalogView instead.
 */
export async function CatalogView({
  brands,
  products,
  total,
  page,
  pageCount,
  emptyState,
  className,
}: CatalogViewProps) {
  const t = await getTranslations("category");

  const results = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-small text-muted">
          {t("showing", { count: products.length, total })}
        </p>
        <SortSelect />
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-md border border-line bg-paper p-10 text-center shadow-roze">
          <p className="text-h3">{emptyState.title}</p>
          <p className="text-body text-muted">{emptyState.body}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={emptyState.browseHref} className={buttonClasses({ variant: "outline" })}>
              {emptyState.browseLabel}
            </Link>
            <a
              href={emptyState.contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "primary" })}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {emptyState.contactLabel}
            </a>
          </div>
        </div>
      )}
    </div>
  );

  if (brands.length === 0) {
    return <div className={className}>{results}</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]", className)}>
      <FilterPanel brands={brands} className="lg:sticky lg:top-4 lg:self-start" />
      {results}
    </div>
  );
}

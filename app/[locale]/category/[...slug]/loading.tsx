import { Skeleton } from '@/components/ui';

/**
 * Mirrors the category page's shape: header, sub-category tiles, filter
 * rail, and a product grid — so layout doesn't jump when real data lands.
 */
export default function CategoryLoading() {
  return (
    <div className="wrap flex flex-col gap-8 pb-16">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </header>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-md" />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-40" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[3/4] w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

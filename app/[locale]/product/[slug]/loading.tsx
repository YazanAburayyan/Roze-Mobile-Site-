import { Skeleton } from '@/components/ui';

export default function ProductLoading() {
  return (
    <div className="wrap flex flex-col gap-8 py-8">
      <Skeleton className="h-5 w-2/3 max-w-sm" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="size-16 rounded-sm" />
            <Skeleton className="size-16 rounded-sm" />
            <Skeleton className="size-16 rounded-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-13 w-full max-w-sm" />
          <Skeleton className="h-13 w-full max-w-sm" />
        </div>
      </div>

      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
}

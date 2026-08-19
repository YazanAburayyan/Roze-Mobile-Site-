import Image from "next/image";
import { Link } from "@/i18n/routing";
import { cn } from "@/components/ui";

export interface BrandTileProps {
  href: string;
  name: string;
  logo?: string | null;
  className?: string;
}

/** Tile for the homepage brand strip and /brands-list. Logo if present, name otherwise. */
export function BrandTile({ href, name, logo, className }: BrandTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-20 items-center justify-center rounded-md border border-line bg-paper p-4 shadow-roze transition-colors hover:bg-mist/60 motion-reduce:transition-none",
        className
      )}
    >
      {logo ? (
        <span className="relative h-full w-full">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="160px"
            className="object-contain"
          />
        </span>
      ) : (
        <span lang="en" className="font-latin text-body font-medium text-ink">
          {name}
        </span>
      )}
    </Link>
  );
}

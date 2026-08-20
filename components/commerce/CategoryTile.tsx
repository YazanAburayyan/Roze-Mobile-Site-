import {
  Smartphone,
  Laptop,
  Gamepad2,
  Wrench,
  Headphones,
  Tablet,
  Monitor,
  Watch,
  Camera,
  Speaker,
  Keyboard,
  Mouse,
  HardDrive,
  Battery,
  Cable,
  Printer,
  Router,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/components/ui";

/**
 * Seed data stores lucide-react icon names as plain strings (e.g.
 * "smartphone", "gamepad-2"). This maps the known catalogue set to real
 * components; anything unrecognised falls back to `Package` rather than
 * crashing the page.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  "gamepad-2": Gamepad2,
  wrench: Wrench,
  headphones: Headphones,
  tablet: Tablet,
  monitor: Monitor,
  watch: Watch,
  camera: Camera,
  speaker: Speaker,
  keyboard: Keyboard,
  mouse: Mouse,
  "hard-drive": HardDrive,
  battery: Battery,
  cable: Cable,
  printer: Printer,
  router: Router,
};

/** Shared with the homepage category grid. */
export function resolveCategoryIcon(name?: string | null): LucideIcon {
  if (!name) return Package;
  return ICON_MAP[name] ?? Package;
}

export interface CategoryTileProps {
  href: string;
  label: string;
  icon?: string | null;
  className?: string;
}

/** Homepage category strip tile: icon over label, one link. */
export function CategoryTile({ href, label, icon, className }: CategoryTileProps) {
  const Icon = resolveCategoryIcon(icon);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-md border border-line bg-paper p-4 text-center shadow-roze transition-colors hover:bg-mist/60 motion-reduce:transition-none",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-md bg-mist text-teal-deep transition-colors group-hover:bg-teal group-hover:text-ink motion-reduce:transition-none">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <span className="text-small font-medium text-ink">{label}</span>
    </Link>
  );
}

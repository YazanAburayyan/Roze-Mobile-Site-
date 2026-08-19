import * as React from "react";
import { cn } from "./cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Shimmer placeholder. Animation degrades to a static mist block under
 * prefers-reduced-motion (handled globally in app/globals.css, which zeroes
 * animation-duration for all elements — this component just avoids fighting
 * that by not hardcoding a duration override).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-sm bg-mist motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

/**
 * Product image helper
 *
 * Provides typed helpers for product images with fallback to placeholder.
 *
 * To add a real product photo:
 * 1. Drop the image file into public/products/ (e.g., public/products/phone-001.jpg)
 * 2. Set ProductImage.url to the path (e.g., "/products/phone-001.jpg")
 * 3. The productImageUrl() function will return the real URL
 *
 * Until photos are added, all products use the placeholder SVG.
 */

export const PLACEHOLDER_IMAGE = '/products/placeholder.svg';

/**
 * Get the URL for a product image, with fallback to placeholder
 * @param image - Product image object with url property, or null/undefined
 * @returns The image URL or placeholder if not provided
 *
 * @example
 * const url = productImageUrl(product.image);
 * // Returns: "/products/phone-001.jpg" or "/products/placeholder.svg"
 */
export function productImageUrl(image?: { url: string } | null): string {
  return image?.url ?? PLACEHOLDER_IMAGE;
}

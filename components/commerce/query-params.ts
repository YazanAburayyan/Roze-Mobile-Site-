/**
 * Shared URL-query helpers for FilterPanel / SortSelect / Pagination.
 *
 * All catalogue browsing state (filters, sort, page) lives in the query
 * string so results are shareable links and the browser back button works.
 * `null`/`undefined`/empty-string values remove the key entirely instead of
 * writing an empty param.
 */

export function buildQueryString(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value == null || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const query = next.toString();
  return query ? `?${query}` : "";
}

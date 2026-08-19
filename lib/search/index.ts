import Fuse from 'fuse.js';
import { expandQuery, normalizeArabic } from '../arabic';
import type { SearchDoc } from '../catalog';

/**
 * The search seam.
 *
 * Phase 1 runs Fuse.js in the browser over the whole catalogue. That is the
 * right call at ~48 SKUs: zero infrastructure, instant results, works offline
 * after first load. It is the WRONG call at ~1500 SKUs, where shipping the
 * catalogue as JSON over Jordanian mobile data becomes a real cost.
 *
 * So search goes through this interface. Replacing Fuse with a server route or
 * Meilisearch means writing a second `SearchProvider` and swapping the export
 * at the bottom of this file. Components only ever see `SearchProvider`.
 */

export type SearchHit = { doc: SearchDoc; score: number };

export interface SearchProvider {
  search(query: string, limit?: number): SearchHit[];
}

/**
 * Fuse over the pre-normalised `haystack` field.
 *
 * Two things make Arabic search work here, and both matter:
 *  1. The index text was normalised at build time (lib/arabic), so diacritics,
 *     alef variants and Arabic-Indic digits are already folded away.
 *  2. The query is expanded across scripts before matching, so `ايفون` also
 *     searches for `iphone` and hits a product whose title is Latin-only.
 *
 * Without (2), a shopper typing Arabic would silently miss half the catalogue.
 */
export class FuseSearchProvider implements SearchProvider {
  private fuse: Fuse<SearchDoc>;

  constructor(docs: SearchDoc[]) {
    this.fuse = new Fuse(docs, {
      keys: [
        { name: 'haystack', weight: 1 },
        { name: 'sku', weight: 0.5 },
      ],
      // Loose enough to forgive a typo, tight enough not to return the catalogue.
      threshold: 0.34,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }

  search(query: string, limit = 24): SearchHit[] {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    // Run every cross-script variant and keep each document's best score.
    const best = new Map<string, SearchHit>();

    for (const variant of expandQuery(trimmed)) {
      if (variant.length < 2) continue;
      for (const result of this.fuse.search(variant, { limit: limit * 2 })) {
        const score = result.score ?? 1;
        const existing = best.get(result.item.id);
        if (!existing || score < existing.score) {
          best.set(result.item.id, { doc: result.item, score });
        }
      }
    }

    // An exact normalised substring beats anything fuzzy — someone typing a
    // full model name should see it first, not a near-miss accessory.
    const exact = normalizeArabic(trimmed);
    for (const hit of best.values()) {
      if (exact.length >= 2 && hit.doc.haystack.includes(exact)) {
        hit.score = Math.min(hit.score, 0.01);
      }
    }

    return [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
  }
}

export function createSearchProvider(docs: SearchDoc[]): SearchProvider {
  return new FuseSearchProvider(docs);
}

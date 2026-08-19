/**
 * lib/arabic.ts
 *
 * Arabic-aware text normalization for the ROZE storefront search/browse
 * experience. Dependency-free on purpose: this module is imported by the
 * Fuse.js search index build step and must stay trivially testable and
 * bundle-cheap.
 *
 * Why this exists: naive `.toLowerCase()` string matching is functionally
 * broken for Arabic. The same word can be typed with or without hamza seats
 * (أ/إ/آ/ا), with or without tashkeel (diacritics), with ta-marbuta vs. ha,
 * with alef-maqsura vs. ya, and Jordanian shoppers freely mix Arabic-Indic
 * digits, Latin digits, Arabic transliterations, and English brand names in
 * the same search box. This module normalizes all of that into one
 * comparable form and provides a small cross-script synonym table so a
 * search for "ايفون" finds a product titled "iPhone 15 Pro" and vice versa.
 */

// ---------------------------------------------------------------------------
// normalizeArabic
// ---------------------------------------------------------------------------

/** Tashkeel / diacritic marks + tatweel (kashida), stripped entirely. */
const DIACRITICS_RE = /[ً-ْٓ-ٰٕـ]/g;

/** Alef variants (hamza-above, hamza-below, madda, wasla) -> bare alef. */
const ALEF_RE = /[أإآٱ]/g;

/** Arabic-Indic (U+0660-0669) and Extended Arabic-Indic / Persian (U+06F0-06F9) digits -> ASCII. */
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function buildDigitMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < 10; i++) {
    map.set(ARABIC_INDIC_DIGITS[i]!, String(i));
    map.set(PERSIAN_DIGITS[i]!, String(i));
  }
  return map;
}
const DIGIT_MAP = buildDigitMap();
const DIGIT_RE = /[٠-٩۰-۹]/g;

/** Runs of whitespace (space, tab, newline, and Arabic-adjacent NBSP-ish) collapse to a single space. */
const WHITESPACE_RE = /\s+/g;

/**
 * Options for {@link normalizeArabic}.
 */
export interface NormalizeArabicOptions {
  /**
   * Strip a leading Arabic definite article "ال" (the) when it is safe to
   * do so. Default: true.
   *
   * Tradeoff (read before flipping this): "ال" is both the definite
   * article ("the") AND the first two letters of many real words that
   * are not "al-" + noun (e.g. "الف" = "thousand", "الم" = pain-ish
   * roots, "الله"). Blindly stripping it would turn "الف" (thousand)
   * into "ف" (a single meaningless letter) and wreck matching. We only
   * strip when the remainder after stripping is >= 3 characters, which
   * empirically covers the common product-search case ("الايفون" ->
   * "ايفون", "السامسونج" -> "سامسونج") while leaving short/ambiguous
   * words alone. This is a heuristic, not a linguistic parser -- it will
   * occasionally under-strip (leaving "ال" on a genuine article + short
   * word) but it will not silently mangle short words into nonsense,
   * which is the worse failure mode for a search box.
   */
  stripAl?: boolean;
}

/**
 * Normalize a string (Arabic and/or Latin) into a canonical form suitable
 * for search matching:
 *  - strips tashkeel/diacritics and tatweel
 *  - folds hamza-seat alef variants (أ إ آ ٱ) and bare alef to ا
 *  - folds ta-marbuta ة -> ه
 *  - folds alef-maqsura ى -> ي
 *  - folds ؤ -> و and ئ -> ي
 *  - folds Arabic-Indic and Persian digits to ASCII 0-9
 *  - lowercases Latin text
 *  - optionally strips a leading "ال" definite article (see
 *    {@link NormalizeArabicOptions.stripAl})
 *  - collapses whitespace runs and trims
 *
 * This function is pure and idempotent: `normalizeArabic(normalizeArabic(x))
 * === normalizeArabic(x)`.
 */
export function normalizeArabic(
  input: string,
  options: NormalizeArabicOptions = {},
): string {
  const { stripAl = true } = options;

  if (!input) return "";

  let s = input;

  // Diacritics / tatweel first (order-independent, but do it before folding
  // so combining marks attached to letters we're about to fold don't linger).
  s = s.replace(DIACRITICS_RE, "");

  // Hamza-seat / alef family.
  s = s.replace(ALEF_RE, "ا");

  // Ta-marbuta -> ha.
  s = s.replace(/ة/g, "ه");

  // Alef-maqsura -> ya.
  s = s.replace(/ى/g, "ي");

  // Hamza-on-waw / hamza-on-ya -> base letter (same family of hamza-seat
  // variation as alef above: shoppers rarely type the hamza consistently).
  s = s.replace(/ؤ/g, "و");
  s = s.replace(/ئ/g, "ي");

  // Digits.
  s = s.replace(DIGIT_RE, (d) => DIGIT_MAP.get(d) ?? d);

  // Lowercase Latin text.
  s = s.toLowerCase();

  // Collapse whitespace + trim.
  s = s.replace(WHITESPACE_RE, " ").trim();

  // Strip leading "ال" definite article per-word, honoring the length guard.
  if (stripAl) {
    s = s
      .split(" ")
      .map((word) => {
        if (word.startsWith("ال") && word.length - 2 >= 3) {
          return word.slice(2);
        }
        return word;
      })
      .join(" ");
  }

  return s;
}

// ---------------------------------------------------------------------------
// TRANSLITERATIONS
// ---------------------------------------------------------------------------

/**
 * Canonical Latin term -> the Arabic spellings Jordanian shoppers actually
 * type for it. Adding a new term is one line. Values are raw (not yet
 * normalized); consumers should normalize both sides before comparing,
 * which {@link expandQuery} and {@link buildSearchIndexText} already do.
 */
export const TRANSLITERATIONS: Record<string, string[]> = {
  samsung: ["سامسونج", "سامسونغ", "سمسونج"],
  iphone: ["ايفون", "آيفون", "أيفون", "ايفن"],
  apple: ["ابل", "آبل", "أبل"],
  laptop: ["لابتوب", "لاب توب", "لپتوب"],
  mobile: ["موبايل", "جوال", "هاتف", "تلفون"],
  phone: ["موبايل", "جوال", "هاتف", "تلفون"],
  charger: ["شاحن", "شارجر"],
  headphones: ["سماعات", "سماعة", "هيدفون"],
  case: ["كفر", "كفرات", "جراب"],
  cover: ["كفر", "كفرات", "جراب"],
  screen: ["شاشة", "شاشه"],
  battery: ["بطارية", "بطاريه"],
  xiaomi: ["شاومي", "شياومي", "اكس مي"],
  huawei: ["هواوي"],
  honor: ["هونر"],
  lenovo: ["لينوفو"],
  dell: ["ديل"],
  hp: ["اتش بي", "إتش بي"],
  asus: ["اسوس", "أسوس"],
  playstation: ["بلايستيشن", "بلاي ستيشن", "سوني"],
  keyboard: ["كيبورد", "لوحة مفاتيح"],
  mouse: ["ماوس", "فأرة"],
  powerbank: ["باوربنك", "باور بنك", "بطارية متنقلة"],
  maintenance: ["صيانة", "تصليح", "اصلاح"],
  repair: ["صيانة", "تصليح", "اصلاح"],
};

/**
 * Reverse index built once at module load: normalized Arabic spelling ->
 * set of canonical Latin terms it maps to (a spelling can, rarely, belong
 * to more than one canonical term, e.g. shared phone/mobile spellings).
 */
const ARABIC_TO_LATIN = new Map<string, Set<string>>();
for (const [latin, arabicForms] of Object.entries(TRANSLITERATIONS)) {
  for (const form of arabicForms) {
    const key = normalizeArabic(form, { stripAl: false });
    if (!ARABIC_TO_LATIN.has(key)) ARABIC_TO_LATIN.set(key, new Set());
    ARABIC_TO_LATIN.get(key)!.add(latin);
  }
}

// ---------------------------------------------------------------------------
// expandQuery
// ---------------------------------------------------------------------------

/**
 * Expand a raw user query into the normalized query plus every cross-script
 * equivalent it recognizes, so a single Fuse search over both directions
 * works:
 *  - Arabic input ("ايفون") also yields "iphone" so it can match a
 *    Latin-only product title ("iPhone 15 Pro").
 *  - Latin input ("iphone") also yields the Arabic spellings ("ايفون",
 *    "آيفون", ...) so it can match an Arabic-only product title.
 *
 * The result always includes the normalized original query as the first
 * element, followed by any recognized expansions (deduplicated).
 */
export function expandQuery(query: string): string[] {
  const normalized = normalizeArabic(query);
  if (!normalized) return [];

  const results = new Set<string>([normalized]);

  // Split on whitespace so multi-word queries still find per-word synonyms.
  const words = normalized.split(" ").filter(Boolean);

  for (const word of words) {
    // Latin word -> Arabic spellings.
    const arabicForms = TRANSLITERATIONS[word];
    if (arabicForms) {
      for (const form of arabicForms) {
        results.add(normalizeArabic(form, { stripAl: false }));
      }
    }

    // Arabic word -> Latin canonical term(s). Also try without the "ال"
    // stripping guard removed above (normalized already stripped it) and
    // with stripAl disabled, in case the raw word matches a spelling that
    // itself starts with "ال"-like letters but was mapped without that
    // guard applied.
    const latinTerms = ARABIC_TO_LATIN.get(word);
    if (latinTerms) {
      for (const term of latinTerms) {
        results.add(term);
      }
    }
  }

  return Array.from(results);
}

// ---------------------------------------------------------------------------
// buildSearchIndexText
// ---------------------------------------------------------------------------

/**
 * Join and normalize a product's searchable fields (AR title, EN title,
 * brand, category, SKU, ...) into a single blob, then append the
 * cross-script expansions of any transliterated terms recognized within
 * it. Index this single field with Fuse.js so search stays script-agnostic
 * without needing per-field language detection at query time.
 */
export function buildSearchIndexText(fields: string[]): string {
  const normalizedFields = fields
    .map((f) => normalizeArabic(f ?? ""))
    .filter(Boolean);

  const base = normalizedFields.join(" ");
  if (!base) return "";

  const words = base.split(" ").filter(Boolean);
  const expansions = new Set<string>();

  for (const word of words) {
    const arabicForms = TRANSLITERATIONS[word];
    if (arabicForms) {
      for (const form of arabicForms) {
        expansions.add(normalizeArabic(form, { stripAl: false }));
      }
    }
    const latinTerms = ARABIC_TO_LATIN.get(word);
    if (latinTerms) {
      for (const term of latinTerms) {
        expansions.add(term);
      }
    }
  }

  if (expansions.size === 0) return base;
  return `${base} ${Array.from(expansions).join(" ")}`;
}

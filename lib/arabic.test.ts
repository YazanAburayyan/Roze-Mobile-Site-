import { describe, it, expect } from "vitest";
import {
  normalizeArabic,
  expandQuery,
  buildSearchIndexText,
  TRANSLITERATIONS,
} from "./arabic";

describe("normalizeArabic", () => {
  it("strips tashkeel/diacritics", () => {
    expect(normalizeArabic("مُوبَايِل")).toBe(normalizeArabic("موبايل"));
    expect(normalizeArabic("مُوبَايِل")).toBe("موبايل");
  });

  it("strips tatweel (kashida)", () => {
    expect(normalizeArabic("مـــرحبا")).toBe("مرحبا");
  });

  it("folds alef variants to bare alef", () => {
    expect(normalizeArabic("أحمد")).toBe(normalizeArabic("احمد"));
    expect(normalizeArabic("إحمد")).toBe(normalizeArabic("احمد"));
    expect(normalizeArabic("آحمد")).toBe(normalizeArabic("احمد"));
    expect(normalizeArabic("ٱحمد")).toBe(normalizeArabic("احمد"));
  });

  it("folds ta-marbuta (ة) to ha (ه)", () => {
    expect(normalizeArabic("شاشة")).toBe("شاشه");
    expect(normalizeArabic("بطارية")).toBe(normalizeArabic("بطاريه"));
  });

  it("folds alef-maqsura (ى) to ya (ي)", () => {
    expect(normalizeArabic("على")).toBe("علي");
  });

  it("folds hamza-on-waw and hamza-on-ya", () => {
    expect(normalizeArabic("مؤمن")).toBe("مومن");
    expect(normalizeArabic("سئل")).toBe("سيل");
  });

  it("folds Arabic-Indic digits to ASCII", () => {
    expect(normalizeArabic("١٥")).toBe("15");
    expect(normalizeArabic("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
  });

  it("folds Eastern/Persian digits to ASCII", () => {
    expect(normalizeArabic("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
  });

  it("digit fold: Arabic-Indic 15 matches ASCII 15", () => {
    expect(normalizeArabic("١٥")).toBe(normalizeArabic("15"));
  });

  it("lowercases Latin text", () => {
    expect(normalizeArabic("iPhone")).toBe("iphone");
    expect(normalizeArabic("SAMSUNG Galaxy")).toBe("samsung galaxy");
  });

  it("collapses whitespace runs and trims", () => {
    expect(normalizeArabic("  hello    world  ")).toBe("hello world");
    expect(normalizeArabic("موبايل\t\n  جوال")).toBe("موبايل جوال");
  });

  it("does not throw on empty string or whitespace-only input", () => {
    expect(() => normalizeArabic("")).not.toThrow();
    expect(normalizeArabic("")).toBe("");
    expect(() => normalizeArabic("   ")).not.toThrow();
    expect(normalizeArabic("   ")).toBe("");
    expect(() => normalizeArabic("\t\n  ")).not.toThrow();
  });

  describe("stripAl boundary case", () => {
    it("strips 'ال' when remainder is >= 3 chars", () => {
      expect(normalizeArabic("الايفون")).toBe("ايفون");
      expect(normalizeArabic("السامسونج")).toBe("سامسونج");
    });

    it("does NOT strip 'ال' when remainder would be < 3 chars (short words left alone)", () => {
      // "الف" (thousand) -> remainder "ف" is only 1 char, must NOT be stripped
      expect(normalizeArabic("الف")).toBe("الف");
      // remainder of exactly 2 chars should also be left alone
      expect(normalizeArabic("البا")).toBe("البا");
    });

    it("can be disabled via options", () => {
      expect(normalizeArabic("الايفون", { stripAl: false })).toBe("الايفون");
    });
  });

  it("is idempotent", () => {
    const samples = [
      "مُوبَايِل",
      "الأيفون",
      "آيفون ١٥ برو",
      "iPhone 15 Pro",
      "شاشة",
      "  سامسونج   Galaxy  ",
      "",
      "الف",
    ];
    for (const s of samples) {
      const once = normalizeArabic(s);
      const twice = normalizeArabic(once);
      expect(twice).toBe(once);
    }
  });
});

describe("acceptance criterion: cross-script iPhone matching", () => {
  const arTitle = "آيفون ١٥ برو";
  const enTitle = "iPhone 15 Pro";
  const indexText = buildSearchIndexText([arTitle, enTitle]);

  it("ايفون, آيفون, الأيفون, and iPhone all expand/normalize to match a product titled 'iPhone 15 Pro' / 'آيفون ١٥ برو'", () => {
    const queries = ["ايفون", "آيفون", "الأيفون", "iPhone"];
    for (const q of queries) {
      const expansions = expandQuery(q);
      const matchesIndex = expansions.some((term) =>
        indexText.includes(term),
      );
      expect(
        matchesIndex,
        `query "${q}" expanded to [${expansions.join(", ")}] but none matched index text "${indexText}"`,
      ).toBe(true);
    }
  });
});

describe("expandQuery", () => {
  it("expands samsung -> سامسونج (Latin to Arabic)", () => {
    const expanded = expandQuery("samsung");
    expect(expanded).toContain(normalizeArabic("سامسونج", { stripAl: false }));
  });

  it("expands سامسونج -> samsung (Arabic to Latin)", () => {
    const expanded = expandQuery("سامسونج");
    expect(expanded).toContain("samsung");
  });

  it("both directions round-trip for samsung", () => {
    const fromLatin = expandQuery("samsung");
    const fromArabic = expandQuery("سامسونج");
    expect(fromLatin.some((t) => fromArabic.includes(t) || t === "samsung")).toBe(
      true,
    );
    // The Arabic query's expansion must include the canonical Latin term.
    expect(fromArabic).toContain("samsung");
    // The Latin query's expansion must include at least one Arabic spelling.
    expect(
      fromLatin.some((t) =>
        (TRANSLITERATIONS.samsung ?? [])
          .map((f) => normalizeArabic(f, { stripAl: false }))
          .includes(t),
      ),
    ).toBe(true);
  });

  it("always includes the normalized original query first", () => {
    const expanded = expandQuery("iphone");
    expect(expanded[0]).toBe("iphone");
  });

  it("returns an empty array for empty/whitespace-only input without throwing", () => {
    expect(() => expandQuery("")).not.toThrow();
    expect(expandQuery("")).toEqual([]);
    expect(() => expandQuery("   ")).not.toThrow();
    expect(expandQuery("   ")).toEqual([]);
  });

  it("handles multi-word queries, expanding recognized words individually", () => {
    const expanded = expandQuery("samsung charger");
    expect(expanded).toContain(normalizeArabic("شاحن", { stripAl: false }));
    expect(expanded).toContain(normalizeArabic("سامسونج", { stripAl: false }));
  });
});

describe("buildSearchIndexText", () => {
  it("joins and normalizes multiple fields", () => {
    const text = buildSearchIndexText(["Samsung", "جوال", "SM-G991"]);
    expect(text).toContain("samsung");
    expect(text).toContain("جوال");
    expect(text).toContain("sm-g991");
  });

  it("appends cross-script expansions for recognized terms", () => {
    const text = buildSearchIndexText(["iPhone 15 Pro"]);
    expect(text).toContain(normalizeArabic("ايفون", { stripAl: false }));
  });

  it("does not throw and returns empty string for empty/blank fields", () => {
    expect(() => buildSearchIndexText([])).not.toThrow();
    expect(buildSearchIndexText([])).toBe("");
    expect(() => buildSearchIndexText(["", "  "])).not.toThrow();
    expect(buildSearchIndexText(["", "  "])).toBe("");
  });

  it("skips undefined/null-ish falsy fields gracefully", () => {
    // @ts-expect-error deliberately passing a bad value to check runtime safety
    const text = buildSearchIndexText(["Samsung", undefined, "case"]);
    expect(text).toContain("samsung");
  });
});

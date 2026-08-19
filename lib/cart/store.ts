'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * The cart.
 *
 * Lines carry a denormalised snapshot of the product (title, sku, price, image)
 * rather than only an id. Two reasons: the cart drawer must render instantly
 * without a round trip, and a price that changes mid-session should not
 * silently change what the customer thought they were buying. The server
 * re-prices everything at checkout anyway — see the checkout action — so this
 * snapshot is a UI convenience, never the source of truth for money.
 *
 * Persisted to localStorage so the cart survives a reload, which is the stated
 * acceptance criterion.
 */

export type CartLine = {
  productId: string;
  slug: string;
  sku: string;
  titleAr: string;
  titleEn: string;
  unitPriceFils: number;
  compareAtPriceFils: number | null;
  image: string;
  quantity: number;
  /** Snapshot of stock at add-time, so the drawer can warn before checkout. */
  maxQuantity: number;
};

type CartState = {
  lines: CartLine[];
  /** Drawer visibility lives here so any component can open the cart. */
  isOpen: boolean;
  /** False until zustand/persist has rehydrated — guards against SSR mismatch. */
  hydrated: boolean;

  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setHydrated: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      hydrated: false,

      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            // Adding an item already in the cart tops up rather than duplicating,
            // and never exceeds the stock we knew about.
            const next = Math.min(existing.quantity + quantity, line.maxQuantity);
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId ? { ...l, quantity: next } : l,
              ),
              isOpen: true,
            };
          }
          return {
            lines: [
              ...state.lines,
              { ...line, quantity: Math.min(quantity, line.maxQuantity) },
            ],
            isOpen: true,
          };
        }),

      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId
                    ? { ...l, quantity: Math.min(quantity, l.maxQuantity) }
                    : l,
                ),
        })),

      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'roze-cart',
      storage: createJSONStorage(() => localStorage),
      // `isOpen` and `hydrated` are session UI state, not cart contents.
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/* ---- Derived selectors. Money stays integer fils throughout. ------------- */

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.quantity, 0);

export const cartSubtotalFils = (lines: CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.unitPriceFils * l.quantity, 0);

/**
 * Delivery.
 *
 * Flat 3 JOD inside Amman-area delivery, free over 100 JOD. This is a
 * placeholder commercial rule, NOT a confirmed client policy — it is isolated
 * here so the client can set the real numbers in one place. Flagged in HANDOFF.md.
 */
export const FREE_SHIPPING_THRESHOLD_FILS = 100_000;
export const FLAT_SHIPPING_FILS = 3_000;

export const cartShippingFils = (subtotalFils: number): number =>
  subtotalFils === 0 || subtotalFils >= FREE_SHIPPING_THRESHOLD_FILS
    ? 0
    : FLAT_SHIPPING_FILS;

"use client";

import { useMemo } from "react";
import { priceCart, type CartTotals } from "@/lib/pricing";
import { useCartStore } from "@/lib/stores/cart";
import { useShopFormulas } from "@/lib/stores/catalog";

/** Krepšelio sumos visada skaičiuojamos iš gyvo katalogo (niekada iš išsaugotų kainų). */
export function useCartTotals(): CartTotals {
  const lines = useCartStore((s) => s.lines);
  const formulas = useShopFormulas();
  return useMemo(() => priceCart(lines, formulas), [lines, formulas]);
}

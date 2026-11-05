"use client";

import { useShopFormulas } from "@/lib/stores/catalog";
import { useConsoleStore } from "@/lib/stores/ui";
import type { Formula } from "@/lib/types";

/** Konsolėje pasirinkta formulė (arba pirma aktyvi, jei pasirinktoji pašalinta). */
export function useActiveFormula(): Formula | null {
  const formulas = useShopFormulas();
  const id = useConsoleStore((s) => s.formulaId);
  return formulas.find((f) => f.id === id) ?? formulas[0] ?? null;
}

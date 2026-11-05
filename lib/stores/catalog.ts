import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_FORMULAS } from "../seed";
import { persistStorage, STORAGE_KEYS } from "../storage";
import type { Formula, NodeId, Variant } from "../types";

/**
 * Katalogo saugykla.
 * `formulas === null` reiškia „naudojamas kodo viduje esantis seed“ – taip lankytojai visada mato
 * naujausią diegimo versiją, o admino pakeitimai išsaugomi tik tada, kai jie tikrai atlikti.
 *
 * DĖMESIO: saugoma naršyklės localStorage. Norint, kad pakeitimus matytų visi lankytojai,
 * reikia pakeisti šią saugyklą duomenų baze (žr. README → „Duomenų bazė“).
 */
interface CatalogState {
  formulas: Formula[] | null;
  upsert: (formula: Formula) => void;
  remove: (id: string) => void;
  restore: (formula: Formula, index: number) => void;
  patchVariant: (id: string, node: NodeId, patch: Partial<Variant>) => void;
  reset: () => void;
}

const base = (s: CatalogState): Formula[] => s.formulas ?? SEED_FORMULAS;

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      formulas: null,
      upsert: (formula) =>
        set((s) => {
          const list = base(s);
          const stamped = { ...formula, updatedAt: Date.now() };
          const exists = list.some((f) => f.id === formula.id);
          return { formulas: exists ? list.map((f) => (f.id === formula.id ? stamped : f)) : [...list, stamped] };
        }),
      remove: (id) => set((s) => ({ formulas: base(s).filter((f) => f.id !== id) })),
      restore: (formula, index) =>
        set((s) => {
          const list = base(s).slice();
          list.splice(Math.min(index, list.length), 0, formula);
          return { formulas: list };
        }),
      patchVariant: (id, node, patch) =>
        set((s) => ({
          formulas: base(s).map((f) =>
            f.id === id
              ? { ...f, updatedAt: Date.now(), variants: { ...f.variants, [node]: { ...f.variants[node], ...patch } } }
              : f,
          ),
        })),
      reset: () => set({ formulas: null }),
    }),
    {
      name: STORAGE_KEYS.catalog,
      version: 1,
      storage: persistStorage,
      skipHydration: true,
      partialize: (s) => ({ formulas: s.formulas }),
      merge: (persisted, current) => {
        const raw = (persisted as { formulas?: unknown } | undefined)?.formulas;
        return { ...current, formulas: Array.isArray(raw) && raw.length > 0 ? (raw as Formula[]) : null };
      },
    },
  ),
);

/** Visas katalogas (įskaitant paslėptas formules) – admin. */
export function useAllFormulas(): Formula[] {
  const custom = useCatalogStore((s) => s.formulas);
  return custom ?? SEED_FORMULAS;
}

/** Tik aktyvios formulės – parduotuvė. */
export function useShopFormulas(): Formula[] {
  const all = useAllFormulas();
  // Stabili nuoroda: filtruojame tik kai pasikeičia šaltinis.
  return filterActive(all);
}

const activeCache = new WeakMap<Formula[], Formula[]>();
function filterActive(list: Formula[]): Formula[] {
  const hit = activeCache.get(list);
  if (hit) return hit;
  const next = list.filter((f) => f.active);
  activeCache.set(list, next);
  return next;
}

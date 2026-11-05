import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMMERCE } from "../config";
import { clamp } from "../format";
import { persistStorage, STORAGE_KEYS } from "../storage";
import { NODE_IDS, type CartLine, type NodeId } from "../types";

interface CartState {
  lines: CartLine[];
  add: (formulaId: string, node: NodeId, qty?: number) => void;
  addMany: (formulaId: string, nodes: readonly NodeId[]) => void;
  setQty: (formulaId: string, node: NodeId, qty: number) => void;
  remove: (formulaId: string, node: NodeId) => void;
  clear: () => void;
}

const MAX = COMMERCE.maxQtyPerLine;

function upsert(lines: CartLine[], formulaId: string, node: NodeId, qty: number): CartLine[] {
  const idx = lines.findIndex((l) => l.formulaId === formulaId && l.node === node);
  if (idx === -1) return [...lines, { formulaId, node, qty: clamp(qty, 1, MAX) }];
  const next = lines.slice();
  next[idx] = { ...next[idx], qty: clamp(next[idx].qty + qty, 1, MAX) };
  return next;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (formulaId, node, qty = 1) => set((s) => ({ lines: upsert(s.lines, formulaId, node, qty) })),
      addMany: (formulaId, nodes) =>
        set((s) => ({ lines: nodes.reduce((acc, n) => upsert(acc, formulaId, n, 1), s.lines) })),
      setQty: (formulaId, node, qty) =>
        set((s) => ({
          lines:
            qty < 1
              ? s.lines.filter((l) => !(l.formulaId === formulaId && l.node === node))
              : s.lines.map((l) =>
                  l.formulaId === formulaId && l.node === node ? { ...l, qty: clamp(qty, 1, MAX) } : l,
                ),
        })),
      remove: (formulaId, node) =>
        set((s) => ({ lines: s.lines.filter((l) => !(l.formulaId === formulaId && l.node === node)) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: STORAGE_KEYS.cart,
      version: 1,
      storage: persistStorage,
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines }),
      // Apsauga nuo sugadintų / pasenusių įrašų.
      merge: (persisted, current) => {
        const raw = (persisted as { lines?: unknown } | undefined)?.lines;
        const lines = Array.isArray(raw)
          ? (raw as CartLine[]).filter(
              (l) =>
                l &&
                typeof l.formulaId === "string" &&
                NODE_IDS.includes(l.node) &&
                Number.isFinite(l.qty) &&
                l.qty > 0,
            )
          : [];
        return { ...current, lines };
      },
    },
  ),
);

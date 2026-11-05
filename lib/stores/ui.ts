import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "../format";
import { persistStorage, STORAGE_KEYS } from "../storage";
import { NODE_IDS, type NodeId } from "../types";

/* ── Laikina UI būsena (nesaugoma) ─────────────────────────────────────────── */

export type CartStep = "cart" | "checkout" | "done";

export interface Toast {
  id: string;
  message: string;
  action?: { label: string; run: () => void };
  ttl: number;
}

interface UIState {
  hydrated: boolean;
  menuOpen: boolean;
  cartOpen: boolean;
  cartStep: CartStep;
  lastOrderId: string | null;
  /** Didėja, kai dalelės pasiekia krepšelio juostą – pulsavimo signalas */
  pulse: number;
  toasts: Toast[];
  setHydrated: () => void;
  setMenu: (open: boolean) => void;
  openCart: (step?: CartStep) => void;
  closeCart: () => void;
  setCartStep: (step: CartStep, orderId?: string | null) => void;
  bumpPulse: () => void;
  toast: (message: string, action?: Toast["action"], ttl?: number) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  hydrated: false,
  menuOpen: false,
  cartOpen: false,
  cartStep: "cart",
  lastOrderId: null,
  pulse: 0,
  toasts: [],
  setHydrated: () => set({ hydrated: true }),
  setMenu: (menuOpen) => set((s) => ({ menuOpen, cartOpen: menuOpen ? false : s.cartOpen })),
  openCart: (step) =>
    set((s) => ({ cartOpen: true, menuOpen: false, cartStep: step ?? (s.cartStep === "done" ? "cart" : s.cartStep) })),
  closeCart: () => set({ cartOpen: false }),
  setCartStep: (cartStep, orderId) =>
    set((s) => ({ cartStep, lastOrderId: orderId === undefined ? s.lastOrderId : orderId })),
  bumpPulse: () => set((s) => ({ pulse: s.pulse + 1 })),
  toast: (message, action, ttl = 4200) =>
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id: uid(), message, action, ttl }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/* ── Konsolės būsena (nesaugoma – deterministiškas pirmas piešimas) ─────────── */

interface ConsoleState {
  node: NodeId;
  formulaId: string;
  included: Record<NodeId, boolean>;
  setNode: (node: NodeId) => void;
  setFormula: (id: string) => void;
  toggle: (node: NodeId) => void;
}

export const useConsoleStore = create<ConsoleState>()((set) => ({
  node: "zmogui",
  formulaId: "f-540",
  included: { zmogui: true, masinai: true, namams: true },
  // Pasirinktas mazgas visada įtraukiamas, o kiti automatiškai sinchronizuojami.
  setNode: (node) => set((s) => ({ node, included: { ...s.included, [node]: true } })),
  setFormula: (formulaId) => set({ formulaId }),
  toggle: (node) =>
    set((s) => {
      if (node === s.node) return s;
      return { included: { ...s.included, [node]: !s.included[node] } };
    }),
}));

export const includedNodes = (included: Record<NodeId, boolean>): NodeId[] =>
  NODE_IDS.filter((n) => included[n]);

/* ── Vartotojo nuostatos (saugomos) ─────────────────────────────────────────── */

interface PrefsState {
  reduceMotion: boolean;
  haptics: boolean;
  setReduceMotion: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      reduceMotion: false,
      haptics: true,
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHaptics: (haptics) => set({ haptics }),
    }),
    {
      name: STORAGE_KEYS.prefs,
      version: 1,
      storage: persistStorage,
      skipHydration: true,
      partialize: (s) => ({ reduceMotion: s.reduceMotion, haptics: s.haptics }),
    },
  ),
);

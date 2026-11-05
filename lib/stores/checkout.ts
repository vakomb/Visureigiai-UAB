import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage, STORAGE_KEYS } from "../storage";
import { EMPTY_CHECKOUT, type CheckoutValues } from "../validation";

/** Išmanus užsakymo formos prisiminimas – grįžęs klientas neperrašinėja duomenų. Sutikimas niekada neišsaugomas. */
interface CheckoutState {
  values: CheckoutValues;
  set: (patch: Partial<CheckoutValues>) => void;
  clearSensitive: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      values: EMPTY_CHECKOUT,
      set: (patch) => set((s) => ({ values: { ...s.values, ...patch } })),
      clearSensitive: () => set({ values: EMPTY_CHECKOUT }),
    }),
    {
      name: STORAGE_KEYS.checkout,
      version: 1,
      storage: persistStorage,
      skipHydration: true,
      partialize: (s) => ({ values: { ...s.values, accept: false, note: "" } }),
      merge: (persisted, current) => {
        const v = (persisted as { values?: Partial<CheckoutValues> } | undefined)?.values;
        return { ...current, values: { ...EMPTY_CHECKOUT, ...(v ?? {}), accept: false } };
      },
    },
  ),
);

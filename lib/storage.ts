import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Saugi localStorage apvalkalas: veikia privačiame režime, kai saugykla užblokuota,
 * ir niekada nemeta klaidų (krepšelis tiesiog lieka atmintyje).
 */
const memory = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  },
};

export const persistStorage = createJSONStorage(() => safeStorage);

export const STORAGE_KEYS = {
  cart: "vaidore:cart:v1",
  catalog: "vaidore:catalog:v1",
  orders: "vaidore:orders:v1",
  checkout: "vaidore:checkout:v1",
  prefs: "vaidore:prefs:v1",
} as const;

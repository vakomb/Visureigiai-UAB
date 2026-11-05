"use client";

import { useEffect, useLayoutEffect } from "react";
import { useCartStore } from "@/lib/stores/cart";
import { useCatalogStore } from "@/lib/stores/catalog";
import { useCheckoutStore } from "@/lib/stores/checkout";
import { useOrdersStore } from "@/lib/stores/orders";
import { usePrefsStore, useUIStore } from "@/lib/stores/ui";
import { STORAGE_KEYS } from "@/lib/storage";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BY_KEY: Record<string, { persist: { rehydrate: () => Promise<void> | void } }> = {
  [STORAGE_KEYS.cart]: useCartStore,
  [STORAGE_KEYS.catalog]: useCatalogStore,
  [STORAGE_KEYS.orders]: useOrdersStore,
  [STORAGE_KEYS.checkout]: useCheckoutStore,
  [STORAGE_KEYS.prefs]: usePrefsStore,
};

/**
 * Išsaugotos būsenos (krepšelis, nuostatos, katalogo pakeitimai) įkeliamos prieš pirmą piešimą,
 * o skirtingi naršyklės skirtukai sinchronizuojami per `storage` įvykį.
 */
export function StoreHydrator() {
  useIsoLayoutEffect(() => {
    Object.values(BY_KEY).forEach((store) => {
      void store.persist.rehydrate();
    });
    useUIStore.getState().setHydrated();

    const onStorage = (e: StorageEvent) => {
      if (e.key && BY_KEY[e.key]) void BY_KEY[e.key].persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}

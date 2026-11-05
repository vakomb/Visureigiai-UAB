"use client";

import { useReducedMotion } from "framer-motion";
import { usePrefsStore } from "@/lib/stores/ui";

/** Judesys sumažinamas, jei to nori sistema arba vartotojas (meniu nustatymuose). */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const user = usePrefsStore((s) => s.reduceMotion);
  return Boolean(system) || user;
}

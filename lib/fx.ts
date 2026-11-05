import { usePrefsStore } from "./stores/ui";

/** Lengvas įvykių kanalas: mygtukas → dalelių sluoksnis. */
export interface BurstDetail {
  from: { x: number; y: number };
  color: string;
}

type Listener = (burst: BurstDetail) => void;
const listeners = new Set<Listener>();

export function onBurst(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** „Cart Injection Hook“: iš elemento centro paleidžia dalelių srautą į apatinę krepšelio juostą. */
export function burstFrom(el: Element | null, color = "#0a0a0b") {
  if (!el || typeof window === "undefined") return;
  const r = el.getBoundingClientRect();
  const detail: BurstDetail = { from: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, color };
  listeners.forEach((fn) => fn(detail));
}

/** Trumpas haptinis atsakas (Android / palaikančios naršyklės). */
export function haptic(ms = 8) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (!usePrefsStore.getState().haptics) return;
  try {
    navigator.vibrate(ms);
  } catch {
    /* ignoruojame */
  }
}

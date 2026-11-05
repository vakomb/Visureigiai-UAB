import type { Transition } from "framer-motion";

/**
 * Fizikos „parašai“. Pagrindinė taktilinė spyruoklė – pagal specifikaciją:
 * stiffness 220 · damping 14 · mass 0.3.
 */
export const SPRING_TACTILE: Transition = { type: "spring", stiffness: 220, damping: 14, mass: 0.3 };

/** Meniu / iššokantys skydai – stiffness 300 · damping 15. */
export const SPRING_PANEL: Transition = { type: "spring", stiffness: 300, damping: 15 };

/** Ekrano krašto skydai (krepšelis): tvirtas, vos juntamas perlenkimas. */
export const SPRING_EDGE: Transition = { type: "spring", stiffness: 320, damping: 30, mass: 0.9 };

/** Minkšta, inercinė – 3D sukimui ir morfinimui. */
export const SPRING_SOFT = { stiffness: 120, damping: 18, mass: 0.7 } as const;

/** Skaičių „count-up“ be pernelyg didelio perlenkimo. */
export const SPRING_NUMBER = { stiffness: 180, damping: 26, mass: 0.4 } as const;

/** Bendri gestų atsakai: kiekvienas paspaudimas turi fizinį svorį. */
export const TAP = {
  whileTap: { scale: 0.94 },
  whileHover: { scale: 1.02 },
  transition: SPRING_TACTILE,
} as const;

export const TAP_SOFT = {
  whileTap: { scale: 0.97 },
  transition: SPRING_TACTILE,
} as const;

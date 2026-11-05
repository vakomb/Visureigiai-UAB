"use client";

import { useEffect, useState } from "react";

/**
 * Grąžina dabartinį laiką tik po hidratacijos (iki tol – null), todėl serverio ir kliento HTML sutampa
 * ir neįvyksta hidratacijos neatitikimų.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cx } from "@/lib/format";
import { SPRING_NUMBER } from "@/lib/motion";

/**
 * Skaičius, kuris „įsisuka“ į naują reikšmę. Naudoja tabular-nums, todėl plotis nesikeičia (CLS = 0).
 * Pirmas piešimas visada rodo tikslią reikšmę – serverio ir kliento HTML sutampa.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const source = useMotionValue(value);
  const spring = useSpring(source, SPRING_NUMBER);
  const text = useTransform(spring, (v) => format(v));

  useEffect(() => {
    source.set(value);
  }, [source, value]);

  return <motion.span className={cx("tabular-nums", className)}>{text}</motion.span>;
}

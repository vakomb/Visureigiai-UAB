"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReduceMotion } from "@/hooks/useMotionPref";

/** Elementas švelniai „išplaukia“ į vietą, kai patenka į ekraną (tik žemiau pirmo ekrano). */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReduceMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ type: "spring", stiffness: 110, damping: 20, mass: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

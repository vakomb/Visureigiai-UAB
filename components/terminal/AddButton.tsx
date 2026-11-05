"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { IconCheck, IconPlus } from "@/components/ui/Icon";
import { PROFILE_STYLE, T } from "@/lib/copy";
import { cx } from "@/lib/format";
import { burstFrom, haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useUIStore } from "@/lib/stores/ui";
import type { Formula, NodeId } from "@/lib/types";

/**
 * „Cart Injection Hook“: akimirksniu įdeda į krepšelį (be tinklo užklausos),
 * paleidžia dalelių srautą į apatinę juostą ir suteikia fizinį paspaudimo pojūtį.
 */
export function AddButton({ formula, node, className }: { formula: Formula; node: NodeId; className?: string }) {
  const add = useCartStore((s) => s.add);
  const cartOpen = useUIStore((s) => s.cartOpen);
  const ref = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(0);
  const [done, setDone] = useState(false);
  const soldOut = formula.variants[node].stock <= 0;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = () => {
    if (soldOut) return;
    add(formula.id, node, 1);
    haptic(10);
    if (!cartOpen) burstFrom(ref.current, PROFILE_STYLE[formula.profile].dot);
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1100);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={soldOut}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      transition={SPRING_TACTILE}
      aria-label={`${T.terminal.add}: ${formula.name}`}
      className={cx(
        "flex h-11 w-[124px] shrink-0 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors duration-300",
        soldOut ? "bg-black/5 text-ink/40" : done ? "bg-emerald-600 text-white" : "bg-ink text-white",
        className,
      )}
    >
      {soldOut ? (
        "Išparduota"
      ) : done ? (
        <>
          <IconCheck size={16} /> {T.terminal.added}
        </>
      ) : (
        <>
          <IconPlus size={16} /> {T.terminal.add}
        </>
      )}
    </motion.button>
  );
}

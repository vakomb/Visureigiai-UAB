"use client";

import { motion } from "framer-motion";
import { PROFILE_STYLE } from "@/lib/copy";
import { haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { useShopFormulas } from "@/lib/stores/catalog";
import { useConsoleStore } from "@/lib/stores/ui";
import { useActiveFormula } from "./useActive";

/** Formulės pasirinkimas – horizontali juosta; aktyvi formulė „plūsta“ su spyruokle. */
export function FormulaPicker() {
  const formulas = useShopFormulas();
  const active = useActiveFormula();
  const setFormula = useConsoleStore((s) => s.setFormula);

  return (
    <div
      role="radiogroup"
      aria-label="Formulė"
      className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {formulas.map((f) => {
        const on = f.id === active?.id;
        return (
          <motion.button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              haptic(6);
              setFormula(f.id);
            }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_TACTILE}
            className="relative h-12 shrink-0 snap-start rounded-2xl px-4 text-left"
          >
            {on ? (
              <motion.span
                layoutId="formula-pill"
                transition={SPRING_TACTILE}
                className="absolute inset-0 rounded-2xl bg-ink"
              />
            ) : (
              <span className="absolute inset-0 rounded-2xl border border-black/10 bg-white" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PROFILE_STYLE[f.profile].dot, boxShadow: on ? `0 0 0 2px #fff3` : undefined }}
              />
              <span className="leading-tight">
                <span className={`block font-mono text-[11px] tracking-wider ${on ? "text-white/60" : "text-ink/45"}`}>
                  {f.code}
                </span>
                <span className={`block text-[13px] font-medium ${on ? "text-white" : "text-ink"}`}>
                  {f.name.replace("Vaidore ", "")}
                </span>
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

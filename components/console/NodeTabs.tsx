"use client";

import { motion } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { NodeIcon } from "@/components/ui/Icon";
import { NODES, T } from "@/lib/copy";
import { eur } from "@/lib/format";
import { haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { useConsoleStore } from "@/lib/stores/ui";
import { NODE_IDS, type NodeId } from "@/lib/types";
import { useActiveFormula } from "./useActive";

/** Trijų mazgų jungiklis: [ ŽMOGUI ] | [ MAŠINAI ] | [ NAMAMS ] – aktyvi tabletė „plūsta“ tarp mazgų. */
export function NodeTabs() {
  const node = useConsoleStore((s) => s.node);
  const setNode = useConsoleStore((s) => s.setNode);
  const formula = useActiveFormula();
  const refs = useRef<Partial<Record<NodeId, HTMLButtonElement | null>>>({});

  const select = (id: NodeId) => {
    if (id === node) return;
    haptic(6);
    setNode(id);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const i = NODE_IDS.indexOf(node);
    let next: NodeId | null = null;
    if (e.key === "ArrowRight") next = NODE_IDS[(i + 1) % NODE_IDS.length];
    if (e.key === "ArrowLeft") next = NODE_IDS[(i + NODE_IDS.length - 1) % NODE_IDS.length];
    if (e.key === "Home") next = NODE_IDS[0];
    if (e.key === "End") next = NODE_IDS[NODE_IDS.length - 1];
    if (next) {
      e.preventDefault();
      select(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={T.tabs.aria}
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 gap-1 rounded-[24px] bg-black/[0.045] p-1.5"
    >
      {NODE_IDS.map((id) => {
        const active = id === node;
        return (
          <motion.button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={active}
            aria-controls="node-panel"
            tabIndex={active ? 0 : -1}
            onClick={() => select(id)}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_TACTILE}
            className="relative flex h-[64px] flex-col items-center justify-center gap-0.5 rounded-[18px] outline-offset-2"
          >
            {active && (
              <motion.span
                layoutId="node-pill"
                transition={SPRING_TACTILE}
                className="absolute inset-0 rounded-[18px] bg-white shadow-[0_6px_18px_-6px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.04)]"
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.1em] transition-colors sm:gap-2 sm:text-[13px] sm:tracking-[0.14em] ${
                active ? "text-ink" : "text-ink/50"
              }`}
            >
              <NodeIcon node={id} size={17} />
              {NODES[id].label}
            </span>
            <span className="relative z-10 text-[11px] tabular-nums text-ink/45">
              {formula ? `nuo ${eur(formula.variants[id].priceCents)}` : " "}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

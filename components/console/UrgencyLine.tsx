"use client";

import { useMemo } from "react";
import { useNow } from "@/hooks/useNow";
import { IconTruck } from "@/components/ui/Icon";
import { COMMERCE } from "@/lib/config";
import { NODES, T } from "@/lib/copy";
import { formatCountdown, getDeliveryEstimate } from "@/lib/delivery";
import { cx } from "@/lib/format";
import type { Formula, NodeId } from "@/lib/types";

/**
 * Tikras (ne dirbtinis) skubumas: išsiuntimo laiko skaičiuoklė ir tikri likučiai.
 * Rezervuota fiksuota 44 px vieta, todėl išdėstymas niekada nešoka.
 */
export function UrgencyLine({
  formula,
  nodes,
  dark = false,
}: {
  formula: Formula;
  nodes: readonly NodeId[];
  dark?: boolean;
}) {
  const now = useNow(1000);
  const estimate = useMemo(() => (now ? getDeliveryEstimate("vilnius", now) : null), [now]);

  const low = nodes
    .map((n) => ({ n, stock: formula.variants[n].stock }))
    .filter((x) => x.stock > 0 && x.stock <= COMMERCE.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)[0];

  let ship = `Siuntų išsiuntimas darbo dienomis iki ${COMMERCE.dispatchCutoffHour}:00`;
  if (estimate) {
    ship =
      estimate.msToCutoff !== null
        ? T.urgency.cutoff(formatCountdown(estimate.msToCutoff))
        : T.urgency.nextDispatch(estimate.dispatchLabel);
  }

  return (
    <div
      className={cx(
        "flex h-11 flex-col justify-center gap-0.5 text-[12.5px] transition-colors duration-500",
        dark ? "text-white/65" : "text-ink/60",
      )}
    >
      <p className="flex items-center gap-1.5">
        <IconTruck size={15} className="shrink-0" />
        <span className="truncate tabular-nums">{ship}</span>
      </p>
      <p
        className={cx(
          "flex items-center gap-1.5 font-medium",
          dark ? "text-rose-300" : "text-crimson",
          low ? "opacity-100" : "opacity-0",
        )}
      >
        <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", dark ? "bg-rose-300" : "bg-crimson")} />
        <span className="truncate">{low ? T.urgency.low(NODES[low.n].label, low.stock) : " "}</span>
      </p>
    </div>
  );
}

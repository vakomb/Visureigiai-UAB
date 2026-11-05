"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useReduceMotion } from "@/hooks/useMotionPref";
import { IconTruck } from "@/components/ui/Icon";
import { T } from "@/lib/copy";
import { CITIES, getDeliveryEstimate } from "@/lib/delivery";
import { cx } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";

/**
 * Progresyvus pristatymo kelio sekimas.
 * `stage` 0–3 = realus užsakymo etapas; `predicted` = prognozė prieš užsakant (sunkvežimis važinėja per visą kelią).
 */
export function LogisticsTracker({
  stage,
  cityId,
  onCityChange,
  predicted = false,
  canceled = false,
}: {
  stage: number;
  cityId: string;
  onCityChange?: (id: string) => void;
  predicted?: boolean;
  canceled?: boolean;
}) {
  const reduce = useReduceMotion();
  const estimate = useMemo(() => getDeliveryEstimate(cityId), [cityId]);
  const pct = (Math.min(Math.max(stage, 0), 3) / 3) * 100;
  const label = canceled ? "Užsakymas atšauktas" : stage >= 2 && !predicted ? T.tracker.steps[2] : null;

  return (
    <section aria-label={T.tracker.title} className="rounded-3xl border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{T.tracker.title}</p>
        {onCityChange ? (
          <label className="flex items-center gap-2 text-[12px] text-ink/55">
            <span className="sr-only">{T.tracker.city}</span>
            <select
              value={cityId}
              onChange={(e) => onCityChange(e.target.value)}
              className="h-8 rounded-full border border-black/10 bg-white px-3 text-[13px] font-medium text-ink outline-none focus:border-ink"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="text-[12px] font-medium text-ink/60">{estimate.city.label}</span>
        )}
      </div>

      {/* Kelio linija */}
      <div className="mx-[12.5%] mt-6 h-[3px] rounded-full bg-black/10">
        <div className="relative h-full">
          <motion.div
            className={cx("absolute inset-y-0 left-0 rounded-full", canceled ? "bg-rose-400" : "bg-ink")}
            initial={false}
            animate={{ width: predicted ? "100%" : `${pct}%` }}
            transition={SPRING_TACTILE}
            style={predicted ? { opacity: 0.18 } : undefined}
          />
          <motion.div
            className="absolute -top-[13px] -ml-4 grid h-8 w-8 place-items-center rounded-full bg-ink text-white shadow-lg"
            initial={false}
            animate={
              predicted && !reduce
                ? { left: ["0%", "100%"] }
                : { left: `${predicted ? 0 : pct}%` }
            }
            transition={
              predicted && !reduce
                ? { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
                : SPRING_TACTILE
            }
          >
            <IconTruck size={16} />
          </motion.div>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-4 text-center">
        {T.tracker.short.map((s, i) => {
          const done = !predicted && i <= stage && !canceled;
          return (
            <li key={s} className={cx("px-0.5 text-[11px] leading-tight", done ? "font-semibold text-ink" : "text-ink/40")}>
              {s}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 space-y-1 rounded-2xl bg-black/[0.035] px-3.5 py-3 text-[13px]">
        {label && <p className="font-semibold">{label}</p>}
        <p className="flex justify-between gap-3">
          <span className="text-ink/55">{T.tracker.dispatch}</span>
          <span className="text-right font-medium">{estimate.dispatchLabel}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-ink/55">{T.tracker.eta}</span>
          <span className="text-right font-medium first-letter:uppercase">{estimate.deliveryLabel}</span>
        </p>
      </div>
    </section>
  );
}

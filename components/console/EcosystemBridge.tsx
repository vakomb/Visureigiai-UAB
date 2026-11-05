"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { useReduceMotion } from "@/hooks/useMotionPref";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { IconCheck, IconLock, NodeIcon } from "@/components/ui/Icon";
import { COMMERCE } from "@/lib/config";
import { NODES, PROFILE_STYLE, T } from "@/lib/copy";
import { cx, eur } from "@/lib/format";
import { burstFrom, haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { priceSelection, setDiscountCents } from "@/lib/pricing";
import { useCartStore } from "@/lib/stores/cart";
import { includedNodes, useConsoleStore, useUIStore } from "@/lib/stores/ui";
import { NODE_IDS, type Formula, type NodeId } from "@/lib/types";
import { UrgencyLine } from "./UrgencyLine";

/** Prievadų x koordinatės SVG erdvėje (viewBox 300 plotio, 3 vienodos kolonos). */
const PORT_X: Record<NodeId, number> = { zmogui: 50, masinai: 150, namams: 250 };

const link = (a: NodeId, b: NodeId) => `M ${PORT_X[a]} 0 C ${PORT_X[a]} 40, ${PORT_X[b]} 40, ${PORT_X[b]} 0`;

/**
 * Ekosistemos sinchronizacijos tiltas.
 * Pasirinktas mazgas „iššauna“ švytinčias linijas į kitus; kai visi trys sutampa, blokas
 * virsta vieninteliu veiksmo mazgu su −20 % tęstinumo atlygiu.
 */
export function EcosystemBridge({ formula, node }: { formula: Formula; node: NodeId }) {
  const reduce = useReduceMotion();
  const included = useConsoleStore((s) => s.included);
  const toggle = useConsoleStore((s) => s.toggle);
  const addMany = useCartStore((s) => s.addMany);
  const openCart = useUIStore((s) => s.openCart);
  const toast = useUIStore((s) => s.toast);
  const btnRef = useRef<HTMLButtonElement>(null);
  const morph = useAnimationControls();
  const wasComplete = useRef(false);

  const nodes = includedNodes(included);
  const priced = priceSelection(formula, nodes);
  const complete = priced.complete;
  const missing = NODE_IDS.filter((n) => !included[n]);
  const profile = PROFILE_STYLE[formula.profile];
  const soldOut = nodes.some((n) => formula.variants[n].stock <= 0);
  const pct = Math.round(COMMERCE.bundleRate * 100);
  const freeShip = priced.totalCents >= COMMERCE.freeShippingOverCents;
  const potentialSaving = setDiscountCents(formula);

  const order = () => {
    if (soldOut) return;
    burstFrom(btnRef.current, complete ? "#ffffff" : profile.dot);
    haptic(complete ? 16 : 10);
    addMany(formula.id, nodes);
    if (complete) {
      window.setTimeout(() => openCart("cart"), 520);
    } else {
      toast(`Įdėta: ${formula.code} · ${nodes.map((n) => NODES[n].label).join(" + ")}`);
    }
  };

  // Kai trys mazgai susijungia, blokas „įsitempia“ į vieną veiksmo mazgą.
  useEffect(() => {
    if (complete && !wasComplete.current && !reduce) {
      morph.set({ scale: 0.982 });
      morph.start({ scale: 1, transition: SPRING_TACTILE });
    }
    wasComplete.current = complete;
  }, [complete, morph, reduce]);

  const muted = complete ? "text-white/55" : "text-ink/50";

  return (
    <section aria-label={T.bridge.title} className="flex flex-col gap-3">
      {/* Prievadai */}
      <div>
        <div className="grid grid-cols-3 gap-2">
          {NODE_IDS.map((id) => {
            const on = included[id];
            const primary = id === node;
            return (
              <motion.button
                key={id}
                type="button"
                aria-pressed={on}
                disabled={primary}
                onClick={() => {
                  haptic(6);
                  toggle(id);
                }}
                whileTap={primary ? undefined : { scale: 0.93 }}
                transition={SPRING_TACTILE}
                className={cx(
                  "relative flex h-[118px] flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 text-center transition-colors duration-300",
                  on ? "border-ink bg-white" : "border-dashed border-black/20 bg-black/[0.025]",
                  primary && "cursor-default",
                )}
              >
                <span
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-full transition-colors duration-300",
                    on ? "bg-ink text-white" : "bg-black/5 text-ink/45",
                  )}
                >
                  <NodeIcon node={id} size={18} />
                </span>
                <span className="text-[11px] font-semibold tracking-[0.12em]">{NODES[id].label}</span>
                <span className="text-[11.5px] tabular-nums text-ink/55">{eur(formula.variants[id].priceCents)}</span>
                <span
                  className={cx(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    on ? "text-emerald-700" : "text-ink/40",
                  )}
                >
                  {primary ? T.bridge.primary : on ? T.bridge.included : `+ ${T.bridge.add}`}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Švytinčios 3D vektorinės jungtys */}
        <svg viewBox="0 0 300 44" preserveAspectRatio="none" className="h-11 w-full overflow-visible" aria-hidden>
          {NODE_IDS.filter((n) => n !== node).map((target) => {
            const on = included[target];
            const d = link(node, target);
            return (
              <g key={`${node}-${target}-${on ? 1 : 0}`}>
                <path
                  d={d}
                  fill="none"
                  stroke="rgb(10 10 11 / 0.16)"
                  strokeWidth={1.5}
                  strokeDasharray="3 6"
                  vectorEffect="non-scaling-stroke"
                />
                {on && (
                  <>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={profile.dot}
                      strokeWidth={2.25}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      style={{ filter: `drop-shadow(0 0 5px ${profile.dot})` }}
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {!reduce && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#fff"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeDasharray="2 16"
                        vectorEffect="non-scaling-stroke"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.95, strokeDashoffset: [0, -72] }}
                        transition={{
                          opacity: { delay: 0.6, duration: 0.3 },
                          strokeDashoffset: { duration: 1.8, repeat: Infinity, ease: "linear" },
                        }}
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vieningas veiksmo mazgas */}
      <motion.div
        className={cx(
          "relative overflow-hidden rounded-[28px] border p-4 transition-colors duration-500 sm:p-5",
          complete ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink",
        )}
        animate={morph}
      >
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl transition-opacity duration-700",
            complete ? "opacity-60" : "opacity-0",
          )}
          style={{ background: profile.lq1 }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold leading-tight">{T.bridge.reward}</p>
            <p className={cx("mt-1 max-w-[30ch] text-[12.5px] leading-snug", muted)}>{T.bridge.rewardSub}</p>
          </div>
          <span
            className={cx(
              "flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold tracking-wide",
              complete ? "bg-white text-ink" : "bg-black/5 text-ink/50",
            )}
          >
            {complete ? <IconCheck size={13} /> : <IconLock size={13} />}−{pct} %
          </span>
        </div>

        <div className="relative mt-4 space-y-0.5 text-[14px]">
          <div className="flex h-8 items-center justify-between">
            <span className={muted}>{T.bridge.setValue}</span>
            <AnimatedNumber
              value={priced.subtotalCents}
              format={(n) => eur(Math.round(n))}
              className={cx(complete && "text-white/55 line-through decoration-white/40")}
            />
          </div>
          <div className="flex h-8 items-center justify-between">
            <span className={muted}>{T.bridge.reward}</span>
            {complete ? (
              <span className="font-semibold text-emerald-300">
                −<AnimatedNumber value={priced.discountCents} format={(n) => eur(Math.round(n))} />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12.5px] text-ink/45">
                <IconLock size={13} /> −{pct} % sujungus visus
              </span>
            )}
          </div>
          <div className={cx("flex h-12 items-center justify-between border-t pt-1", complete ? "border-white/15" : "border-black/10")}>
            <span className="font-medium">{T.bridge.yourPrice}</span>
            <AnimatedNumber
              value={priced.totalCents}
              format={(n) => eur(Math.round(n))}
              className="font-mono text-[26px] font-medium tracking-tight"
            />
          </div>
        </div>

        {/* Nulinės trinties papildomas pardavimas */}
        <div className="relative mt-2 flex min-h-[84px] flex-col justify-center gap-2.5">
          {complete ? (
            <p className="flex items-center gap-2 text-[13px] text-white/80">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400 text-ink">
                <IconCheck size={13} />
              </span>
              {T.bridge.synced} · {formula.code}
            </p>
          ) : (
            <>
              <p className="text-[12.5px] leading-snug text-ink/65">
                {missing.length === 1
                  ? T.bridge.upsell(NODES[missing[0]].label, eur(potentialSaving))
                  : T.bridge.upsellTwo(eur(potentialSaving))}
              </p>
              <div className="flex flex-wrap gap-2">
                {missing.map((id) => (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => {
                      haptic(8);
                      toggle(id);
                    }}
                    whileTap={{ scale: 0.92 }}
                    transition={SPRING_TACTILE}
                    className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[12px] font-semibold text-white"
                  >
                    <NodeIcon node={id} size={14} /> + {NODES[id].label}
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <UrgencyLine formula={formula} nodes={nodes} dark={complete} />
        </div>

        <motion.button
          ref={btnRef}
          type="button"
          onClick={order}
          disabled={soldOut}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.012 }}
          transition={SPRING_TACTILE}
          className={cx("ios-btn relative mt-3 h-14 w-full text-[16px]", complete && "bg-white text-ink")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={soldOut ? "x" : complete ? "bundle" : "single"}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {soldOut
                ? "Šiuo metu nėra sandėlyje"
                : complete
                  ? T.bridge.cta
                  : `${T.bridge.ctaPartial} · ${eur(priced.totalCents)}`}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <p className={cx("relative mt-3 min-h-[34px] text-[11.5px] leading-snug", muted)}>
          {freeShip
            ? "Skubus Express pristatymas šiam užsakymui – nemokamas. "
            : `Skubus Express pristatymas – ${eur(COMMERCE.shippingExpressCents)}, nemokamas nuo ${eur(COMMERCE.freeShippingOverCents)}. `}
          14 dienų grąžinimo teisė neatidarytoms pakuotėms.
        </p>
      </motion.div>
    </section>
  );
}

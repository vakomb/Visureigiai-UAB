"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCartTotals } from "@/hooks/useCartTotals";
import { FormulaThumb } from "@/components/terminal/FormulaThumb";
import { IconBag, IconMinus, IconPlus, IconTrash, NodeIcon } from "@/components/ui/Icon";
import { COMMERCE } from "@/lib/config";
import { NODES, T } from "@/lib/copy";
import { eur } from "@/lib/format";
import { haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { useCartStore } from "@/lib/stores/cart";
import { useCheckoutStore } from "@/lib/stores/checkout";
import { useUIStore } from "@/lib/stores/ui";
import { LogisticsTracker } from "./LogisticsTracker";
import { Summary } from "./Summary";

export function CartStep() {
  const totals = useCartTotals();
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const add = useCartStore((s) => s.add);
  const addMany = useCartStore((s) => s.addMany);
  const closeCart = useUIStore((s) => s.closeCart);
  const setStep = useUIStore((s) => s.setCartStep);
  const toast = useUIStore((s) => s.toast);
  const cityId = useCheckoutStore((s) => s.values.cityId);
  const setCheckout = useCheckoutStore((s) => s.set);

  if (totals.itemCount === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-black/5">
          <IconBag size={28} className="text-ink/50" />
        </span>
        <p className="mt-5 font-display text-[28px] leading-tight">{T.cart.empty}</p>
        <p className="mt-2 max-w-xs text-[14px] text-ink/55">{T.cart.emptySub}</p>
        <motion.a
          href="/#konsole"
          onClick={closeCart}
          whileTap={{ scale: 0.95 }}
          transition={SPRING_TACTILE}
          className="ios-btn mt-6"
        >
          {T.cart.emptyCta}
        </motion.a>
      </div>
    );
  }

  const progress = Math.min(1, (COMMERCE.freeShippingOverCents - totals.freeShippingRemainingCents) / COMMERCE.freeShippingOverCents);
  const freeShip = totals.freeShippingRemainingCents === 0;

  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
        {/* Nemokamo pristatymo eiga */}
        <div className="rounded-2xl bg-black/[0.035] p-3.5">
          <p className="text-[13px] font-medium">
            {freeShip ? T.cart.freeShipDone : T.cart.freeShipProgress(eur(totals.freeShippingRemainingCents))}
          </p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/10">
            <motion.div
              className="h-full rounded-full bg-ink"
              initial={false}
              animate={{ width: `${Math.round(progress * 100)}%` }}
              transition={SPRING_TACTILE}
            />
          </div>
        </div>

        <ul className="divide-y divide-black/[0.07]">
          <AnimatePresence initial={false}>
            {totals.lines.map((l) => {
              const maxQty = Math.max(1, Math.min(COMMERCE.maxQtyPerLine, l.stock));
              return (
                <motion.li
                  key={l.key}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={SPRING_TACTILE}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 py-4">
                    <FormulaThumb formula={l.formula} size={56} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium leading-tight">{l.formula.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink/55">
                        <NodeIcon node={l.node} size={13} />
                        {NODES[l.node].label} · {NODES[l.node].unit}
                      </p>
                      {l.stock < l.qty && (
                        <p className="mt-1 text-[12px] font-medium text-crimson">Liko tik {l.stock} vnt.</p>
                      )}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center rounded-full bg-black/[0.05]">
                          <motion.button
                            type="button"
                            aria-label="Mažinti kiekį"
                            whileTap={{ scale: 0.82 }}
                            transition={SPRING_TACTILE}
                            onClick={() => {
                              haptic(6);
                              if (l.qty <= 1) {
                                remove(l.formula.id, l.node);
                                toast(`Pašalinta: ${l.formula.code} · ${NODES[l.node].label}`, {
                                  label: T.common.undo,
                                  run: () => add(l.formula.id, l.node, 1),
                                });
                              } else setQty(l.formula.id, l.node, l.qty - 1);
                            }}
                            className="grid h-9 w-9 place-items-center rounded-full"
                          >
                            <IconMinus size={16} />
                          </motion.button>
                          <span className="w-7 text-center text-[14px] font-semibold tabular-nums" aria-live="polite">
                            {l.qty}
                          </span>
                          <motion.button
                            type="button"
                            aria-label="Didinti kiekį"
                            disabled={l.qty >= maxQty}
                            whileTap={{ scale: 0.82 }}
                            transition={SPRING_TACTILE}
                            onClick={() => {
                              haptic(6);
                              setQty(l.formula.id, l.node, l.qty + 1);
                            }}
                            className="grid h-9 w-9 place-items-center rounded-full disabled:opacity-30"
                          >
                            <IconPlus size={16} />
                          </motion.button>
                        </div>
                        <span className="font-mono text-[14.5px] font-medium tabular-nums">{eur(l.lineCents)}</span>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      aria-label={`${T.cart.remove}: ${l.formula.name}`}
                      whileTap={{ scale: 0.82 }}
                      transition={SPRING_TACTILE}
                      onClick={() => {
                        remove(l.formula.id, l.node);
                        toast(`Pašalinta: ${l.formula.code} · ${NODES[l.node].label}`, {
                          label: T.common.undo,
                          run: () => add(l.formula.id, l.node, l.qty),
                        });
                      }}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/35 transition-colors hover:bg-black/5 hover:text-crimson"
                    >
                      <IconTrash size={17} />
                    </motion.button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Nulinės trinties papildomas pardavimas krepšelyje */}
        {totals.upsells.length > 0 && (
          <div className="space-y-2">
            {totals.upsells.map((u) => (
              <motion.button
                key={u.formula.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={SPRING_TACTILE}
                onClick={() => {
                  haptic(10);
                  addMany(u.formula.id, u.missing);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-ink/30 bg-white p-3.5 text-left"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white">
                  <IconPlus size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-tight">
                    {T.cart.upsell(u.missing.map((n) => NODES[n].label).join(" + "), eur(u.savingCents))}
                  </span>
                  <span className="block truncate text-[12px] text-ink/55">
                    {u.formula.name} · {eur(u.addCostCents)} − {Math.round(COMMERCE.bundleRate * 100)} % atlygis
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        )}

        <LogisticsTracker stage={0} predicted cityId={cityId} onCityChange={(id) => setCheckout({ cityId: id })} />
      </div>

      <footer className="space-y-4 border-t border-black/10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <Summary totals={totals} />
        <motion.button
          type="button"
          onClick={() => setStep("checkout")}
          whileTap={{ scale: 0.96 }}
          transition={SPRING_TACTILE}
          className="ios-btn h-14 w-full text-[16px]"
        >
          {T.cart.toCheckout} →
        </motion.button>
      </footer>
    </>
  );
}

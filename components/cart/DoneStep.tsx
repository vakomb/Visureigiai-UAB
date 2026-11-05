"use client";

import { motion } from "framer-motion";
import { useReduceMotion } from "@/hooks/useMotionPref";
import { NODES, PAYMENT_LABEL, T } from "@/lib/copy";
import { eur } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";
import { useOrdersStore } from "@/lib/stores/orders";
import { useUIStore } from "@/lib/stores/ui";
import type { OrderStatus } from "@/lib/types";
import { LogisticsTracker } from "./LogisticsTracker";

const STAGE: Record<OrderStatus, number> = {
  naujas: 0,
  apmoketas: 0,
  ruosiamas: 1,
  isiustas: 2,
  pristatytas: 3,
  atsauktas: 0,
};

export function DoneStep() {
  const reduce = useReduceMotion();
  const orderId = useUIStore((s) => s.lastOrderId);
  const closeCart = useUIStore((s) => s.closeCart);
  const setStep = useUIStore((s) => s.setCartStep);
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));

  const finish = () => {
    closeCart();
    window.setTimeout(() => setStep("cart"), 400);
  };

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="font-display text-[28px]">{T.checkout.doneTitle}</p>
        <button type="button" onClick={finish} className="ios-btn mt-6">
          {T.cart.continue}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-6">
        <div className="text-center">
          <motion.svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            className="mx-auto"
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_TACTILE}
            aria-hidden
          >
            <circle cx="36" cy="36" r="34" fill="#0a0a0b" />
            <motion.path
              d="M22 37.5 31.5 47 50 26"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            />
          </motion.svg>
          <h3 className="mt-4 font-display text-[32px] font-medium leading-tight">{T.checkout.doneTitle}</h3>
          <p className="mt-1.5 text-[14px] text-ink/60">{T.checkout.doneSub(order.customer.email)}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 font-mono text-[13px]">
            <span className="text-ink/50">{T.checkout.orderNo}</span> {order.number}
          </p>
        </div>

        {order.paymentState === "demo" && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-[12.5px] leading-snug text-amber-900 ring-1 ring-amber-200">
            {T.cart.demoBanner}
          </p>
        )}

        <LogisticsTracker
          stage={STAGE[order.status]}
          cityId={order.customer.cityId}
          canceled={order.status === "atsauktas"}
        />

        <section className="rounded-3xl border border-black/10 p-4 text-[13.5px]">
          <ul className="divide-y divide-black/[0.07]">
            {order.lines.map((l) => (
              <li key={`${l.formulaId}-${l.node}`} className="flex justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{l.name}</span>
                  <span className="text-[12px] text-ink/50">
                    {NODES[l.node].label} · {l.qty} vnt.
                  </span>
                </span>
                <span className="font-mono tabular-nums">{eur(l.unitCents * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-black/10 pt-3">
            {order.bundleDiscountCents > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>{T.cart.bundle}</dt>
                <dd className="font-mono tabular-nums">−{eur(order.bundleDiscountCents)}</dd>
              </div>
            )}
            <div className="flex justify-between text-ink/60">
              <dt>{T.cart.shipping}</dt>
              <dd className="tabular-nums">{order.shippingCents === 0 ? T.cart.free : eur(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between text-[15px] font-semibold">
              <dt>{T.cart.total}</dt>
              <dd className="font-mono tabular-nums">{eur(order.totalCents)}</dd>
            </div>
            <div className="flex justify-between text-[12px] text-ink/45">
              <dt>Apmokėjimas</dt>
              <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="border-t border-black/10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <motion.button
          type="button"
          onClick={finish}
          whileTap={{ scale: 0.96 }}
          transition={SPRING_TACTILE}
          className="ios-btn h-14 w-full text-[16px]"
        >
          {T.cart.continue}
        </motion.button>
      </footer>
    </>
  );
}

"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { T } from "@/lib/copy";
import { eur } from "@/lib/format";
import type { CartTotals } from "@/lib/pricing";

export function Summary({ totals }: { totals: CartTotals }) {
  return (
    <dl className="space-y-1.5 text-[14px]">
      <div className="flex justify-between">
        <dt className="text-ink/55">{T.cart.subtotal}</dt>
        <dd className="tabular-nums">
          <AnimatedNumber value={totals.subtotalCents} format={(n) => eur(Math.round(n))} />
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink/55">{T.cart.bundle}</dt>
        <dd className={`tabular-nums ${totals.bundleDiscountCents > 0 ? "font-semibold text-emerald-700" : "text-ink/35"}`}>
          {totals.bundleDiscountCents > 0 ? (
            <>
              −<AnimatedNumber value={totals.bundleDiscountCents} format={(n) => eur(Math.round(n))} />
            </>
          ) : (
            "—"
          )}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink/55">{T.cart.shipping}</dt>
        <dd className="tabular-nums">{totals.shippingCents === 0 ? T.cart.free : eur(totals.shippingCents)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-black/10 pt-3">
        <dt className="font-semibold">{T.cart.total}</dt>
        <dd className="text-right">
          <AnimatedNumber
            value={totals.totalCents}
            format={(n) => eur(Math.round(n))}
            className="font-mono text-[24px] font-medium tracking-tight"
          />
          <span className="block text-[11px] text-ink/45">
            {T.cart.vat} {eur(totals.vatCents)}
          </span>
        </dd>
      </div>
    </dl>
  );
}

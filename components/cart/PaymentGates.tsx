"use client";

import { motion } from "framer-motion";
import { PAYMENT_LABEL, T } from "@/lib/copy";
import { cx } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";

/**
 * Monochrominiai mokėjimo vartai: Apple Pay · Google Pay · Revolut Pay.
 * Paspaudimas = užsakymo patvirtinimas (forma patikrinama prieš tai).
 */
export function PaymentGates({
  busy,
  disabled,
  onPay,
}: {
  busy: PaymentMethod | null;
  disabled?: boolean;
  onPay: (m: PaymentMethod) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((m) => {
        const loading = busy === m;
        return (
          <motion.button
            key={m}
            type="button"
            onClick={() => onPay(m)}
            disabled={disabled || busy !== null}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            transition={SPRING_TACTILE}
            aria-label={`Apmokėti per ${PAYMENT_LABEL[m]}`}
            className={cx(
              "relative flex h-14 flex-col items-center justify-center rounded-2xl border border-ink bg-ink text-white transition-opacity",
              busy !== null && !loading && "opacity-30",
            )}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span className="sr-only">{T.checkout.processing}</span>
              </>
            ) : (
              <>
                <span className="text-[13px] font-semibold leading-none">{PAYMENT_LABEL[m]}</span>
                <span className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-white/50">Apmokėti</span>
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

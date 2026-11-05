"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconArrow, IconClose } from "@/components/ui/Icon";
import { SidePanel } from "@/components/ui/SidePanel";
import { T } from "@/lib/copy";
import { SPRING_TACTILE } from "@/lib/motion";
import { useUIStore } from "@/lib/stores/ui";
import { CartStep } from "./CartStep";
import { CheckoutStep } from "./CheckoutStep";
import { DoneStep } from "./DoneStep";

const TITLES = { cart: T.cart.title, checkout: T.cart.checkoutTitle, done: T.cart.doneTitle } as const;

/** Šoninis „Zero-Resistance“ išsiuntimo centras: krepšelis → atsiskaitymas → patvirtinimas. */
export function CartPanel() {
  const open = useUIStore((s) => s.cartOpen);
  const step = useUIStore((s) => s.cartStep);
  const close = useUIStore((s) => s.closeCart);
  const setStep = useUIStore((s) => s.setCartStep);

  return (
    <SidePanel open={open} onClose={close} label={TITLES[step]}>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/10 px-3 pl-5">
          <div className="flex min-w-0 items-center gap-2">
            {step === "checkout" && (
              <motion.button
                type="button"
                aria-label={T.cart.back}
                onClick={() => setStep("cart")}
                whileTap={{ scale: 0.86 }}
                transition={SPRING_TACTILE}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
              >
                <IconArrow size={20} className="rotate-180" />
              </motion.button>
            )}
            <h2 className="truncate font-display text-[26px] font-medium leading-none">{TITLES[step]}</h2>
          </div>
          <motion.button
            type="button"
            aria-label={T.common.close}
            onClick={close}
            whileTap={{ scale: 0.86 }}
            transition={SPRING_TACTILE}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5"
          >
            <IconClose size={20} />
          </motion.button>
        </header>

        {/* Žingsnių indikatorius */}
        <div className="flex shrink-0 gap-1.5 px-5 pt-3" aria-hidden>
          {(["cart", "checkout", "done"] as const).map((s, i) => (
            <span
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= ["cart", "checkout", "done"].indexOf(step) ? "bg-ink" : "bg-black/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {step === "cart" && <CartStep />}
            {step === "checkout" && <CheckoutStep />}
            {step === "done" && <DoneStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SidePanel>
  );
}

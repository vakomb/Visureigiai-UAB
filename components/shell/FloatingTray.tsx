"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { useCartTotals } from "@/hooks/useCartTotals";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { IconArrow, IconBag } from "@/components/ui/Icon";
import { eur, plural } from "@/lib/format";
import { SPRING_PANEL, SPRING_TACTILE } from "@/lib/motion";
import { useUIStore } from "@/lib/stores/ui";

/** Apatinė plūduriuojanti krepšelio juosta – dalelių srauto tikslas. Pulsuoja, kai dalelės nusileidžia. */
export function FloatingTray() {
  const { itemCount, totalCents } = useCartTotals();
  const cartOpen = useUIStore((s) => s.cartOpen);
  const openCart = useUIStore((s) => s.openCart);
  const pulse = useUIStore((s) => s.pulse);
  const controls = useAnimationControls();

  useEffect(() => {
    if (pulse === 0) return;
    controls.set({ scale: 1.06 });
    controls.start({ scale: 1, transition: SPRING_TACTILE });
  }, [pulse, controls]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {itemCount > 0 && !cartOpen && (
          <motion.div
            className="w-full max-w-md"
            initial={{ y: 110, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 110, opacity: 0, transition: { duration: 0.18 } }}
            transition={SPRING_PANEL}
          >
            <motion.button
              type="button"
              data-cart-tray
              animate={controls}
              whileTap={{ scale: 0.97 }}
              onClick={() => openCart("cart")}
              aria-label="Atidaryti krepšelį"
              className="glass pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full border border-black/5 pl-5 pr-2 text-left shadow-[0_18px_50px_-14px_rgba(0,0,0,0.35)]"
            >
              <IconBag size={20} />
              <span className="text-[14px] font-medium">
                {itemCount} {plural(itemCount, "prekė", "prekės", "prekių")}
              </span>
              <AnimatedNumber
                value={totalCents}
                format={(n) => eur(Math.round(n))}
                className="ml-auto text-[14px] font-semibold"
              />
              <span className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white">
                Krepšelis <IconArrow size={15} />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

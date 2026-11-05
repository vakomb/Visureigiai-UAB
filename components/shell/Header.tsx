"use client";

import { motion, useAnimationControls } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCartTotals } from "@/hooks/useCartTotals";
import { SPRING_TACTILE } from "@/lib/motion";
import { T } from "@/lib/copy";
import { useUIStore } from "@/lib/stores/ui";
import { IconBag, Mark } from "@/components/ui/Icon";
import { plural } from "@/lib/format";

function CartBadge({ count }: { count: number }) {
  const pop = useAnimationControls();
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      pop.set({ scale: 1.9 });
      pop.start({ scale: 1, transition: SPRING_TACTILE });
    }
    prev.current = count;
  }, [count, pop]);

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -right-0.5 -top-0.5"
      initial={false}
      animate={{ scale: count > 0 ? 1 : 0, opacity: count > 0 ? 1 : 0 }}
      transition={SPRING_TACTILE}
    >
      <motion.span
        animate={pop}
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums text-white"
      >
        {count}
      </motion.span>
    </motion.span>
  );
}

/** Slankiojanti matinė konsolė: backdrop-filter blur(24px), balta 82 %, plona apatinė linija. */
export function Header() {
  const menuOpen = useUIStore((s) => s.menuOpen);
  const setMenu = useUIStore((s) => s.setMenu);
  const openCart = useUIStore((s) => s.openCart);
  const { itemCount } = useCartTotals();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-black/5 bg-white/[0.82] backdrop-blur-[24px] backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Vaidore – į pradžią" className="group flex w-[176px] items-center gap-2.5">
          <Mark className="text-ink transition-transform duration-700 group-hover:rotate-[60deg]" />
          <span className="text-[15px] font-medium uppercase tracking-[0.42em] transition-[letter-spacing] duration-500 group-hover:tracking-[0.5em]">
            Vaidore
          </span>
        </Link>

        <nav aria-label="Pagrindinė navigacija" className="flex items-center gap-1">
          <Link
            href="/apie-mus"
            className="mr-1 hidden h-11 items-center rounded-full px-4 text-[13px] font-medium text-ink/70 transition-colors hover:bg-black/5 hover:text-ink md:inline-flex"
          >
            Apie mus
          </Link>

          <motion.button
            type="button"
            aria-label={menuOpen ? T.menu.close : T.menu.open}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => setMenu(!menuOpen)}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_TACTILE}
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-black/5"
          >
            <span className="relative block h-5 w-5">
              <motion.span
                className="absolute left-0.5 right-0.5 top-1/2 h-[1.5px] rounded bg-ink"
                initial={false}
                animate={{ y: menuOpen ? 0 : -3.5, rotate: menuOpen ? 45 : 0 }}
                transition={SPRING_TACTILE}
              />
              <motion.span
                className="absolute left-0.5 right-0.5 top-1/2 h-[1.5px] rounded bg-ink"
                initial={false}
                animate={{ y: menuOpen ? 0 : 3.5, rotate: menuOpen ? -45 : 0 }}
                transition={SPRING_TACTILE}
              />
            </span>
          </motion.button>

          <motion.button
            type="button"
            data-cart-target
            aria-label={
              itemCount > 0
                ? `Krepšelis: ${itemCount} ${plural(itemCount, "prekė", "prekės", "prekių")}`
                : "Krepšelis tuščias"
            }
            onClick={() => openCart("cart")}
            whileTap={{ scale: 0.88 }}
            transition={SPRING_TACTILE}
            className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-black/5"
          >
            <IconBag size={22} />
            <CartBadge count={itemCount} />
          </motion.button>
        </nav>
      </div>
    </header>
  );
}

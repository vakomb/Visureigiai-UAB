"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { T } from "@/lib/copy";
import { SPRING_PANEL, SPRING_TACTILE } from "@/lib/motion";
import { usePrefsStore, useUIStore } from "@/lib/stores/ui";
import { IconArrow } from "@/components/ui/Icon";
import { cx } from "@/lib/format";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-[30px] w-[50px] shrink-0 rounded-full p-[3px] transition-colors duration-300",
        checked ? "bg-ink" : "bg-black/15",
      )}
    >
      <motion.span
        className="block h-6 w-6 rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={SPRING_TACTILE}
      />
    </button>
  );
}

/** Spyruoklinis viršutinis skydas su lokalizuotu konfigūracijos indeksu (stiffness 300 · damping 15). */
export function MenuPanel() {
  const open = useUIStore((s) => s.menuOpen);
  const setMenu = useUIStore((s) => s.setMenu);
  const reduceMotion = usePrefsStore((s) => s.reduceMotion);
  const haptics = usePrefsStore((s) => s.haptics);
  const setReduceMotion = usePrefsStore((s) => s.setReduceMotion);
  const setHaptics = usePrefsStore((s) => s.setHaptics);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => firstLink.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [open, setMenu]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="menu-scrim"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenu(false)}
          />
          <motion.div
            key="menu-sheet"
            role="dialog"
            aria-label={T.menu.title}
            className="fixed inset-x-0 top-16 z-[45] mx-auto w-full max-w-6xl px-2 sm:px-6"
            initial={{ y: -28, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, transition: { duration: 0.16 } }}
            transition={SPRING_PANEL}
          >
            <div className="ml-auto max-h-[calc(100svh-5rem)] w-full max-w-[460px] overflow-y-auto rounded-[28px] border border-black/5 bg-white p-2 shadow-[0_40px_90px_-24px_rgba(0,0,0,0.4)]">
              <p className="eyebrow px-4 pb-1 pt-4">{T.menu.title}</p>
              <ul>
                {T.menu.items.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={() => setMenu(false)}
                      className="group flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-black/[0.04]"
                    >
                      <span className="w-6 font-mono text-[11px] text-ink/35">{item.n}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium leading-tight">{item.label}</span>
                        <span className="block truncate text-[12px] text-ink/50">{item.sub}</span>
                      </span>
                      <IconArrow
                        size={18}
                        className="-translate-x-1 text-ink/30 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mx-2 mt-2 rounded-2xl bg-black/[0.035] p-4">
                <p className="eyebrow mb-3">{T.menu.prefs}</p>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[14px]">{T.menu.reduceMotion}</span>
                  <Switch checked={reduceMotion} onChange={setReduceMotion} label={T.menu.reduceMotion} />
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[14px]">{T.menu.haptics}</span>
                  <Switch checked={haptics} onChange={setHaptics} label={T.menu.haptics} />
                </div>
              </div>
              <p className="px-4 pb-3 pt-3 text-[12px] text-ink/45">
                Pagalba: <a className="underline underline-offset-2" href="mailto:info@vaidore.lt">info@vaidore.lt</a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

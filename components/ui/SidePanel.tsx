"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { SPRING_EDGE } from "@/lib/motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dešinės pusės skydas su ekrano krašto spyruokline fizika, ESC uždarymu, fokuso gaudykle
 * ir slinkties užraktu (be išdėstymo šuolio – html naudoja scrollbar-gutter: stable).
 */
export function SidePanel({
  open,
  onClose,
  label,
  children,
  className,
  width = "max-w-[480px]",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  /** Tailwind max-w-* klasė */
  width?: string;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    document.body.classList.add("vd-lock");
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("vd-lock");
      returnFocus.current?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown}>
          <motion.div
            className="absolute inset-0 bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            className={cx(
              "absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[0_0_80px_-10px_rgba(0,0,0,0.35)] outline-none",
              width,
              className,
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING_EDGE}
          >
            {/* Dengia spyruoklės perlenkimą prie dešiniojo krašto – tarpo niekada nematyti. */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 -right-24 w-24 bg-white" />
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

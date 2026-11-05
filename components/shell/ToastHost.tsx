"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { SPRING_PANEL } from "@/lib/motion";
import { useUIStore, type Toast } from "@/lib/stores/ui";

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUIStore((s) => s.dismissToast);
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.ttl);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.ttl, dismiss]);

  return (
    <motion.div
      layout
      role="status"
      initial={{ y: 40, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={SPRING_PANEL}
      className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-ink px-4 py-3 text-[14px] text-white shadow-2xl"
    >
      <span>{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className="rounded-lg bg-white/15 px-3 py-1 text-[13px] font-semibold transition-colors hover:bg-white/25"
          onClick={() => {
            toast.action?.run();
            dismiss(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
    </motion.div>
  );
}

export function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

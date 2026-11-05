"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/copy";
import { cx } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[36px] font-medium leading-none tracking-tight sm:text-[44px]">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-[14px] text-ink/55">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold ring-1 ring-inset",
        STATUS_TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-3xl border border-black/5 bg-white", className)}>{children}</div>;
}

const parse = (s: string) => Number(s.trim().replace(/\s/g, "").replace(",", "."));

/**
 * Redaguojama skaičių ląstelė: vertė patvirtinama paspaudus Enter arba palikus lauką;
 * netinkama reikšmė paryškinama, bet išdėstymas nekinta.
 */
export function NumCell({
  value,
  onCommit,
  decimals = 0,
  min = 0,
  max = 1_000_000,
  suffix,
  label,
  className,
}: {
  value: number;
  onCommit: (n: number) => void;
  decimals?: number;
  min?: number;
  max?: number;
  suffix?: string;
  label: string;
  className?: string;
}) {
  const fmt = (n: number) => n.toFixed(decimals).replace(".", ",");
  const [text, setText] = useState(fmt(value));
  const [bad, setBad] = useState(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value.toFixed(decimals).replace(".", ","));
  }, [value, decimals]);

  const commit = () => {
    focused.current = false;
    const n = parse(text);
    if (!Number.isFinite(n) || n < min || n > max) {
      setBad(true);
      return;
    }
    setBad(false);
    setText(fmt(n));
    if (n !== value) onCommit(n);
  };

  return (
    <div className={cx("relative", className)}>
      <input
        aria-label={label}
        aria-invalid={bad || undefined}
        inputMode="decimal"
        value={text}
        onFocus={(e) => {
          focused.current = true;
          e.currentTarget.select();
        }}
        onChange={(e) => {
          setText(e.target.value);
          setBad(false);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setText(fmt(value));
            setBad(false);
            e.currentTarget.blur();
          }
        }}
        className={cx(
          "h-10 w-full rounded-xl border bg-white px-2.5 text-right font-mono text-[13.5px] tabular-nums outline-none transition-[border-color,box-shadow]",
          suffix && "pr-8",
          bad ? "border-crimson ring-4 ring-crimson/10" : "border-black/10 hover:border-black/25 focus:border-ink focus:ring-4 focus:ring-black/5",
        )}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[12px] text-ink/40">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-6 w-10 shrink-0 rounded-full p-0.5 transition-colors duration-300", checked ? "bg-emerald-600" : "bg-black/20")}
    >
      <span
        className={cx(
          "block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

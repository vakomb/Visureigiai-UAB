"use client";

import type { ChangeEvent, ReactNode } from "react";
import { cx } from "@/lib/format";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "url";
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  /** „select“ – vaikai yra <option> elementai */
  select?: ReactNode;
  textarea?: boolean;
  className?: string;
  suffix?: string;
}

const base =
  "w-full rounded-[14px] border bg-white px-3.5 text-[16px] sm:text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink/30";

/**
 * Išdėstymui stabilus laukas: klaidos eilutė visada užima 20 px, todėl pasirodžius
 * patikros pranešimui niekas nepasislenka (CLS = 0).
 */
export function Field(p: FieldProps) {
  const invalid = Boolean(p.error);
  const stateClass = invalid
    ? "border-crimson ring-4 ring-crimson/10"
    : "border-black/10 hover:border-black/25 focus:border-ink focus:ring-4 focus:ring-black/5";
  const common = {
    id: p.id,
    name: p.id,
    value: p.value,
    onBlur: p.onBlur,
    "aria-invalid": invalid || undefined,
    "aria-describedby": `${p.id}-err`,
    "aria-required": p.required || undefined,
    autoComplete: p.autoComplete,
  };
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    p.onChange(e.target.value);

  return (
    <div className={p.className}>
      <label htmlFor={p.id} className="mb-1.5 block text-[12px] font-medium text-ink/60">
        {p.label}
        {p.required && <span aria-hidden className="ml-0.5 text-crimson">*</span>}
      </label>
      {p.select ? (
        <select {...common} onChange={handle} className={cx(base, "h-12 appearance-none", stateClass)}>
          {p.select}
        </select>
      ) : p.textarea ? (
        <textarea
          {...common}
          onChange={handle}
          rows={2}
          placeholder={p.placeholder}
          className={cx(base, "h-[72px] resize-none py-3", stateClass)}
        />
      ) : (
        <div className="relative">
          <input
            {...common}
            onChange={handle}
            type={p.type ?? "text"}
            inputMode={p.inputMode}
            placeholder={p.placeholder}
            className={cx(base, "h-12", p.suffix && "pr-12", stateClass)}
          />
          {p.suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-ink/40">
              {p.suffix}
            </span>
          )}
        </div>
      )}
      <p
        id={`${p.id}-err`}
        role={invalid ? "alert" : undefined}
        className={cx(
          "h-5 pt-1 text-[12px] leading-4 text-crimson transition-opacity duration-200",
          invalid ? "opacity-100" : "opacity-0",
        )}
      >
        {p.error || " "}
      </p>
    </div>
  );
}

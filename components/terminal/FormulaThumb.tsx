import { useId } from "react";
import { PROFILE_STYLE } from "@/lib/copy";
import type { Formula } from "@/lib/types";

/** Formulės miniatiūra: administratoriaus įkeltas vaizdas arba generuotas kristalo ženklas. */
export function FormulaThumb({ formula, size = 44 }: { formula: Formula; size?: number }) {
  const rawId = useId();
  const id = `g${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const p = PROFILE_STYLE[formula.profile];

  if (formula.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={formula.imageUrl}
        alt={formula.name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="shrink-0 rounded-xl border border-black/5 bg-mist object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      role="img"
      aria-label={formula.name}
      className="shrink-0 rounded-xl border border-black/5 bg-mist"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.lq1} />
          <stop offset="1" stopColor={p.lq2} />
        </linearGradient>
      </defs>
      <rect x="18" y="5.5" width="8" height="5" rx="1" fill="#1b1b20" />
      <path d="M22 9.5 31 14v17L22 36 13 31V14l9-4.5Z" fill="#fff" fillOpacity=".7" stroke="#8fa3c0" strokeOpacity=".7" />
      <path d="M22 18.5 29.6 22.2V31L22 35 14.4 31v-8.8L22 18.5Z" fill={`url(#${id})`} opacity=".95" />
      <path d="M22 9.5v26.5" stroke="#fff" strokeOpacity=".55" />
    </svg>
  );
}

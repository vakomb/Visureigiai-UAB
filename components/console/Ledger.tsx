"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { NODES, T } from "@/lib/copy";
import { dec1, eur, int } from "@/lib/format";
import type { Formula, NodeId } from "@/lib/types";

/** „Live-Value Ledger“: tik kietieji techniniai duomenys, perskaičiuojami gyvai keičiant mazgą ar formulę. */
export function Ledger({ formula, node }: { formula: Formula; node: NodeId }) {
  const v = formula.variants[node];
  const cells = [
    { label: T.ledger.base, value: v.priceCents, fmt: (n: number) => eur(Math.round(n)) },
    { label: T.ledger.oil, value: v.oilPct, fmt: (n: number) => `${dec1(n)} %` },
    { label: T.ledger.sillage, value: v.sillageHours, fmt: (n: number) => `${int(Math.round(n))} ${T.ledger.hours}` },
    { label: `${T.ledger.radius}`, value: v.radiusM, fmt: (n: number) => `${dec1(n)} ${T.ledger.meters}` },
  ];

  return (
    <section aria-label={T.ledger.title} className="rounded-[26px] border border-black/5 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">{T.ledger.title}</p>
        <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/45">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {NODES[node].label}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-black/[0.06]">
        {cells.map((c) => (
          <div key={c.label} className="flex min-h-[86px] flex-col justify-between bg-white p-3.5">
            <dt className="text-[11.5px] leading-snug text-ink/50">{c.label}</dt>
            <dd className="mt-2 font-mono text-[22px] font-medium leading-none tracking-tight sm:text-[24px]">
              <AnimatedNumber value={c.value} format={c.fmt} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink/55">
        {NODES[node].product}, {NODES[node].unit}. {NODES[node].emotion}
      </p>
    </section>
  );
}

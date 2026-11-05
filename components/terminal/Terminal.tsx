"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { IconSearch, NodeIcon } from "@/components/ui/Icon";
import { COMMERCE } from "@/lib/config";
import { NODES, PROFILE_STYLE, T } from "@/lib/copy";
import { cx, dec1, eur, int } from "@/lib/format";
import { haptic } from "@/lib/fx";
import { SPRING_TACTILE } from "@/lib/motion";
import { useShopFormulas } from "@/lib/stores/catalog";
import { useConsoleStore } from "@/lib/stores/ui";
import { NODE_IDS, PROFILES, type Formula, type NodeId, type Profile } from "@/lib/types";
import { AddButton } from "./AddButton";
import { FormulaThumb } from "./FormulaThumb";

type SortKey = "code" | "priceAsc" | "priceDesc" | "oil" | "sillage";
const ORIGINAL = "__original__";

const codeKey = (f: Formula) => f.inspiredBy ?? ORIGINAL;
const codeLabel = (k: string) => (k === ORIGINAL ? T.terminal.original : `Inspired by ${k}`);

function Chip({
  active,
  onClick,
  children,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  dot?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={() => {
        haptic(5);
        onClick();
      }}
      whileTap={{ scale: 0.93 }}
      transition={SPRING_TACTILE}
      className={cx(
        "flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200",
        active ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink/75 hover:border-black/30",
      )}
    >
      {dot && <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
      <span className={cx("font-mono text-[11px]", active ? "text-white/60" : "text-ink/40")}>{count}</span>
    </motion.button>
  );
}

function Meter({ value, max, tone }: { value: number; max: number; tone: string }) {
  return (
    <span aria-hidden className="block h-1 w-full overflow-hidden rounded-full bg-black/[0.07]">
      <span
        className="block h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: tone }}
      />
    </span>
  );
}

/** Olfaktorinis terminalas: kiekybinės prekybos skydelio stiliaus filtrai ir tanki lentelė. */
export function Terminal() {
  const formulas = useShopFormulas();
  const node = useConsoleStore((s) => s.node);
  const setNode = useConsoleStore((s) => s.setNode);
  const setFormula = useConsoleStore((s) => s.setFormula);

  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Set<Profile>>(new Set());
  const [codes, setCodes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("code");

  const codeKeys = useMemo(() => Array.from(new Set(formulas.map(codeKey))), [formulas]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("lt");
    const list = formulas.filter((f) => {
      if (profiles.size && !profiles.has(f.profile)) return false;
      if (codes.size && !codes.has(codeKey(f))) return false;
      if (!q) return true;
      return [f.code, f.name, f.inspiredBy ?? "", f.profile].some((s) => s.toLocaleLowerCase("lt").includes(q));
    });
    const price = (f: Formula) => f.variants[node].priceCents;
    const sorters: Record<SortKey, (a: Formula, b: Formula) => number> = {
      code: (a, b) => a.code.localeCompare(b.code, "lt"),
      priceAsc: (a, b) => price(a) - price(b),
      priceDesc: (a, b) => price(b) - price(a),
      oil: (a, b) => b.variants[node].oilPct - a.variants[node].oilPct,
      sillage: (a, b) => b.variants[node].sillageHours - a.variants[node].sillageHours,
    };
    return list.slice().sort(sorters[sort]);
  }, [formulas, query, profiles, codes, sort, node]);

  const stats = useMemo(() => {
    if (visible.length === 0) return null;
    const sum = (fn: (f: Formula) => number) => visible.reduce((s, f) => s + fn(f), 0) / visible.length;
    return {
      oil: sum((f) => f.variants[node].oilPct),
      price: sum((f) => f.variants[node].priceCents),
      sillage: sum((f) => f.variants[node].sillageHours),
    };
  }, [visible, node]);

  const toggleIn = <V,>(set: Set<V>, v: V, apply: (s: Set<V>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    apply(next);
  };

  const filtersActive = profiles.size > 0 || codes.size > 0 || query !== "";
  const clear = () => {
    setProfiles(new Set());
    setCodes(new Set());
    setQuery("");
  };

  const configure = (f: Formula) => {
    setFormula(f.id);
    document.getElementById("konsole")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stockLabel = (f: Formula) => {
    const s = f.variants[node].stock;
    if (s <= 0) return { text: "Išparduota", tone: "text-ink/40" };
    if (s <= COMMERCE.lowStockThreshold) return { text: `Liko ${s} vnt.`, tone: "font-semibold text-crimson" };
    return { text: "Sandėlyje", tone: "text-emerald-700" };
  };

  return (
    <section id="terminalas" aria-labelledby="terminal-title" className="border-y border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{T.terminal.eyebrow}</p>
            <h2 id="terminal-title" className="mt-3 max-w-xl font-display text-[34px] font-medium leading-[1.02] tracking-tight sm:text-[46px]">
              {T.terminal.title}
            </h2>
          </div>
          <div role="radiogroup" aria-label="Mazgas" className="flex rounded-2xl bg-black/[0.045] p-1">
            {NODE_IDS.map((id: NodeId) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={id === node}
                onClick={() => setNode(id)}
                className={cx(
                  "flex h-10 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold tracking-[0.1em] transition-colors sm:px-4",
                  id === node ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink",
                )}
              >
                <NodeIcon node={id} size={15} />
                {NODES[id].label}
              </button>
            ))}
          </div>
        </div>

        {/* Įrankių juosta */}
        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">{T.terminal.search}</span>
            <IconSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={T.terminal.search}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 text-[16px] outline-none transition-[border-color,box-shadow] placeholder:text-ink/35 hover:border-black/25 focus:border-ink focus:ring-4 focus:ring-black/5 sm:text-[15px]"
            />
          </label>
          <label className="block">
            <span className="sr-only">{T.terminal.sort}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-ink focus:ring-4 focus:ring-black/5 sm:w-52 sm:text-[15px]"
            >
              {(Object.keys(T.terminal.sorts) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {T.terminal.sorts[k]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Filtrai */}
        <div className="mt-4 space-y-3">
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="eyebrow mr-1 shrink-0">{T.terminal.profile}</span>
            {PROFILES.map((p) => (
              <Chip
                key={p}
                active={profiles.has(p)}
                count={formulas.filter((f) => f.profile === p).length}
                dot={PROFILE_STYLE[p].dot}
                onClick={() => toggleIn(profiles, p, setProfiles)}
              >
                {p}
              </Chip>
            ))}
          </div>
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="eyebrow mr-1 shrink-0">{T.terminal.code}</span>
            {codeKeys.map((k) => (
              <Chip
                key={k}
                active={codes.has(k)}
                count={formulas.filter((f) => codeKey(f) === k).length}
                onClick={() => toggleIn(codes, k, setCodes)}
              >
                {codeLabel(k)}
              </Chip>
            ))}
          </div>
        </div>

        {/* Statistikos juosta */}
        <div className="mt-6 flex min-h-10 flex-wrap items-center gap-x-5 gap-y-1 border-y border-black/10 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink/55">
          <span aria-live="polite">
            Rodoma <b className="text-ink">{visible.length}</b>/{formulas.length}
          </span>
          {stats && (
            <>
              <span className="hidden sm:inline">Vid. aliejus <b className="text-ink">{dec1(stats.oil)} %</b></span>
              <span className="hidden sm:inline">Vid. ilgaamžiškumas <b className="text-ink">{int(Math.round(stats.sillage))} val.</b></span>
              <span>Vid. kaina <b className="text-ink">{eur(Math.round(stats.price))}</b></span>
            </>
          )}
          <button
            type="button"
            onClick={clear}
            className={cx(
              "ml-auto rounded-full px-3 py-1 font-sans text-[12px] font-semibold normal-case tracking-normal text-ink underline underline-offset-2 transition-opacity",
              filtersActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {T.terminal.reset}
          </button>
        </div>

        {/* Lentelė */}
        <div
          className="hidden grid-cols-[minmax(0,2.4fr)_1.15fr_.9fr_1fr_.8fr_1fr_.95fr_124px] items-center gap-4 border-b border-black/10 px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink/45 md:grid"
          aria-hidden
        >
          <span>{T.terminal.columns.formula}</span>
          <span>{T.terminal.columns.profile}</span>
          <span>{T.terminal.columns.oil}</span>
          <span>{T.terminal.columns.sillage}</span>
          <span>{T.terminal.columns.radius}</span>
          <span>{T.terminal.columns.price}</span>
          <span>{T.terminal.columns.stock}</span>
          <span />
        </div>

        <LayoutGroup>
          <ul
            className="relative min-h-[calc(var(--n)*132px)] md:min-h-[calc(var(--n)*80px)]"
            style={{ "--n": formulas.length } as React.CSSProperties}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((f) => {
                const v = f.variants[node];
                const stock = stockLabel(f);
                const p = PROFILE_STYLE[f.profile];
                return (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={SPRING_TACTILE}
                    className="border-b border-black/[0.07] bg-white"
                  >
                    {/* Staliniai kompiuteriai */}
                    <div className="hidden h-20 grid-cols-[minmax(0,2.4fr)_1.15fr_.9fr_1fr_.8fr_1fr_.95fr_124px] items-center gap-4 px-3 transition-colors hover:bg-black/[0.02] md:grid">
                      <button
                        type="button"
                        onClick={() => configure(f)}
                        className="flex min-w-0 items-center gap-3 text-left"
                        aria-label={`${T.terminal.configure}: ${f.name}`}
                      >
                        <FormulaThumb formula={f} />
                        <span className="min-w-0">
                          <span className="block font-mono text-[11px] tracking-wider text-ink/45">{f.code}</span>
                          <span className="block truncate text-[14.5px] font-medium">{f.name}</span>
                          <span className="block truncate text-[11.5px] text-ink/45">
                            {f.inspiredBy ? `Inspired by ${f.inspiredBy}` : T.terminal.original}
                          </span>
                        </span>
                      </button>
                      <span className="flex items-center gap-2 text-[13px]">
                        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: p.dot }} />
                        {f.profile}
                      </span>
                      <span className="space-y-1.5 font-mono text-[13px] tabular-nums">
                        {dec1(v.oilPct)} %<Meter value={v.oilPct} max={30} tone={p.dot} />
                      </span>
                      <span className="space-y-1.5 font-mono text-[13px] tabular-nums">
                        {int(v.sillageHours)} val.<Meter value={v.sillageHours} max={Math.max(12, ...formulas.map((x) => x.variants[node].sillageHours))} tone={p.dot} />
                      </span>
                      <span className="font-mono text-[13px] tabular-nums">{dec1(v.radiusM)} m</span>
                      <span className="font-mono text-[15px] font-medium tabular-nums">{eur(v.priceCents)}</span>
                      <span className={cx("text-[12.5px]", stock.tone)}>{stock.text}</span>
                      <AddButton formula={f} node={node} />
                    </div>

                    {/* Telefonai */}
                    <div className="grid h-[132px] grid-cols-[44px_minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-2 py-3 md:hidden">
                      <FormulaThumb formula={f} />
                      <button type="button" onClick={() => configure(f)} className="min-w-0 text-left" aria-label={`${T.terminal.configure}: ${f.name}`}>
                        <span className="block font-mono text-[11px] tracking-wider text-ink/45">
                          {f.code} · <span style={{ color: p.dot }}>●</span> {f.profile}
                        </span>
                        <span className="block truncate text-[15px] font-medium">{f.name}</span>
                        <span className="block truncate text-[11.5px] text-ink/45">
                          {f.inspiredBy ? `Inspired by ${f.inspiredBy}` : T.terminal.original}
                        </span>
                      </button>
                      <span className="font-mono text-[15px] font-medium tabular-nums">{eur(v.priceCents)}</span>
                      <div className="col-span-2 col-start-1 flex items-end justify-between gap-2">
                        <dl className="grid flex-1 grid-cols-3 gap-2 font-mono text-[12px] tabular-nums">
                          <div><dt className="text-[10px] uppercase text-ink/40">Aliejus</dt><dd>{dec1(v.oilPct)} %</dd></div>
                          <div><dt className="text-[10px] uppercase text-ink/40">Ilgaamž.</dt><dd>{int(v.sillageHours)} val.</dd></div>
                          <div><dt className="text-[10px] uppercase text-ink/40">Spindulys</dt><dd>{dec1(v.radiusM)} m</dd></div>
                        </dl>
                      </div>
                      <div className="flex flex-col items-end justify-end gap-1.5">
                        <span className={cx("text-[11.5px]", stock.tone)}>{stock.text}</span>
                        <AddButton formula={f} node={node} />
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {visible.length === 0 && (
              <li className="absolute inset-x-0 top-0 grid h-40 place-items-center text-center text-[14px] text-ink/50">
                {T.terminal.empty}
              </li>
            )}
          </ul>
        </LayoutGroup>
      </div>
    </section>
  );
}

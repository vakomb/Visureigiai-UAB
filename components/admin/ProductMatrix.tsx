"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { FormulaThumb } from "@/components/terminal/FormulaThumb";
import { IconDownload, IconEdit, IconPlus, IconSearch, IconTrash, NodeIcon } from "@/components/ui/Icon";
import { parseCatalog } from "@/lib/catalog-io";
import { COMMERCE } from "@/lib/config";
import { NODES, PROFILE_STYLE } from "@/lib/copy";
import { downloadFile } from "@/lib/export";
import { cx } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";
import { useAllFormulas, useCatalogStore } from "@/lib/stores/catalog";
import { useUIStore } from "@/lib/stores/ui";
import { NODE_IDS, type Formula, type NodeId } from "@/lib/types";
import { ProductEditor } from "./ProductEditor";
import { Card, NumCell, PageHead, Toggle } from "./parts";

export function ProductMatrix() {
  const formulas = useAllFormulas();
  const hydrated = useUIStore((s) => s.hydrated);
  const toast = useUIStore((s) => s.toast);
  const { remove, restore, patchVariant, upsert, reset } = useCatalogStore.getState();
  const customized = useCatalogStore((s) => s.formulas !== null);

  const [node, setNode] = useState<NodeId>("zmogui");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ open: boolean; formula: Formula | null }>({ open: false, formula: null });
  const importRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("lt");
    return q
      ? formulas.filter((f) => [f.code, f.name, f.inspiredBy ?? "", f.profile].some((s) => s.toLocaleLowerCase("lt").includes(q)))
      : formulas;
  }, [formulas, query]);

  const del = (f: Formula) => {
    const index = formulas.findIndex((x) => x.id === f.id);
    remove(f.id);
    toast(`Pašalinta: ${f.code}`, { label: "Atšaukti", run: () => restore(f, index) }, 7000);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseCatalog(JSON.parse(await file.text()));
      if (!parsed) throw new Error("bad");
      useCatalogStore.setState({ formulas: parsed });
      toast(`Importuota formulių: ${parsed.length}`);
    } catch {
      toast("Failas netinkamas – importas nutrauktas, duomenys nepakeisti.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const NodeSwitch = (
    <div role="radiogroup" aria-label="Mazgas" className="flex rounded-2xl bg-white p-1 ring-1 ring-black/5">
      {NODE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={id === node}
          onClick={() => setNode(id)}
          className={cx(
            "flex h-10 items-center gap-1.5 rounded-xl px-3 text-[12px] font-semibold tracking-[0.08em] transition-colors",
            id === node ? "bg-ink text-white" : "text-ink/55 hover:text-ink",
          )}
        >
          <NodeIcon node={id} size={15} />
          <span className="hidden sm:inline">{NODES[id].label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageHead
        title="Produktų matrica"
        sub="Pridėkite, redaguokite ir šalinkite molekulines formules. Skaičius galite keisti tiesiai lentelėje – pakeitimai parduotuvėje matomi iškart."
        actions={
          <>
            <button type="button" onClick={() => downloadFile("vaidore-katalogas.json", JSON.stringify(formulas, null, 2), "application/json")} className="ios-btn-ghost bg-white ring-1 ring-black/5">
              <IconDownload size={16} /> Eksportuoti
            </button>
            <input ref={importRef} type="file" accept="application/json" className="sr-only" id="catalog-import" onChange={(e) => onImport(e.target.files?.[0])} />
            <label htmlFor="catalog-import" className="ios-btn-ghost cursor-pointer bg-white ring-1 ring-black/5">Importuoti</label>
            <motion.button type="button" whileTap={{ scale: 0.95 }} transition={SPRING_TACTILE} onClick={() => setEditing({ open: true, formula: null })} className="ios-btn h-11 min-h-0 rounded-xl text-[14px]">
              <IconPlus size={17} /> Nauja formulė
            </motion.button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-80">
          <span className="sr-only">Ieškoti formulių</span>
          <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ieškoti pagal kodą ar pavadinimą"
            className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-[16px] outline-none focus:border-ink focus:ring-4 focus:ring-black/5 sm:text-[14px]"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          {NodeSwitch}
          {customized && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Atkurti pradinį katalogą? Visi jūsų pakeitimai šioje naršyklėje bus prarasti.")) {
                  reset();
                  toast("Atkurtas pradinis katalogas");
                }
              }}
              className="text-[12.5px] font-medium text-ink/55 underline underline-offset-2 hover:text-ink"
            >
              Atkurti numatytuosius
            </button>
          )}
        </div>
      </div>

      {/* Staliniai kompiuteriai */}
      <Card className="hidden overflow-hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-black/10 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/45">
              <th className="w-[28%] px-5 py-3">Formulė</th>
              <th className="w-[10%] px-2 py-3 text-right">Kaina €</th>
              <th className="w-[9%] px-2 py-3 text-right">Aliejus %</th>
              <th className="w-[10%] px-2 py-3 text-right">Ilgaam. val.</th>
              <th className="w-[9%] px-2 py-3 text-right">Spind. m</th>
              <th className="w-[9%] px-2 py-3 text-right">Likutis</th>
              <th className="w-[8%] px-2 py-3 text-center">Aktyvi</th>
              <th className="w-[17%] px-5 py-3 text-right">Veiksmai</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((f) => {
                const v = f.variants[node];
                const low = v.stock <= COMMERCE.lowStockThreshold;
                return (
                  <motion.tr
                    key={f.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: f.active ? 1 : 0.55 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-black/[0.06] last:border-0 hover:bg-black/[0.015]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FormulaThumb formula={f} size={44} />
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] tracking-wider text-ink/45">{f.code}</p>
                          <p className="truncate text-[14px] font-medium">{f.name}</p>
                          <p className="flex items-center gap-1.5 text-[11.5px] text-ink/45">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PROFILE_STYLE[f.profile].dot }} />
                            {f.profile}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2"><NumCell label={`Kaina: ${f.code}`} decimals={2} max={100000} value={v.priceCents / 100} onCommit={(n) => patchVariant(f.id, node, { priceCents: Math.round(n * 100) })} /></td>
                    <td className="px-2"><NumCell label={`Aliejus: ${f.code}`} decimals={1} max={100} value={v.oilPct} onCommit={(n) => patchVariant(f.id, node, { oilPct: n })} /></td>
                    <td className="px-2"><NumCell label={`Ilgaamžiškumas: ${f.code}`} max={100000} value={v.sillageHours} onCommit={(n) => patchVariant(f.id, node, { sillageHours: n })} /></td>
                    <td className="px-2"><NumCell label={`Spindulys: ${f.code}`} decimals={1} max={1000} value={v.radiusM} onCommit={(n) => patchVariant(f.id, node, { radiusM: n })} /></td>
                    <td className="px-2">
                      <NumCell label={`Likutis: ${f.code}`} max={1000000} value={v.stock} onCommit={(n) => patchVariant(f.id, node, { stock: Math.round(n) })} className={cx(low && "[&_input]:border-amber-400 [&_input]:bg-amber-50")} />
                    </td>
                    <td className="px-2 text-center">
                      <div className="flex justify-center">
                        <Toggle label={`Rodyti: ${f.code}`} checked={f.active} onChange={(a) => upsert({ ...f, active: a })} />
                      </div>
                    </td>
                    <td className="px-5">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label={`Redaguoti ${f.code}`} onClick={() => setEditing({ open: true, formula: f })} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-black/5"><IconEdit size={18} /></button>
                        <button type="button" aria-label={`Šalinti ${f.code}`} onClick={() => del(f)} className="grid h-10 w-10 place-items-center rounded-xl text-ink/40 hover:bg-rose-50 hover:text-crimson"><IconTrash size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {hydrated && rows.length === 0 && <p className="py-14 text-center text-[14px] text-ink/45">Formulių nerasta.</p>}
      </Card>

      {/* Telefonai ir planšetės */}
      <ul className="space-y-3 lg:hidden">
        {rows.map((f) => {
          const v = f.variants[node];
          return (
            <li key={f.id} className={cx("rounded-3xl border border-black/5 bg-white p-4", !f.active && "opacity-60")}>
              <div className="flex items-start gap-3">
                <FormulaThumb formula={f} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] tracking-wider text-ink/45">{f.code} · {f.profile}</p>
                  <p className="truncate text-[15px] font-medium">{f.name}</p>
                </div>
                <Toggle label={`Rodyti: ${f.code}`} checked={f.active} onChange={(a) => upsert({ ...f, active: a })} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  ["Kaina", <NumCell key="p" label="Kaina" decimals={2} suffix="€" max={100000} value={v.priceCents / 100} onCommit={(n) => patchVariant(f.id, node, { priceCents: Math.round(n * 100) })} />],
                  ["Aliejus", <NumCell key="o" label="Aliejus" decimals={1} suffix="%" max={100} value={v.oilPct} onCommit={(n) => patchVariant(f.id, node, { oilPct: n })} />],
                  ["Ilgaamžiškumas", <NumCell key="s" label="Ilgaamžiškumas" suffix="val." max={100000} value={v.sillageHours} onCommit={(n) => patchVariant(f.id, node, { sillageHours: n })} />],
                  ["Spindulys", <NumCell key="r" label="Spindulys" decimals={1} suffix="m" max={1000} value={v.radiusM} onCommit={(n) => patchVariant(f.id, node, { radiusM: n })} />],
                  ["Likutis", <NumCell key="k" label="Likutis" suffix="vnt." max={1000000} value={v.stock} onCommit={(n) => patchVariant(f.id, node, { stock: Math.round(n) })} />],
                ].map(([label, cell]) => (
                  <div key={label as string}>
                    <p className="mb-1 text-[11px] text-ink/45">{label}</p>
                    {cell}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setEditing({ open: true, formula: f })} className="ios-btn-ghost h-11 flex-1"><IconEdit size={16} /> Redaguoti</button>
                <button type="button" onClick={() => del(f)} className="ios-btn-ghost h-11 text-crimson"><IconTrash size={16} /> Šalinti</button>
              </div>
            </li>
          );
        })}
        {hydrated && rows.length === 0 && <li className="py-12 text-center text-[14px] text-ink/45">Formulių nerasta.</li>}
      </ul>

      <ProductEditor open={editing.open} formula={editing.formula} onClose={() => setEditing((e) => ({ ...e, open: false }))} />
    </>
  );
}

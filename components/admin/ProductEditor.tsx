"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FormulaThumb } from "@/components/terminal/FormulaThumb";
import { Field } from "@/components/ui/Field";
import { IconClose, IconImage } from "@/components/ui/Icon";
import { SidePanel } from "@/components/ui/SidePanel";
import { downscaleImage, isValidImageRef } from "@/lib/catalog-io";
import { NODES } from "@/lib/copy";
import { SPRING_TACTILE } from "@/lib/motion";
import { useAllFormulas, useCatalogStore } from "@/lib/stores/catalog";
import { useUIStore } from "@/lib/stores/ui";
import { NODE_IDS, PROFILES, type Formula, type NodeId, type Profile } from "@/lib/types";

type VKey = "price" | "oil" | "sillage" | "radius" | "stock";
interface Draft {
  code: string;
  name: string;
  inspiredBy: string;
  profile: Profile;
  tagline: string;
  description: string;
  top: string;
  heart: string;
  base: string;
  imageUrl: string;
  active: boolean;
  v: Record<NodeId, Record<VKey, string>>;
}

const comma = (n: number, d = 0) => n.toFixed(d).replace(".", ",");
const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const num = (s: string) => Number(s.trim().replace(/\s/g, "").replace(",", "."));

function toDraft(f: Formula | null, fallback: Formula | undefined): Draft {
  const src = f ?? fallback;
  const v = {} as Draft["v"];
  for (const n of NODE_IDS) {
    const x = src?.variants[n];
    v[n] = {
      price: comma((x?.priceCents ?? 5000) / 100, 2),
      oil: comma(x?.oilPct ?? 15, 1),
      sillage: comma(x?.sillageHours ?? 10),
      radius: comma(x?.radiusM ?? 2, 1),
      stock: f ? comma(x?.stock ?? 0) : "20",
    };
  }
  return {
    code: f?.code ?? "",
    name: f?.name ?? "Vaidore Formula ",
    inspiredBy: f?.inspiredBy ?? "",
    profile: f?.profile ?? "Woody Amber",
    tagline: f?.tagline ?? "",
    description: f?.description ?? "",
    top: f?.notes.top.join(", ") ?? "",
    heart: f?.notes.heart.join(", ") ?? "",
    base: f?.notes.base.join(", ") ?? "",
    imageUrl: f?.imageUrl ?? "",
    active: f?.active ?? true,
    v,
  };
}

const RANGE: Record<VKey, [number, number]> = {
  price: [0, 100000],
  oil: [0, 100],
  sillage: [0, 100000],
  radius: [0, 1000],
  stock: [0, 1000000],
};

const VLABEL: Record<VKey, [string, string]> = {
  price: ["Kaina su PVM", "€"],
  oil: ["Aliejų koncentracija", "%"],
  sillage: ["Ilgaamžiškumas", "val."],
  radius: ["Sklaidos spindulys", "m"],
  stock: ["Likutis", "vnt."],
};

export function ProductEditor({
  open,
  formula,
  onClose,
}: {
  open: boolean;
  /** null = nauja formulė */
  formula: Formula | null;
  onClose: () => void;
}) {
  const all = useAllFormulas();
  const upsert = useCatalogStore((s) => s.upsert);
  const toast = useUIStore((s) => s.toast);
  const [draft, setDraft] = useState<Draft>(() => toDraft(formula, all[0]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Kai atidaromas kitas įrašas – iš naujo užpildome juodraštį.
  useEffect(() => {
    if (open) {
      setDraft(toDraft(formula, all[0]));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formula?.id]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  };
  const setV = (n: NodeId, k: VKey, v: string) => {
    setDraft((d) => ({ ...d, v: { ...d.v, [n]: { ...d.v[n], [k]: v } } }));
    if (errors[`${n}.${k}`]) setErrors((e) => ({ ...e, [`${n}.${k}`]: "" }));
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, imageUrl: "Pasirinkite paveikslėlio failą" }));
      return;
    }
    setUploading(true);
    try {
      set("imageUrl", await downscaleImage(file));
    } catch {
      setErrors((e) => ({ ...e, imageUrl: "Nepavyko apdoroti vaizdo" }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () => {
    const errs: Record<string, string> = {};
    const code = draft.code.trim();
    if (!code) errs.code = "Įveskite formulės kodą";
    else if (all.some((f) => f.id !== formula?.id && f.code.toLowerCase() === code.toLowerCase())) errs.code = "Toks kodas jau naudojamas";
    if (!draft.name.trim()) errs.name = "Įveskite pavadinimą";
    if (!isValidImageRef(draft.imageUrl.trim())) errs.imageUrl = "Naudokite /kelias.jpg arba https:// nuorodą";

    for (const n of NODE_IDS) {
      for (const k of Object.keys(RANGE) as VKey[]) {
        const x = num(draft.v[n][k]);
        const [lo, hi] = RANGE[k];
        if (!Number.isFinite(x) || x < lo || x > hi || (k === "stock" && !Number.isInteger(x))) {
          errs[`${n}.${k}`] = k === "stock" ? "Sveikas skaičius ≥ 0" : `${lo}–${hi}`;
        }
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const now = Date.now();
    const variants = {} as Formula["variants"];
    for (const n of NODE_IDS) {
      variants[n] = {
        priceCents: Math.round(num(draft.v[n].price) * 100),
        oilPct: num(draft.v[n].oil),
        sillageHours: num(draft.v[n].sillage),
        radiusM: num(draft.v[n].radius),
        stock: Math.round(num(draft.v[n].stock)),
      };
    }
    const next: Formula = {
      id: formula?.id ?? `f-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${now.toString(36)}`,
      code,
      name: draft.name.trim(),
      inspiredBy: draft.inspiredBy.trim() || null,
      profile: draft.profile,
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      notes: { top: list(draft.top), heart: list(draft.heart), base: list(draft.base) },
      imageUrl: draft.imageUrl.trim(),
      active: draft.active,
      variants,
      createdAt: formula?.createdAt ?? now,
      updatedAt: now,
    };
    upsert(next);
    toast(formula ? `Išsaugota: ${next.code}` : `Pridėta formulė: ${next.code}`);
    onClose();
  };

  const preview: Formula = { ...(formula ?? all[0] ?? ({} as Formula)), imageUrl: draft.imageUrl, profile: draft.profile, name: draft.name };

  return (
    <SidePanel open={open} onClose={onClose} label={formula ? "Redaguoti formulę" : "Nauja formulė"} width="sm:max-w-[600px]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 px-5">
          <h2 className="font-display text-[26px] font-medium leading-none">{formula ? "Redaguoti formulę" : "Nauja formulė"}</h2>
          <button type="button" aria-label="Uždaryti" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5">
            <IconClose size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <p className="eyebrow mb-3">Pagrindiniai duomenys</p>
          <div className="grid grid-cols-2 gap-x-3">
            <Field id="pe-code" required label="Formulės kodas" placeholder="VD-540" value={draft.code} error={errors.code} onChange={(v) => set("code", v)} />
            <Field id="pe-profile" label="Profilis" value={draft.profile} onChange={(v) => set("profile", v as Profile)}
              select={PROFILES.map((p) => <option key={p} value={p}>{p}</option>)} />
          </div>
          <Field id="pe-name" required label="Pavadinimas" value={draft.name} error={errors.name} onChange={(v) => set("name", v)} />
          <Field id="pe-insp" label="„Inspired by“ (palikite tuščią originalioms formulėms)" placeholder="Baccarat 540" value={draft.inspiredBy} onChange={(v) => set("inspiredBy", v)} />
          <Field id="pe-tag" label="Trumpas šūkis" value={draft.tagline} onChange={(v) => set("tagline", v)} />
          <Field id="pe-desc" textarea label="Aprašymas" value={draft.description} onChange={(v) => set("description", v)} />

          <p className="eyebrow mb-3 mt-2">Natos (atskirkite kableliais)</p>
          <div className="grid grid-cols-3 gap-x-3">
            <Field id="pe-top" label="Viršutinės" value={draft.top} onChange={(v) => set("top", v)} />
            <Field id="pe-heart" label="Širdies" value={draft.heart} onChange={(v) => set("heart", v)} />
            <Field id="pe-base" label="Bazinės" value={draft.base} onChange={(v) => set("base", v)} />
          </div>

          <p className="eyebrow mb-3 mt-2">Vaizdas</p>
          <div className="flex items-start gap-4">
            <FormulaThumb formula={preview} size={72} />
            <div className="min-w-0 flex-1">
              <Field id="pe-img" label="Vaizdo kelias arba nuoroda" placeholder="/images/formula-540.jpg" value={draft.imageUrl} error={errors.imageUrl} onChange={(v) => set("imageUrl", v)} />
              <div className="-mt-2 mb-3 flex flex-wrap gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="pe-file" onChange={(e) => onFile(e.target.files?.[0])} />
                <label htmlFor="pe-file" className="ios-btn-ghost h-10 cursor-pointer text-[13px]">
                  <IconImage size={16} /> {uploading ? "Apdorojama…" : "Įkelti failą"}
                </label>
                {draft.imageUrl && (
                  <button type="button" onClick={() => set("imageUrl", "")} className="ios-btn-ghost h-10 text-[13px]">Pašalinti</button>
                )}
              </div>
              <p className="text-[11.5px] leading-snug text-ink/45">
                Gamybai rekomenduojama įkelti failą į <code>public/images</code> ir čia nurodyti kelią <code>/images/pavadinimas.jpg</code>.
                Įkeltas failas sumažinamas ir saugomas tik šioje naršyklėje.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {NODE_IDS.map((n) => (
              <fieldset key={n} className="rounded-2xl border border-black/10 p-4">
                <legend className="px-2 text-[12px] font-semibold tracking-[0.12em]">{NODES[n].label} · {NODES[n].unit}</legend>
                <div className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
                  {(Object.keys(VLABEL) as VKey[]).map((k) => (
                    <Field
                      key={k}
                      id={`pe-${n}-${k}`}
                      label={VLABEL[k][0]}
                      suffix={VLABEL[k][1]}
                      inputMode="decimal"
                      value={draft.v[n][k]}
                      error={errors[`${n}.${k}`]}
                      onChange={(v) => setV(n, k, v)}
                    />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-[14px]">
            <input type="checkbox" checked={draft.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-black" />
            Rodoma parduotuvėje
          </label>
        </div>

        <footer className="flex gap-3 border-t border-black/10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <button type="button" onClick={onClose} className="ios-btn-ghost h-12 flex-1">Atšaukti</button>
          <motion.button type="button" onClick={save} whileTap={{ scale: 0.96 }} transition={SPRING_TACTILE} className="ios-btn h-12 flex-[2]">
            Išsaugoti
          </motion.button>
        </footer>
      </div>
    </SidePanel>
  );
}

import { NODE_IDS, PROFILES, type Formula, type Variant } from "./types";

const num = (v: unknown, min = 0, max = 1e9): v is number => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const str = (v: unknown, max = 4000): v is string => typeof v === "string" && v.length <= max;

function isVariant(v: unknown): v is Variant {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    num(o.priceCents, 0, 10_000_000) &&
    num(o.oilPct, 0, 100) &&
    num(o.sillageHours, 0, 100_000) &&
    num(o.radiusM, 0, 1000) &&
    num(o.stock, 0, 1_000_000)
  );
}

const strList = (v: unknown) => Array.isArray(v) && v.length <= 20 && v.every((x) => str(x, 80));

/** Tikrina importuojamą katalogo JSON. Grąžina švarų sąrašą arba null, jei bent vienas įrašas netinkamas. */
export function parseCatalog(input: unknown): Formula[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 500) return null;
  const out: Formula[] = [];
  const ids = new Set<string>();

  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    const notes = o.notes as Record<string, unknown> | undefined;
    const variants = o.variants as Record<string, unknown> | undefined;

    if (!str(o.id, 80) || ids.has(o.id) || !str(o.code, 40) || !str(o.name, 160)) return null;
    if (!PROFILES.includes(o.profile as never)) return null;
    if (!(o.inspiredBy === null || str(o.inspiredBy, 120))) return null;
    if (!str(o.tagline, 300) || !str(o.description, 2000) || !str(o.imageUrl, 600_000)) return null;
    if (!notes || !strList(notes.top) || !strList(notes.heart) || !strList(notes.base)) return null;
    if (!variants || !NODE_IDS.every((n) => isVariant(variants[n]))) return null;

    ids.add(o.id);
    out.push({
      id: o.id,
      code: o.code,
      name: o.name,
      inspiredBy: (o.inspiredBy as string | null) || null,
      profile: o.profile as Formula["profile"],
      tagline: o.tagline,
      description: o.description,
      notes: { top: notes.top as string[], heart: notes.heart as string[], base: notes.base as string[] },
      imageUrl: o.imageUrl,
      active: o.active !== false,
      variants: {
        zmogui: variants.zmogui as Variant,
        masinai: variants.masinai as Variant,
        namams: variants.namams as Variant,
      },
      createdAt: num(o.createdAt) ? o.createdAt : Date.now(),
      updatedAt: Date.now(),
    });
  }
  return out;
}

/** Vaizdo kelio patikra: tuščia, vidinis kelias, https nuoroda arba data:image. */
export function isValidImageRef(v: string): boolean {
  if (v === "") return true;
  if (v.startsWith("data:image/")) return true;
  if (v.startsWith("/") && !v.startsWith("//")) return !/\s/.test(v);
  try {
    const u = new URL(v);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Sumažina vaizdą naršyklėje iki ≤ 640 px ir grąžina JPEG data URL (tinka localStorage). */
export async function downscaleImage(file: File, max = 640): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Nepavyko nuskaityti vaizdo"));
      i.src = url;
    });
    const ratio = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * ratio));
    canvas.height = Math.max(1, Math.round(img.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Naršyklė nepalaiko canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

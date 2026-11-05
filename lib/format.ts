import { COMMERCE } from "./config";

const eurFmt = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" });
const numFmt0 = new Intl.NumberFormat("lt-LT", { maximumFractionDigits: 0 });
const numFmt1 = new Intl.NumberFormat("lt-LT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 6900 → „69,00 €“ */
export const eur = (cents: number) => eurFmt.format(cents / 100);
export const int = (n: number) => numFmt0.format(n);
export const dec1 = (n: number) => numFmt1.format(n);
export const pct = (n: number) => `${numFmt1.format(n)} %`;

const dateTimeFmt = new Intl.DateTimeFormat("lt-LT", {
  timeZone: COMMERCE.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("lt-LT", {
  timeZone: COMMERCE.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const fmtDateTime = (ts: number) => dateTimeFmt.format(new Date(ts));
export const fmtDate = (ts: number) => dateFmt.format(new Date(ts));

/** Skiria „3 formulės“ / „5 formulių“ pagal lietuvių kalbos daugiskaitą. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 === 0 || (mod100 >= 11 && mod100 <= 19)) return many;
  return few;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** VD-2026-00001 */
export const orderNumber = (seq: number, ts = Date.now()) =>
  `VD-${new Date(ts).getFullYear()}-${String(seq).padStart(5, "0")}`;

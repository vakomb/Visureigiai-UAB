import { COMMERCE } from "./config";
import { NODE_IDS, type CartLine, type Formula, type NodeId } from "./types";

export const lineKey = (formulaId: string, node: NodeId) => `${formulaId}:${node}`;

export interface PricedLine {
  key: string;
  formula: Formula;
  node: NodeId;
  qty: number;
  unitCents: number;
  lineCents: number;
  stock: number;
}

export interface BundleSet {
  formulaId: string;
  formulaName: string;
  sets: number;
  discountCents: number;
}

export interface Upsell {
  formula: Formula;
  missing: NodeId[];
  addCostCents: number;
  savingCents: number;
}

export interface CartTotals {
  lines: PricedLine[];
  itemCount: number;
  subtotalCents: number;
  bundleSets: BundleSet[];
  bundleSetCount: number;
  bundleDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  freeShippingRemainingCents: number;
  upsells: Upsell[];
}

/** Trijų mazgų rinkinio kaina be nuolaidos. */
export function setPriceCents(formula: Formula): number {
  return NODE_IDS.reduce((sum, n) => sum + formula.variants[n].priceCents, 0);
}

/** Vieno rinkinio (3 mazgai) nuolaida – apvalinama iki cento. */
export function setDiscountCents(formula: Formula): number {
  return Math.round(setPriceCents(formula) * COMMERCE.bundleRate);
}

export function vatFromGross(grossCents: number): number {
  return Math.round(grossCents - grossCents / (1 + COMMERCE.vatRate));
}

/** Konsolės skaičiuoklė: pasirinktų mazgų suma ir (jei pasirinkti visi trys) nuolaida. */
export function priceSelection(formula: Formula, nodes: readonly NodeId[]) {
  const subtotalCents = nodes.reduce((s, n) => s + formula.variants[n].priceCents, 0);
  const complete = NODE_IDS.every((n) => nodes.includes(n));
  const discountCents = complete ? setDiscountCents(formula) : 0;
  return { subtotalCents, complete, discountCents, totalCents: subtotalCents - discountCents };
}

export function shippingFor(itemCount: number, afterDiscountCents: number): number {
  if (itemCount === 0) return 0;
  return afterDiscountCents >= COMMERCE.freeShippingOverCents ? 0 : COMMERCE.shippingExpressCents;
}

/**
 * Pilnas krepšelio skaičiavimas. Visada skaičiuojamas iš katalogo – niekada nepasitikima išsaugotomis kainomis.
 * Ištrintos / paslėptos formulės tyliai praleidžiamos.
 */
export function priceCart(lines: readonly CartLine[], catalog: readonly Formula[]): CartTotals {
  const byId = new Map(catalog.map((f) => [f.id, f] as const));
  const priced: PricedLine[] = [];

  for (const l of lines) {
    const formula = byId.get(l.formulaId);
    if (!formula || !formula.active || l.qty < 1) continue;
    const unitCents = formula.variants[l.node].priceCents;
    priced.push({
      key: lineKey(l.formulaId, l.node),
      formula,
      node: l.node,
      qty: l.qty,
      unitCents,
      lineCents: unitCents * l.qty,
      stock: formula.variants[l.node].stock,
    });
  }

  const itemCount = priced.reduce((s, l) => s + l.qty, 0);
  const subtotalCents = priced.reduce((s, l) => s + l.lineCents, 0);

  // Rinkiniai: kiek pilnų trijų mazgų komplektų turime kiekvienai formulei.
  const qtyBy = new Map<string, Record<NodeId, number>>();
  for (const l of priced) {
    const rec = qtyBy.get(l.formula.id) ?? { zmogui: 0, masinai: 0, namams: 0 };
    rec[l.node] += l.qty;
    qtyBy.set(l.formula.id, rec);
  }

  const bundleSets: BundleSet[] = [];
  const upsells: Upsell[] = [];

  for (const [formulaId, rec] of qtyBy) {
    const formula = byId.get(formulaId)!;
    const sets = Math.min(rec.zmogui, rec.masinai, rec.namams);
    if (sets > 0) {
      bundleSets.push({ formulaId, formulaName: formula.name, sets, discountCents: sets * setDiscountCents(formula) });
    }
    const missing = NODE_IDS.filter((n) => rec[n] <= sets);
    if (missing.length > 0 && missing.length < 3) {
      upsells.push({
        formula,
        missing,
        addCostCents: missing.reduce((s, n) => s + formula.variants[n].priceCents, 0),
        savingCents: setDiscountCents(formula),
      });
    }
  }

  const bundleDiscountCents = bundleSets.reduce((s, b) => s + b.discountCents, 0);
  const bundleSetCount = bundleSets.reduce((s, b) => s + b.sets, 0);
  const afterDiscount = subtotalCents - bundleDiscountCents;
  const shippingCents = shippingFor(itemCount, afterDiscount);
  const totalCents = afterDiscount + shippingCents;

  return {
    lines: priced,
    itemCount,
    subtotalCents,
    bundleSets,
    bundleSetCount,
    bundleDiscountCents,
    shippingCents,
    totalCents,
    vatCents: vatFromGross(totalCents),
    freeShippingRemainingCents:
      itemCount === 0 ? 0 : Math.max(0, COMMERCE.freeShippingOverCents - afterDiscount),
    upsells,
  };
}

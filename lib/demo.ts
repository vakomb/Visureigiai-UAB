import { priceCart } from "./pricing";
import { orderNumber } from "./format";
import type { CartLine, Formula, NodeId, Order, OrderStatus, PaymentMethod } from "./types";

const PEOPLE = [
  ["Jonas", "Kazlauskas", "Vilnius", "vilnius", "Gedimino pr. 12-4", "01103"],
  ["Eglė", "Petrauskienė", "Kaunas", "kaunas", "Laisvės al. 55-9", "44309"],
  ["Mantas", "Jankauskas", "Klaipėda", "klaipeda", "Taikos pr. 30-21", "91184"],
  ["Rūta", "Stankevičiūtė", "Šiauliai", "siauliai", "Vilniaus g. 88-2", "76293"],
  ["Tomas", "Butkus", "Vilnius", "vilnius", "Konstitucijos pr. 7-15", "09308"],
  ["Gintarė", "Navickaitė", "Panevėžys", "panevezys", "Respublikos g. 24-3", "35173"],
  ["Darius", "Vasiliauskas", "Kaunas", "kaunas", "Savanorių pr. 191-8", "44151"],
  ["Lina", "Žukauskaitė", "Vilnius", "vilnius", "Ukmergės g. 120-31", "07157"],
] as const;

const STATUSES: OrderStatus[] = ["pristatytas", "pristatytas", "isiustas", "ruosiamas", "apmoketas", "naujas", "pristatytas", "atsauktas"];
const METHODS: PaymentMethod[] = ["apple-pay", "google-pay", "revolut-pay"];
const ALL: NodeId[] = ["zmogui", "masinai", "namams"];

/** Sugeneruoja demonstracinius užsakymus valdymo stoties peržiūrai. */
export function buildDemoOrders(formulas: Formula[], startSeq: number): Order[] {
  const pool = formulas.filter((f) => f.active);
  if (pool.length === 0) return [];
  const now = Date.now();

  return PEOPLE.map((p, i) => {
    const f = pool[i % pool.length];
    const f2 = pool[(i + 2) % pool.length];
    const lines: CartLine[] =
      i % 3 === 0
        ? ALL.map((node) => ({ formulaId: f.id, node, qty: 1 }))
        : i % 3 === 1
          ? [{ formulaId: f.id, node: "zmogui", qty: 1 }, { formulaId: f2.id, node: "namams", qty: 1 }]
          : [{ formulaId: f.id, node: ALL[i % 3], qty: 2 }];

    const totals = priceCart(lines, pool);
    const seq = startSeq + i;
    const createdAt = now - (PEOPLE.length - i) * 31 * 3_600_000 - i * 977_000;

    return {
      id: `demo-${seq}-${createdAt}`,
      seq,
      number: orderNumber(seq, createdAt),
      createdAt,
      status: STATUSES[i % STATUSES.length],
      customer: {
        firstName: p[0],
        lastName: p[1],
        email: `${p[0].toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}@example.com`,
        phone: `+3706${String(1000000 + i * 137421).slice(0, 7)}`,
        address: p[4],
        city: p[2],
        cityId: p[3],
        postcode: p[5],
        note: "",
      },
      lines: totals.lines.map((l) => ({
        formulaId: l.formula.id,
        code: l.formula.code,
        name: l.formula.name,
        node: l.node,
        qty: l.qty,
        unitCents: l.unitCents,
      })),
      subtotalCents: totals.subtotalCents,
      bundleDiscountCents: totals.bundleDiscountCents,
      bundleSets: totals.bundleSetCount,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
      paymentMethod: METHODS[i % METHODS.length],
      paymentState: "demo",
      demo: true,
    } satisfies Order;
  });
}

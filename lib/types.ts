/** Trys veiklos sritys – „ekosistemos mazgai“. */
export const NODE_IDS = ["zmogui", "masinai", "namams"] as const;
export type NodeId = (typeof NODE_IDS)[number];

export const PROFILES = ["Woody Amber", "Crimson Saffron", "Metallic Musk"] as const;
export type Profile = (typeof PROFILES)[number];

/** Vienos formulės variantas konkrečiam mazgui (kainos – centais). */
export interface Variant {
  priceCents: number;
  /** Eterinių aliejų koncentracija, % */
  oilPct: number;
  /** Kvapo ilgaamžiškumas, valandomis */
  sillageHours: number;
  /** Aktyvus sklaidos spindulys, metrais */
  radiusM: number;
  /** Likutis sandėlyje, vnt. */
  stock: number;
}

export interface Formula {
  id: string;
  /** Formulės kodas, pvz. VD-540 */
  code: string;
  name: string;
  /** „Inspired by …“ nuoroda; null – originali Vaidore formulė */
  inspiredBy: string | null;
  profile: Profile;
  tagline: string;
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  /** Vaizdo kelias (/images/x.jpg arba https://…) arba tuščia – naudojama generuota ikona */
  imageUrl: string;
  /** Ar rodoma parduotuvėje */
  active: boolean;
  variants: Record<NodeId, Variant>;
  createdAt: number;
  updatedAt: number;
}

export interface CartLine {
  formulaId: string;
  node: NodeId;
  qty: number;
}

export const ORDER_STATUSES = [
  "naujas",
  "apmoketas",
  "ruosiamas",
  "isiustas",
  "pristatytas",
  "atsauktas",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["apple-pay", "google-pay", "revolut-pay"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  cityId: string;
  city: string;
  postcode: string;
  note: string;
}

export interface OrderLine {
  formulaId: string;
  code: string;
  name: string;
  node: NodeId;
  qty: number;
  /** Vieneto kaina prieš nuolaidą, centais (su PVM) */
  unitCents: number;
}

export interface Order {
  id: string;
  seq: number;
  number: string;
  createdAt: number;
  status: OrderStatus;
  customer: Customer;
  lines: OrderLine[];
  subtotalCents: number;
  bundleDiscountCents: number;
  bundleSets: number;
  shippingCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  /** demo – mokėjimas nevykdytas; paid – patvirtintas teikėjo */
  paymentState: "demo" | "pending" | "paid";
  /** Demonstracinis (sugeneruotas) užsakymas */
  demo?: boolean;
}

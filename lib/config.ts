/** Centrinė konfigūracija – čia keičiami verslo parametrai. */

export const SITE = {
  name: "Vaidore",
  domain: "vaidore.lt",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://vaidore.lt",
  locale: "lt_LT",
  currency: "EUR",
  email: "info@vaidore.lt",
  description:
    "Vaidore – prabangi kvapų ekosistema: viena formulė žmogui, automobiliui ir namams. Sukonfigūruokite savo molekulinį parašą ir gaukite −20 % tęstinumo atlygį.",
} as const;

export const COMMERCE = {
  /** Ekosistemos rinkinio (3 mazgai, ta pati formulė) nuolaida */
  bundleRate: 0.2,
  /** Lietuvos PVM; kainos rodomos su PVM */
  vatRate: 0.21,
  /** Skubus Express pristatymas, centais */
  shippingExpressCents: 490,
  /** Nemokamas pristatymas nuo (centais, po nuolaidų) */
  freeShippingOverCents: 7900,
  /** Siuntų išvykimo laikas (valanda, Europe/Vilnius) */
  dispatchCutoffHour: 15,
  timezone: "Europe/Vilnius",
  /** Rodyti „Liko N vnt.“, kai likutis ≤ šios reikšmės (tik tikri likučiai) */
  lowStockThreshold: 12,
  maxQtyPerLine: 10,
  paymentsMode: process.env.NEXT_PUBLIC_PAYMENTS_MODE === "live" ? "live" : "demo",
} as const;

/** Pardavėjo duomenys sąskaitoms faktūroms. PAKEISKITE į tikrus rekvizitus. */
export const COMPANY = {
  name: "UAB „Vaidore“",
  code: "[ĮMONĖS KODAS]",
  vat: "LT[PVM KODAS]",
  address: "[ADRESAS], Lietuva",
  email: "info@vaidore.lt",
  phone: "+370 [TELEFONAS]",
  iban: "LT[IBAN]",
  bank: "[BANKAS]",
  invoiceSeries: "VAI",
} as const;

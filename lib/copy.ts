import type { NodeId, OrderStatus, PaymentMethod, Profile } from "./types";

/** Visi vartotojui matomi tekstai lietuvių kalba – vienoje vietoje. */

export interface NodeMeta {
  id: NodeId;
  label: string;
  title: string;
  product: string;
  unit: string;
  tagline: string;
  emotion: string;
  radiusLabel: string;
}

export const NODES: Record<NodeId, NodeMeta> = {
  zmogui: {
    id: "zmogui",
    label: "ŽMOGUI",
    title: "Žmogui",
    product: "Parfumuotas ekstraktas",
    unit: "50 ml",
    tagline: "Asmeninis molekulinis parašas",
    emotion: "Pirmas įspūdis, kurį palieka jūsų žingsnis.",
    radiusLabel: "Aura aplink jus",
  },
  masinai: {
    id: "masinai",
    label: "MAŠINAI",
    title: "Mašinai",
    product: "Automobilio salono difuzorius",
    unit: "12 ml",
    tagline: "Salono aromatas, sukurtas inžinerijos tikslumu",
    emotion: "Kiekvienas kelias prasideda nuo kvapo.",
    radiusLabel: "Salono aprėptis",
  },
  namams: {
    id: "namams",
    label: "NAMAMS",
    title: "Namams",
    product: "Namų difuzorius su lazdelėmis",
    unit: "200 ml",
    tagline: "Erdvė, kuri kvepia taip pat kaip jūs",
    emotion: "Namai, į kuriuos norisi sugrįžti.",
    radiusLabel: "Patalpos aprėptis",
  },
};

export const PROFILE_STYLE: Record<
  Profile,
  { lq1: string; lq2: string; dot: string; blurb: string }
> = {
  "Woody Amber": {
    lq1: "#f2b650",
    lq2: "#8a4710",
    dot: "#c0791f",
    blurb: "Šilta mediena, gintaras, sausas kedras",
  },
  "Crimson Saffron": {
    lq1: "#e8505c",
    lq2: "#650d1d",
    dot: "#b3202f",
    blurb: "Šafrano kibirkštis, raudonas šilkas",
  },
  "Metallic Musk": {
    lq1: "#cfd9e6",
    lq2: "#4f5d73",
    dot: "#6b7b90",
    blurb: "Šaltas metalas, švarus muskusas",
  },
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  naujas: "Naujas",
  apmoketas: "Apmokėtas",
  ruosiamas: "Ruošiamas",
  isiustas: "Išsiųstas",
  pristatytas: "Pristatytas",
  atsauktas: "Atšauktas",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  naujas: "bg-sky-50 text-sky-800 ring-sky-200",
  apmoketas: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  ruosiamas: "bg-amber-50 text-amber-800 ring-amber-200",
  isiustas: "bg-violet-50 text-violet-800 ring-violet-200",
  pristatytas: "bg-neutral-900 text-white ring-neutral-900",
  atsauktas: "bg-rose-50 text-rose-800 ring-rose-200",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  "apple-pay": "Apple Pay",
  "google-pay": "Google Pay",
  "revolut-pay": "Revolut Pay",
};

export const T = {
  brand: "Vaidore",
  hero: {
    eyebrow: "Molekulinė kvapų ekosistema",
    title: "Vienas kvapas. Trys erdvės.",
    sub: "Sukonfigūruokite savo parašą žmogui, automobiliui ir namams – kaina ir poveikis skaičiuojami gyvai.",
  },
  tabs: { aria: "Pasirinkite ekosistemos mazgą" },
  ledger: {
    title: "Gyvų verčių knyga",
    base: "Bazinė kaina",
    oil: "Eterinių aliejų koncentracija",
    sillage: "Kvapo ilgaamžiškumas",
    radius: "Aktyvus sklaidos spindulys",
    hours: "val.",
    meters: "m",
  },
  bridge: {
    title: "Ekosistemos sinchronizacijos tiltas",
    synced: "Visi trys mazgai sinchronizuoti",
    primary: "Pagrindinis",
    included: "Įtraukta",
    add: "Pridėti",
    reward: "Ekosistemos tęstinumo atlygis",
    rewardSub: "Struktūrinis atlygis už vientisą kvapo tęstinumą žmogui, automobiliui ir namams.",
    locked: "Atrakinama sujungus visus tris mazgus",
    setValue: "Rinkinio vertė",
    yourPrice: "Jūsų kaina",
    savings: "Sutaupote",
    // Reikalavimas: „Užsakyti nemokamai →“. Tai gali būti suprasta kaip „prekė nemokama“,
    // todėl pagal nutylėjimą rašoma tiksliau. Norėdami grįžti prie originalo, pakeiskite į „Užsakyti nemokamai →“.
    cta: "Užsakyti su nemokamu pristatymu →",
    ctaPartial: "Į krepšelį",
    ctaNote: "Skubus Express pristatymas – nemokamas. 14 dienų grąžinimo teisė neatidarytoms pakuotėms.",
    upsell: (node: string, saving: string) =>
      `Pridėkite ${node} ir atrakinkite tęstinumo atlygį – sutaupote ${saving}.`,
    upsellTwo: (saving: string) =>
      `Sujunkite likusius mazgus ir atrakinkite tęstinumo atlygį – sutaupote ${saving}.`,
  },
  urgency: {
    cutoff: (t: string) => `Užsakykite per ${t} – siuntą išsiųsime šiandien`,
    nextDispatch: (d: string) => `Artimiausias išsiuntimas: ${d}`,
    low: (node: string, n: number) => `${node}: liko tik ${n} vnt.`,
  },
  terminal: {
    eyebrow: "Olfaktorinis terminalas",
    title: "Visa kolekcija – vienoje lentelėje",
    search: "Ieškoti pagal kodą ar pavadinimą",
    profile: "Profilis",
    code: "Formulės kodas",
    sort: "Rūšiuoti",
    all: "Visi",
    reset: "Išvalyti filtrus",
    empty: "Pagal pasirinktus filtrus formulių nerasta.",
    add: "Į krepšelį",
    added: "Įdėta",
    configure: "Konfigūruoti",
    original: "Originali Vaidore formulė",
    columns: {
      formula: "Formulė",
      profile: "Profilis",
      oil: "Aliejus",
      sillage: "Ilgaamžiškumas",
      radius: "Spindulys",
      price: "Kaina",
      stock: "Likutis",
    },
    sorts: {
      code: "Pagal kodą",
      priceAsc: "Kaina ↑",
      priceDesc: "Kaina ↓",
      oil: "Koncentracija ↓",
      sillage: "Ilgaamžiškumas ↓",
    },
  },
  cart: {
    title: "Jūsų krepšelis",
    checkoutTitle: "Atsiskaitymas",
    doneTitle: "Užsakymas priimtas",
    empty: "Krepšelis tuščias",
    emptySub: "Pradėkite nuo konsolės – sukonfigūruokite savo ekosistemą.",
    emptyCta: "Atidaryti konsolę",
    subtotal: "Tarpinė suma",
    bundle: "Tęstinumo atlygis −20 %",
    shipping: "Skubus Express pristatymas",
    free: "Nemokamai",
    total: "Iš viso",
    vat: "įskaitant PVM",
    toCheckout: "Pereiti prie apmokėjimo",
    back: "Atgal į krepšelį",
    remove: "Pašalinti",
    freeShipProgress: (left: string) => `Iki nemokamo pristatymo liko ${left}`,
    freeShipDone: "Skubus Express pristatymas jums – nemokamas",
    upsell: (node: string, saving: string) => `Pridėti ${node} · sutaupote ${saving}`,
    continue: "Tęsti apsipirkimą",
    demoBanner: "Bandomasis režimas: mokėjimas nevykdomas, užsakymas tik užfiksuojamas.",
  },
  tracker: {
    title: "Pristatymo kelias",
    steps: ["Užsakymas", "Paruošimas", "Skubus Express pristatymas kelyje", "Pristatyta"],
    short: ["Užsakymas", "Paruošimas", "Kelyje", "Pristatyta"],
    warehouse: "Vilniaus sandėlis",
    eta: "Numatomas pristatymas",
    dispatch: "Išsiuntimas",
    city: "Pristatymo miestas",
  },
  checkout: {
    contact: "Kontaktai",
    delivery: "Pristatymo adresas",
    payment: "Apmokėjimas",
    payHint: "Užpildykite duomenis ir pasirinkite mokėjimo būdą – užsakymas patvirtinamas vienu paspaudimu.",
    processing: "Apdorojama…",
    terms: "Susipažinau su pirkimo taisyklėmis ir privatumo politika bei sutinku su jomis.",
    fields: {
      firstName: "Vardas",
      lastName: "Pavardė",
      email: "El. paštas",
      phone: "Telefonas",
      address: "Adresas (gatvė, namo ir buto nr.)",
      city: "Miestas",
      postcode: "Pašto kodas",
      note: "Pastaba kurjeriui (neprivaloma)",
    },
    placeholders: {
      firstName: "Jonas",
      lastName: "Jonaitis",
      email: "jonas@pastas.lt",
      phone: "+370 600 00000",
      address: "Gedimino pr. 1-2",
      postcode: "01103",
    },
    doneTitle: "Ačiū – jūsų užsakymas priimtas",
    doneSub: (email: string) => `Patvirtinimą išsiųsime adresu ${email}.`,
    orderNo: "Užsakymo Nr.",
  },
  menu: {
    title: "Konfigūracijos indeksas",
    items: [
      { n: "01", label: "Konsolė", sub: "Sukonfigūruokite ekosistemą", href: "/#konsole" },
      { n: "02", label: "Terminalas", sub: "Filtruokite visą kolekciją", href: "/#terminalas" },
      { n: "03", label: "Apie mus", sub: "Vaidore vizija", href: "/apie-mus" },
      { n: "04", label: "Pristatymas ir grąžinimas", sub: "Sąlygos ir terminai", href: "/teisine-informacija/pristatymas-ir-grazinimas" },
      { n: "05", label: "Pirkimo taisyklės", sub: "Teisinė informacija", href: "/teisine-informacija/pirkimo-taisykles" },
      { n: "06", label: "Privatumo politika", sub: "Jūsų duomenys", href: "/teisine-informacija/privatumo-politika" },
    ],
    prefs: "Nustatymai",
    reduceMotion: "Sumažinti judesį",
    haptics: "Haptinis atsakas",
    close: "Uždaryti meniu",
    open: "Atidaryti meniu",
  },
  footer: {
    tagline: "Viena formulė. Žmogui, mašinai, namams.",
    rights: "Visos teisės saugomos.",
    perfumeNote: "Kvapai kuriami įkvėpti žinomų aromatų; Vaidore nėra susijusi su minimais prekių ženklais.",
  },
  common: {
    close: "Uždaryti",
    save: "Išsaugoti",
    cancel: "Atšaukti",
    delete: "Šalinti",
    edit: "Redaguoti",
    undo: "Atšaukti veiksmą",
    required: "Privalomas laukas",
    currency: "€",
  },
  a11y: { skip: "Pereiti prie turinio" },
} as const;

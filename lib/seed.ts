import type { Formula, Variant } from "./types";

/**
 * Pradiniai katalogo duomenys. Visos reikšmės redaguojamos valdymo stotyje (/admin/produktai).
 * Kainos – centais, su PVM.
 */

const v = (priceCents: number, oilPct: number, sillageHours: number, radiusM: number, stock: number): Variant => ({
  priceCents,
  oilPct,
  sillageHours,
  radiusM,
  stock,
});

const T0 = Date.UTC(2026, 0, 1);

export const SEED_FORMULAS: Formula[] = [
  {
    id: "f-540",
    code: "VD-540",
    name: "Vaidore Formula 540",
    inspiredBy: "Baccarat 540",
    profile: "Crimson Saffron",
    tagline: "Šafrano šiluma, sukristalizuota šviesoje.",
    description:
      "Švytintis šafrano ir jazmino atvėrimas, kuris nusileidžia į oro lengvumo gintarą. Formulė sukurta taip, kad išliktų tolygi – nuo rankos riešo iki automobilio salono ir svetainės.",
    notes: { top: ["šafranas", "jazminas"], heart: ["gintaras", "kedras"], base: ["muskusas", "eglės derva"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(6900, 22, 10, 1.5, 48), masinai: v(3900, 12, 240, 3, 9), namams: v(4900, 8, 480, 8, 31) },
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: "f-aventus",
    code: "VD-AVN",
    name: "Vaidore Formula Aventus",
    inspiredBy: "Creed Aventus",
    profile: "Metallic Musk",
    tagline: "Šaltas plienas, švarus ryto oras.",
    description:
      "Gaivus juodųjų serbentų ir bergamočių startas, nusėdantis ant dūminės beržo ir ąžuolo samanų bazės. Aštrus, tikslus, užtikrintas.",
    notes: { top: ["juodieji serbentai", "bergamotė"], heart: ["beržas", "ananasas"], base: ["ąžuolo samanos", "muskusas"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(7400, 21, 11, 1.6, 36), masinai: v(4200, 12, 260, 3, 22), namams: v(5200, 8, 500, 8, 14) },
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: "f-oudwood",
    code: "VD-OUD",
    name: "Vaidore Formula Oud Wood",
    inspiredBy: "Tom Ford Oud Wood",
    profile: "Woody Amber",
    tagline: "Tamsi mediena, ištraukta iš tylos.",
    description:
      "Rami, aksominė mediena su prieskonių atspindžiu: kardamonas ir rožinis pipiras pereina į agarą, palisandrą ir ilgai išliekantį gintarą.",
    notes: { top: ["kardamonas", "rožinis pipiras"], heart: ["agaras (oud)", "palisandras"], base: ["tonka pupelės", "vetiveras", "gintaras"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(7900, 23, 12, 1.5, 27), masinai: v(4400, 13, 280, 3, 11), namams: v(5600, 9, 520, 9, 19) },
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: "f-117",
    code: "VD-117",
    name: "Vaidore Formula 117",
    inspiredBy: null,
    profile: "Woody Amber",
    tagline: "Vakaro laužas ir sausas kedras.",
    description:
      "Originali Vaidore kompozicija: sausas kedras, rūkyta vanilė ir šiltas gintaras. Skirta tiems, kurie nori ramaus, bet įsimenamo parašo.",
    notes: { top: ["bergamotė", "juodasis pipiras"], heart: ["kedras", "tabakas"], base: ["gintaras", "vanilė"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(6400, 20, 9, 1.4, 40), masinai: v(3600, 11, 220, 3, 30), namams: v(4600, 8, 450, 7, 25) },
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: "f-214",
    code: "VD-214",
    name: "Vaidore Formula 214",
    inspiredBy: null,
    profile: "Crimson Saffron",
    tagline: "Raudonas šilkas, šafrano kibirkštis.",
    description:
      "Originali Vaidore kompozicija: šafranas, rožė ir pipirų švytėjimas, nusileidžiantis į minkštą muskuso pagrindą.",
    notes: { top: ["šafranas", "rožinis pipiras"], heart: ["rožė", "ciklameno žiedas"], base: ["muskusas", "sandalmedis"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(6600, 21, 10, 1.5, 33), masinai: v(3800, 12, 240, 3, 8), namams: v(4800, 8, 470, 8, 20) },
    createdAt: T0,
    updatedAt: T0,
  },
  {
    id: "f-308",
    code: "VD-308",
    name: "Vaidore Formula 308",
    inspiredBy: null,
    profile: "Metallic Musk",
    tagline: "Poliruotas plienas, tylus muskusas.",
    description:
      "Originali Vaidore kompozicija: švarus muskusas, metalinis citrusų blyksnis ir vetiverio gylis. Minimalistinė, bet ilgai išliekanti.",
    notes: { top: ["greipfrutas", "mėtos"], heart: ["geležinė žolė", "kedras"], base: ["baltasis muskusas", "vetiveras"] },
    imageUrl: "",
    active: true,
    variants: { zmogui: v(6200, 19, 9, 1.4, 45), masinai: v(3500, 10, 210, 3, 37), namams: v(4500, 7, 430, 7, 28) },
    createdAt: T0,
    updatedAt: T0,
  },
];

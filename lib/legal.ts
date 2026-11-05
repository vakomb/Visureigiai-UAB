import { COMMERCE, COMPANY } from "./config";
import { eur } from "./format";

export interface LegalDoc {
  slug: string;
  title: string;
  intro: string;
  sections: Array<{ h: string; p: string[] }>;
}

/**
 * Teisinių puslapių ŠABLONAI. Laukus [SKLIAUSTUOSE] ir visą tekstą prieš paleidžiant parduotuvę
 * būtina peržiūrėti su teisininku ir užpildyti tikrais įmonės duomenimis (lib/config.ts → COMPANY).
 */
export const LEGAL: LegalDoc[] = [
  {
    slug: "pristatymas-ir-grazinimas",
    title: "Pristatymas ir grąžinimas",
    intro: "Skubus Express pristatymas visoje Lietuvoje ir aiškios grąžinimo sąlygos.",
    sections: [
      {
        h: "Pristatymas",
        p: [
          `Siuntas pristatome visoje Lietuvoje Skubaus Express paslauga. Užsakymai, pateikti darbo dieną iki ${COMMERCE.dispatchCutoffHour}:00 (Lietuvos laiku), išsiunčiami tą pačią dieną; vėliau pateikti – kitą darbo dieną.`,
          "Pristatymo terminas – 1–3 darbo dienos, priklausomai nuo miesto. Tikslią numatomą datą matote krepšelyje prieš apmokėdami.",
          `Pristatymo kaina – ${eur(COMMERCE.shippingExpressCents)}. Užsakymams nuo ${eur(COMMERCE.freeShippingOverCents)} (po nuolaidų) pristatymas nemokamas.`,
        ],
      },
      {
        h: "Atsisakymo teisė",
        p: [
          "Pirkdami nuotoliniu būdu, turite teisę per 14 dienų nuo prekių gavimo atsisakyti sutarties nenurodydami priežasties.",
          "Dėl sveikatos apsaugos ir higienos priežasčių atsisakymo teisė netaikoma prekėms, kurių apsauginė pakuotė po pristatymo buvo atidaryta. Prašome grąžinti tik originalioje, neatidarytoje pakuotėje.",
          `Apie sprendimą atsisakyti sutarties informuokite el. paštu ${COMPANY.email}. Grąžinimo adresas: ${COMPANY.address}.`,
        ],
      },
      {
        h: "Pinigų grąžinimas",
        p: ["Pinigus grąžiname per 14 dienų nuo tos dienos, kai gavome grąžintas prekes, tuo pačiu mokėjimo būdu, kuriuo buvo atsiskaityta."],
      },
    ],
  },
  {
    slug: "pirkimo-taisykles",
    title: "Pirkimo taisyklės",
    intro: "Šios taisyklės taikomos perkant svetainėje vaidore.lt.",
    sections: [
      {
        h: "Pardavėjas",
        p: [
          `${COMPANY.name}, įmonės kodas ${COMPANY.code}, PVM mokėtojo kodas ${COMPANY.vat}, buveinės adresas ${COMPANY.address}. El. paštas ${COMPANY.email}, tel. ${COMPANY.phone}.`,
        ],
      },
      {
        h: "Kainos ir užsakymas",
        p: [
          `Visos kainos nurodytos eurais ir įskaičiuoja ${Math.round(COMMERCE.vatRate * 100)} % PVM. Ekosistemos tęstinumo atlygis (−${Math.round(COMMERCE.bundleRate * 100)} %) taikomas, kai krepšelyje yra ta pati formulė visiems trims mazgams: ŽMOGUI, MAŠINAI ir NAMAMS.`,
          "Sutartis laikoma sudaryta, kai pateikiate užsakymą ir gaunate jo patvirtinimą el. paštu.",
        ],
      },
      {
        h: "Prekių atitikimas ir garantija",
        p: [
          "Pardavėjas atsako už prekių, neatitinkančių sutarties, trūkumus Lietuvos Respublikos teisės aktų nustatyta tvarka.",
          "Aprašymuose minimi garsūs aromatai nurodomi tik kaip įkvėpimo šaltinis. Vaidore nėra susijusi su minimais prekių ženklais ir jų savininkais. [Teisininkas turi patikrinti, ar tokios nuorodos atitinka ES reglamentavimą dėl palyginamosios reklamos.]",
        ],
      },
      {
        h: "Ginčų sprendimas",
        p: [
          "Ginčus siekiame spręsti derybomis. Vartotojas taip pat gali kreiptis į Valstybinę vartotojų teisių apsaugos tarnybą (vvtat.lt) arba pasinaudoti ES ginčų sprendimo internetu platforma.",
        ],
      },
    ],
  },
  {
    slug: "privatumo-politika",
    title: "Privatumo politika",
    intro: "Kaip tvarkome jūsų asmens duomenis.",
    sections: [
      {
        h: "Duomenų valdytojas",
        p: [`${COMPANY.name}, ${COMPANY.address}, ${COMPANY.email}.`],
      },
      {
        h: "Kokius duomenis tvarkome",
        p: [
          "Užsakymo metu – vardą, pavardę, el. paštą, telefono numerį, pristatymo adresą ir užsakymo turinį. Tikslas – įvykdyti sutartį ir pristatyti prekes (teisinis pagrindas – sutarties vykdymas), taip pat vykdyti apskaitos prievoles.",
          "Duomenis saugome tiek, kiek reikalauja teisės aktai (buhalterinės apskaitos dokumentus – nustatytą laikotarpį), o vėliau ištriname.",
        ],
      },
      {
        h: "Naršyklės saugykla",
        p: [
          "Svetainė jūsų įrenginyje (localStorage) saugo tik būtinus duomenis: krepšelio turinį, užsakymo formos laukus ir vaizdo nuostatas. Sekimo slapukų ar trečiųjų šalių analitikos nenaudojame.",
        ],
      },
      {
        h: "Jūsų teisės",
        p: [
          "Turite teisę susipažinti su duomenimis, juos ištaisyti, ištrinti, apriboti tvarkymą, perkelti duomenis bei nesutikti su tvarkymu. Kreipkitės el. paštu. Taip pat turite teisę pateikti skundą Valstybinei duomenų apsaugos inspekcijai (vdai.lrv.lt).",
        ],
      },
    ],
  },
];

export const legalBySlug = (slug: string) => LEGAL.find((d) => d.slug === slug);

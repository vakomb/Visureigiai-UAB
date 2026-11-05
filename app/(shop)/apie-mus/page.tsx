import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { IconCar, IconHome, IconUser } from "@/components/ui/Icon";
import { COMMERCE } from "@/lib/config";
import { SEED_FORMULAS } from "@/lib/seed";
import type { NodeId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Apie mus",
  description:
    "Vaidore vizija: iškilių aromatų molekulinę architektūrą paverčiame žmogaus parašu, automobilio inžinerija ir gyvenamosios erdvės elementu.",
  alternates: { canonical: "/apie-mus" },
};

/** Diapazonai skaičiuojami iš tikro pradinio katalogo – tekstas niekada nesiskiria nuo duomenų. */
function range(node: NodeId, pick: "oilPct" | "sillageHours" | "radiusM") {
  const values = SEED_FORMULAS.map((f) => f.variants[node][pick]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const f = (n: number) => String(n).replace(".", ",");
  return min === max ? f(min) : `${f(min)}–${f(max)}`;
}

const SPACES = [
  {
    id: "zmogui" as const,
    n: "01",
    title: "Žmogui",
    Icon: IconUser,
    body: "Tai, kas lieka kambaryje, kai jūs jau išėjote. Parfumuotas ekstraktas sukurtas taip, kad nuo pirmo įspūdžio iki vakaro išliktų tas pats – tolygus, ryškus ir asmeniškas.",
    spec: (n: NodeId) => `${range(n, "oilPct")} % aliejų · iki ${range(n, "sillageHours").split("–").pop()} val. · ${range(n, "radiusM")} m aura`,
  },
  {
    id: "masinai" as const,
    n: "02",
    title: "Mašinai",
    Icon: IconCar,
    body: "Automobilio salonas – uždara, tiksliai išmatuota erdvė. Čia kvapas elgiasi kaip inžinerinis sprendimas: dozuojamas, stabilus ir nepersotinantis kelionės metu.",
    spec: (n: NodeId) => `${range(n, "oilPct")} % aliejų · ${range(n, "sillageHours")} val. · ${range(n, "radiusM")} m salono aprėptis`,
  },
  {
    id: "namams" as const,
    n: "03",
    title: "Namams",
    Icon: IconHome,
    body: "Namai turi savo ritmą. Difuzorius paverčia tą patį molekulinį parašą ramia, pastoviai juntama atmosfera – be aštrių viršūnių, be skubos.",
    spec: (n: NodeId) => `${range(n, "oilPct")} % aliejų · ${range(n, "sillageHours")} val. · ${range(n, "radiusM")} m patalpos aprėptis`,
  },
];

const PRINCIPLES = [
  ["Tikslumas", "Kiekvienas skaičius – koncentracija, ilgaamžiškumas, spindulys – rodomas atvirai ir skaičiuojamas gyvai. Jokių miglotų pažadų."],
  ["Tęstinumas", "Vienas kvapas visose jūsų erdvėse. Todėl už vientisumą atlyginame – ne kaip už akciją, o kaip už pasirinktą nuoseklumą."],
  ["Ramybė", "Be triukšmo, be dirbtinio skubėjimo. Rodome tik tikrus likučius ir realų išsiuntimo laiką."],
  ["Pagarba", "Jūsų duomenys lieka jūsų. Krepšelis ir nuostatos saugomos jūsų įrenginyje, o ne sekimo sistemose."],
];

export default function AboutPage() {
  const pct = Math.round(COMMERCE.bundleRate * 100);

  return (
    <article>
      {/* 1 · Įžanga */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-24">
        <Reveal>
          <p className="eyebrow">Apie mus</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-5 max-w-4xl font-display text-[52px] font-medium leading-[0.94] tracking-tight sm:text-[104px]">
            Kvapas kaip <em className="font-normal italic">parašas.</em>
          </h1>
        </Reveal>
        <div className="mt-12 grid gap-8 md:grid-cols-12">
          <Reveal className="md:col-span-5 md:col-start-8" delay={0.1}>
            <p className="text-[18px] leading-relaxed text-ink/75 sm:text-[20px]">
              Vaidore iškilių aromatų molekulinę architektūrą paverčia trimis kasdienėmis erdvėmis: žmogumi,
              automobiliu ir namais. Vienas kūrinys – nuosekliai, tiksliai ir be kompromisų.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 · Mintis trimis žodžiais – didelio kontrasto tinklelis */}
      <section aria-label="Pagrindinė mintis" className="border-y border-ink">
        <div className="mx-auto grid max-w-6xl md:grid-cols-3">
          {[
            ["Molekulė", "Pradedame nuo kvapo sandaros: kas jį daro atpažįstamą, ilgaamžį ir gilų."],
            ["Parašas", "Tą sandarą pritaikome žmogui – kaip asmeninį, atpažįstamą ženklą."],
            ["Erdvė", "Ir tą patį ženklą pratęsiame ten, kur praleidžiate laiką: kelyje ir namuose."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className={`p-8 sm:p-12 ${i > 0 ? "border-t border-ink md:border-l md:border-t-0" : ""}`}>
              <p className="font-mono text-[12px] text-ink/45">0{i + 1}</p>
              <h2 className="mt-10 font-display text-[40px] font-medium leading-none sm:text-[52px]">{t}</h2>
              <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink/65">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 · Trys erdvės – tamsi sekcija */}
      <section aria-labelledby="spaces-title" className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
          <Reveal>
            <p className="eyebrow text-white/45">Trys erdvės</p>
            <h2 id="spaces-title" className="mt-4 max-w-3xl font-display text-[40px] font-medium leading-[1] tracking-tight sm:text-[72px]">
              Vienas kvapas. Trys inžinerinės užduotys.
            </h2>
          </Reveal>

          <div className="mt-16 border-t border-white/20">
            {SPACES.map(({ id, n, title, Icon, body, spec }, i) => (
              <Reveal key={id} delay={i * 0.05}>
                <div className="grid gap-6 border-b border-white/20 py-10 sm:py-14 md:grid-cols-12 md:gap-10">
                  <div className="flex items-start gap-4 md:col-span-4">
                    <span className="font-mono text-[12px] text-white/40">{n}</span>
                    <div>
                      <Icon size={28} className="text-white/80" />
                      <h3 className="mt-4 font-display text-[44px] font-medium leading-none sm:text-[56px]">{title}</h3>
                    </div>
                  </div>
                  <p className="text-[16px] leading-relaxed text-white/70 md:col-span-5 sm:text-[17px]">{body}</p>
                  <p className="font-mono text-[12px] uppercase leading-relaxed tracking-wider text-white/45 md:col-span-3">
                    {spec(id)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Tęstinumo atlygis */}
      <section aria-labelledby="reward-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="eyebrow">Ekosistemos tęstinumo atlygis</p>
            <h2 id="reward-title" className="mt-4 font-display text-[40px] font-medium leading-[1] tracking-tight sm:text-[60px]">
              −{pct} % už vientisumą.
            </h2>
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
            <p className="text-[17px] leading-relaxed text-ink/75">
              Kai tą pačią formulę pasirenkate visoms trims erdvėms – žmogui, mašinai ir namams – gaunate {pct} %
              atlygį. Tai ne išpardavimas, o padėka už nuoseklumą: kvapas, kuris jus lydi nuo ryto iki vakaro, nuo
              kelio iki slenksčio.
            </p>
            <ol className="mt-8 divide-y divide-black/10 border-y border-black/10">
              {[
                "Pasirinkite formulę konsolėje.",
                "Sujunkite visus tris mazgus – tiltas sinchronizuojasi akimirksniu.",
                `Atlygis −${pct} % pritaikomas automatiškai, o Skubus Express pristatymas – nemokamas.`,
              ].map((t, i) => (
                <li key={t} className="flex gap-5 py-4 text-[15px]">
                  <span className="font-mono text-[12px] text-ink/40">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 5 · Principai – 2×2 tinklelis */}
      <section aria-label="Principai" className="border-t border-ink">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-2">
          {PRINCIPLES.map(([t, d], i) => (
            <Reveal
              key={t}
              delay={(i % 2) * 0.08}
              className={`border-ink p-8 sm:p-12 ${i % 2 === 1 ? "sm:border-l" : ""} ${i > 0 ? "border-t sm:border-t-0" : ""} ${i > 1 ? "sm:border-t" : ""}`}
            >
              <p className="font-mono text-[12px] text-ink/45">0{i + 1}</p>
              <h3 className="mt-8 font-display text-[36px] font-medium leading-none">{t}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink/65">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6 · Kvietimas */}
      <section className="border-t border-ink bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-20 sm:px-6 sm:py-28 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-display text-[40px] font-medium leading-[1] tracking-tight sm:text-[64px]">
            Sukonfigūruokite savo ekosistemą.
          </h2>
          <Link href="/#konsole" className="ios-btn h-14 px-8 text-[16px]">
            Atidaryti konsolę →
          </Link>
        </div>
      </section>
    </article>
  );
}

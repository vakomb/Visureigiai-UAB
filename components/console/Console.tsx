"use client";

import { T } from "@/lib/copy";
import { useShopFormulas } from "@/lib/stores/catalog";
import { useConsoleStore } from "@/lib/stores/ui";
import { CrystalStage } from "./CrystalStage";
import { EcosystemBridge } from "./EcosystemBridge";
import { FormulaPicker } from "./FormulaPicker";
import { Ledger } from "./Ledger";
import { NodeTabs } from "./NodeTabs";
import { useActiveFormula } from "./useActive";

/**
 * Trijų mazgų 3D daugiavisatos konsolė – pagrindinio puslapio širdis.
 * Visi blokai turi fiksuotus matmenis: keičiant mazgą ar formulę keičiasi tik turinys, ne išdėstymas.
 */
export function Console() {
  const formulas = useShopFormulas();
  const formula = useActiveFormula();
  const node = useConsoleStore((s) => s.node);

  return (
    <section id="konsole" aria-labelledby="hero-title" className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12">
      <header className="mb-6 max-w-2xl sm:mb-8">
        <p className="eyebrow">{T.hero.eyebrow}</p>
        <h1
          id="hero-title"
          className="mt-3 font-display text-[44px] font-medium leading-[0.96] tracking-tight sm:text-[68px]"
        >
          {T.hero.title}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/60 sm:text-[16px]">{T.hero.sub}</p>
      </header>

      <NodeTabs />

      {formula ? (
        <div
          id="node-panel"
          role="tabpanel"
          aria-labelledby={`tab-${node}`}
          className="mt-4 grid items-start gap-4 lg:grid-cols-[1.05fr_1fr]"
        >
          <div className="lg:sticky lg:top-24">
            <CrystalStage formula={formula} node={node} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <FormulaPicker />
            <Ledger formula={formula} node={node} />
            <EcosystemBridge formula={formula} node={node} />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid h-80 place-items-center rounded-[32px] border border-dashed border-black/15 text-center text-ink/55">
          <p>
            Kolekcija ruošiama.
            <br />
            {formulas.length === 0 && "Netrukus čia atsiras naujos formulės."}
          </p>
        </div>
      )}
    </section>
  );
}

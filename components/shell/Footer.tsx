import Link from "next/link";
import { Mark } from "@/components/ui/Icon";
import { T } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white pb-32 pt-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="text-[15px] font-medium uppercase tracking-[0.42em]">Vaidore</span>
          </div>
          <p className="mt-4 max-w-xs font-display text-[22px] leading-snug text-ink/80">{T.footer.tagline}</p>
        </div>
        <nav aria-label="Svetainė">
          <p className="eyebrow mb-3">Svetainė</p>
          <ul className="space-y-2 text-[14px] text-ink/70">
            <li><Link className="hover:text-ink" href="/#konsole">Konsolė</Link></li>
            <li><Link className="hover:text-ink" href="/#terminalas">Terminalas</Link></li>
            <li><Link className="hover:text-ink" href="/apie-mus">Apie mus</Link></li>
          </ul>
        </nav>
        <nav aria-label="Teisinė informacija">
          <p className="eyebrow mb-3">Informacija</p>
          <ul className="space-y-2 text-[14px] text-ink/70">
            <li><Link className="hover:text-ink" href="/teisine-informacija/pristatymas-ir-grazinimas">Pristatymas ir grąžinimas</Link></li>
            <li><Link className="hover:text-ink" href="/teisine-informacija/pirkimo-taisykles">Pirkimo taisyklės</Link></li>
            <li><Link className="hover:text-ink" href="/teisine-informacija/privatumo-politika">Privatumo politika</Link></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-black/5 px-4 pt-6 text-[12px] leading-relaxed text-ink/45 sm:px-6">
        <p>© {new Date().getFullYear()} Vaidore · vaidore.lt. {T.footer.rights}</p>
        <p className="mt-1 max-w-2xl">{T.footer.perfumeNote}</p>
      </div>
    </footer>
  );
}

"use client";

import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ToastHost } from "@/components/shell/ToastHost";
import { IconBox, IconChart, IconInvoice, Mark } from "@/components/ui/Icon";
import { cx } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";

const NAV = [
  { href: "/admin", label: "Apžvalga", short: "Apžvalga", Icon: IconChart, exact: true },
  { href: "/admin/produktai", label: "Produktų matrica", short: "Produktai", Icon: IconBox, exact: false },
  { href: "/admin/uzsakymai", label: "Užsakymų knyga", short: "Užsakymai", Icon: IconInvoice, exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-svh bg-[#f5f5f3]">
      {/* Staliniai kompiuteriai: šoninė juosta */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-6">
          <Mark />
          <span className="text-[14px] font-medium uppercase tracking-[0.36em]">Vaidore</span>
        </div>
        <p className="eyebrow px-6 pb-2 pt-4">Valdymo stotis</p>
        <LayoutGroup id="admin-nav">
          <nav className="flex-1 space-y-1 px-3" aria-label="Valdymo navigacija">
            {NAV.map(({ href, label, Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cx(
                    "relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors",
                    active ? "text-white" : "text-ink/65 hover:bg-black/[0.04] hover:text-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-pill"
                      transition={SPRING_TACTILE}
                      className="absolute inset-0 rounded-xl bg-ink"
                    />
                  )}
                  <Icon size={19} className="relative" />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>
        <div className="space-y-3 border-t border-black/5 p-4">
          <p className="text-[11.5px] leading-snug text-ink/50">
            Duomenys saugomi šio įrenginio naršyklėje. Padarykite atsarginę kopiją (Produktų matrica → Eksportuoti).
          </p>
          <Link href="/" className="ios-btn-ghost w-full text-[13px]">
            Atidaryti parduotuvę ↗
          </Link>
        </div>
      </aside>

      {/* Telefonai: viršutinė juosta */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <Mark size={20} />
          <span className="text-[13px] font-medium uppercase tracking-[0.3em]">Vaidore</span>
        </div>
        <Link href="/" className="text-[13px] font-medium text-ink/60">
          Parduotuvė ↗
        </Link>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-8 lg:ml-64 lg:pb-14 lg:pt-10">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>

      {/* Telefonai: apatinė navigacija */}
      <nav
        aria-label="Valdymo navigacija"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-black/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        {NAV.map(({ href, short, Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-ink" : "text-ink/45",
              )}
            >
              <Icon size={22} />
              {short}
            </Link>
          );
        })}
      </nav>
      <ToastHost />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CartPanel } from "@/components/cart/CartPanel";
import { ParticleLayer } from "@/components/system/ParticleLayer";
import { T } from "@/lib/copy";
import { FloatingTray } from "./FloatingTray";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MenuPanel } from "./MenuPanel";
import { ToastHost } from "./ToastHost";

/** Paslapčia įkelia dažniausiai lankomus maršrutus, kad navigacija būtų akimirksniu. */
function Prefetcher() {
  const router = useRouter();
  useEffect(() => {
    const routes = ["/apie-mus", "/teisine-informacija/pristatymas-ir-grazinimas"];
    const run = () => routes.forEach((r) => router.prefetch(r));
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(run, 1500);
    return () => window.clearTimeout(id);
  }, [router]);
  return null;
}

/** Vieno puslapio „native“ apvalkalas: antraštė, skydai, dalelių sluoksnis ir krepšelio juosta išlieka vietoje. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-xl bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {T.a11y.skip}
      </a>
      <Header />
      <main id="main" className="pt-16">
        {children}
      </main>
      <Footer />
      <MenuPanel />
      <CartPanel />
      <FloatingTray />
      <ToastHost />
      <ParticleLayer />
      <Prefetcher />
    </>
  );
}

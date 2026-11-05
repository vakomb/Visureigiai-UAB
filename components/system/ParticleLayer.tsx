"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useReduceMotion } from "@/hooks/useMotionPref";
import { onBurst, type BurstDetail } from "@/lib/fx";
import { useUIStore } from "@/lib/stores/ui";

interface Particle {
  xs: number[];
  ys: number[];
  size: number;
  delay: number;
  duration: number;
}
interface Burst {
  id: number;
  color: string;
  from: { x: number; y: number };
  particles: Particle[];
}

const COUNT = 14;
const SAMPLES = 9;
let seq = 0;

function targetPoint(): { x: number; y: number } {
  const tray = document.querySelector<HTMLElement>("[data-cart-tray]");
  if (tray) {
    const r = tray.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  // Juosta dar nepasirodė (pirmas įdėjimas) – skrendame ten, kur ji iššoks.
  return { x: window.innerWidth / 2, y: window.innerHeight - 44 };
}

/** Kvadratinė Bezjė kreivė (P0 → C → P2), diskretizuota raktiniams kadrams. */
function path(from: { x: number; y: number }, to: { x: number; y: number }, bend: number) {
  const cx = (from.x + to.x) / 2 + bend;
  const cy = Math.min(from.y, to.y) - 90 - Math.abs(bend) * 0.4;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const u = 1 - t;
    xs.push(u * u * 0 + 2 * u * t * (cx - from.x) + t * t * (to.x - from.x));
    ys.push(u * u * 0 + 2 * u * t * (cy - from.y) + t * t * (to.y - from.y));
  }
  return { xs, ys };
}

/**
 * „Cart Injection“ dalelių srautas: mikro dalelės išlekia iš paspausto mygtuko
 * ir kreive nuskrenda į apatinę krepšelio juostą, kuri tada „suvirpa“.
 */
export function ParticleLayer() {
  const reduce = useReduceMotion();
  const bumpPulse = useUIStore((s) => s.bumpPulse);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const spawn = useCallback(
    (detail: BurstDetail) => {
      const to = targetPoint();
      const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
        const bend = (Math.random() - 0.5) * 220;
        const { xs, ys } = path(detail.from, to, bend);
        return {
          xs,
          ys,
          size: 4 + Math.random() * 5,
          delay: i * 0.018,
          duration: 0.62 + Math.random() * 0.28,
        };
      });
      const id = ++seq;
      setBursts((b) => [...b.slice(-3), { id, color: detail.color, from: detail.from, particles }]);
      // Krepšelio juosta pulsuoja, kai dalelės nusileidžia.
      window.setTimeout(bumpPulse, 780);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1500);
    },
    [bumpPulse],
  );

  useEffect(() => (reduce ? undefined : onBurst(spawn)), [reduce, spawn]);

  // Su sumažintu judesiu – tik pulsavimas be dalelių.
  useEffect(() => {
    if (!reduce) return;
    return onBurst(() => {
      window.setTimeout(bumpPulse, 120);
    });
  }, [reduce, bumpPulse]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {bursts.map((b) => {
        return b.particles.map((p, i) => (
          <motion.span
            key={`${b.id}-${i}`}
            className="absolute block rounded-full"
            style={{
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              background: b.color,
              boxShadow: `0 0 12px ${b.color}`,
              left: b.from.x,
              top: b.from.y,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: p.xs,
              y: p.ys,
              opacity: [0, 1, 1, 1, 1, 1, 0.9, 0.7, 0],
              scale: [0.4, 1, 1, 0.95, 0.9, 0.8, 0.7, 0.55, 0.3],
            }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeInOut" }}
          />
        ));
      })}
    </div>
  );
}

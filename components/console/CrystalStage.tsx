"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useSpring,
  type MotionStyle,
  type PanInfo,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useReduceMotion } from "@/hooks/useMotionPref";
import { NODES, PROFILE_STYLE } from "@/lib/copy";
import { clamp } from "@/lib/format";
import { SPRING_SOFT } from "@/lib/motion";
import type { Formula, NodeId } from "@/lib/types";

/** Kiekvieno mazgo geometrija: konteineris „morfina“ tarp formų. */
const GEOM: Record<NodeId, { R: number; H: number; capR: number; capH: number; fill: number; reeds: number }> = {
  zmogui: { R: 50, H: 176, capR: 0.46, capH: 30, fill: 0.7, reeds: 0 },
  masinai: { R: 68, H: 104, capR: 0.9, capH: 14, fill: 0.62, reeds: 0 },
  namams: { R: 76, H: 148, capR: 0.4, capH: 22, fill: 0.76, reeds: 1 },
};

const FACES = [0, 1, 2, 3, 4, 5] as const;
const REEDS = [-15, -7, 1, 8, 16] as const;

const v = (o: Record<string, string | number>) => o as CSSProperties;

/** Šešiakampė prizmė iš 6 CSS 3D sienų + dviejų dangtelių. */
function Prism({
  faceClass,
  topClass,
  bottomClass,
  style,
  topY,
  bottomY,
}: {
  faceClass: string;
  topClass: string;
  bottomClass: string;
  style: CSSProperties;
  topY: string;
  bottomY: string;
}) {
  return (
    <div className="cx-part" style={style}>
      {FACES.map((i) => (
        <div key={i} className={`cx-face ${faceClass}`} style={v({ "--i": i })} />
      ))}
      <div className={`cx-plate ${topClass}`} style={v({ "--ty": topY })} />
      <div className={`cx-plate ${bottomClass}`} style={v({ "--ty": bottomY })} />
    </div>
  );
}

export function CrystalStage({ formula, node }: { formula: Formula; node: NodeId }) {
  const reduce = useReduceMotion();
  const g = GEOM[node];
  const profile = PROFILE_STYLE[formula.profile];

  // Geometrija – spyruoklinės reikšmės; CSS kintamieji perskaičiuoja visas sienas kiekvieną kadrą.
  const R = useSpring(g.R, SPRING_SOFT);
  const H = useSpring(g.H, SPRING_SOFT);
  const capR = useSpring(g.capR, SPRING_SOFT);
  const capH = useSpring(g.capH, SPRING_SOFT);
  const fill = useSpring(g.fill, SPRING_SOFT);
  const reeds = useSpring(g.reeds, { stiffness: 90, damping: 20 });

  useEffect(() => {
    R.set(g.R);
    H.set(g.H);
    capR.set(g.capR);
    capH.set(g.capH);
    fill.set(g.fill);
    reeds.set(g.reeds);
  }, [g, R, H, capR, capH, fill, reeds]);

  // Sukimas: inercinė spyruoklė + automatinis lėtas sukimasis.
  const rotTarget = useMotionValue(-28);
  const tiltTarget = useMotionValue(-10);
  const rot = useSpring(rotTarget, { stiffness: 80, damping: 15, mass: 0.9 });
  const tilt = useSpring(tiltTarget, { stiffness: 80, damping: 15, mass: 0.9 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sceneRef);
  const interacting = useRef(false);
  const [touched, setTouched] = useState(false);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || interacting.current) return;
    rotTarget.set(rotTarget.get() + delta * 0.011);
  });

  const onPanStart = () => {
    interacting.current = true;
    setTouched(true);
  };
  const onPan = (_: PointerEvent, info: PanInfo) => {
    rotTarget.set(rotTarget.get() + info.delta.x * 0.75);
    tiltTarget.set(clamp(tiltTarget.get() - info.delta.y * 0.18, -34, 14));
  };
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    rotTarget.set(rotTarget.get() + info.velocity.x * 0.07);
    tiltTarget.set(-10);
    window.setTimeout(() => {
      interacting.current = false;
    }, 900);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") rotTarget.set(rotTarget.get() - 30);
    if (e.key === "ArrowRight") rotTarget.set(rotTarget.get() + 30);
    if (e.key === "ArrowUp") tiltTarget.set(clamp(tiltTarget.get() + 8, -34, 14));
    if (e.key === "ArrowDown") tiltTarget.set(clamp(tiltTarget.get() - 8, -34, 14));
  };

  const vars = {
    "--r": R,
    "--h": H,
    "--cr": capR,
    "--ch": capH,
    "--fill": fill,
    "--reeds": reeds,
    "--lq1": profile.lq1,
    "--lq2": profile.lq2,
    touchAction: "pan-y",
  } as unknown as MotionStyle;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-black/5 bg-gradient-to-b from-white to-[#f3f2ef]">
      <div aria-hidden className="scanlines absolute inset-0 opacity-70 mask-fade-y" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[44%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl transition-colors duration-700"
        style={{ background: `radial-gradient(circle, ${profile.lq1}55, transparent 68%)` }}
      />

      <motion.div
        ref={sceneRef}
        role="img"
        tabIndex={0}
        aria-label={`Trimatis ${NODES[node].product.toLowerCase()} – ${formula.name}. Tempkite arba naudokite rodykles, kad pasuktumėte.`}
        onKeyDown={onKeyDown}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        style={vars}
        className="cx-scene relative h-[340px] origin-[50%_45%] scale-[0.9] cursor-grab select-none active:cursor-grabbing sm:h-[430px] sm:scale-100"
      >
        <div className="cx-shadow" />
        <motion.div className="cx-stage" style={{ rotateX: tilt, rotateY: rot, top: "55%" }}>
            {/* Stiklinis korpusas */}
            <Prism
              faceClass="cx-glass"
              topClass="cx-glass-plate"
              bottomClass="cx-glass-plate"
              topY="calc(var(--h) * -0.5)"
              bottomY="calc(var(--h) * 0.5)"
              style={v({ "--fw": "var(--r)", "--fh": "var(--h)", "--fr": "var(--r)" })}
            />
            {/* Skystis */}
            <Prism
              faceClass="cx-liquid"
              topClass="cx-liquid-top"
              bottomClass="cx-liquid"
              topY="calc(var(--h) * var(--fill) * -0.5)"
              bottomY="calc(var(--h) * var(--fill) * 0.5)"
              style={v({
                "--fw": "calc(var(--r) * 0.8)",
                "--fr": "calc(var(--r) * 0.8)",
                "--fh": "calc(var(--h) * var(--fill))",
                transform: "translateY(calc((var(--h) * 0.5 - var(--h) * var(--fill) * 0.5) * 1px - 5px))",
              })}
            />
            {/* Metalinis dangtelis */}
            <Prism
              faceClass="cx-metal"
              topClass="cx-metal-plate"
              bottomClass="cx-metal"
              topY="calc(var(--ch) * -0.5)"
              bottomY="calc(var(--ch) * 0.5)"
              style={v({
                "--fw": "calc(var(--r) * var(--cr))",
                "--fr": "calc(var(--r) * var(--cr))",
                "--fh": "var(--ch)",
                transform: "translateY(calc((var(--h) * -0.5 - var(--ch) * 0.5) * 1px))",
              })}
            />
            {/* Lazdelės (tik NAMAMS) */}
            <div
              className="cx-part"
              style={v({ transform: "translateY(calc((var(--h) * -0.5 - var(--ch)) * 1px))" })}
              aria-hidden
            >
              {REEDS.map((a, j) => (
                <div key={j} className="cx-reed" style={v({ "--j": j, "--a": `${a}deg`, opacity: "var(--reeds)" })} />
              ))}
            </div>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="truncate font-display text-[22px] leading-none sm:text-[26px]">{formula.name}</p>
          <p className="mt-1.5 truncate font-mono text-[11px] uppercase tracking-wider text-ink/50">
            {formula.code} · {NODES[node].label} · {NODES[node].unit}
          </p>
        </div>
        <p
          className={`shrink-0 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-medium text-ink/55 backdrop-blur transition-opacity duration-500 ${
            touched ? "opacity-0" : "opacity-100"
          }`}
        >
          Tempkite ↔
        </p>
      </div>
    </div>
  );
}

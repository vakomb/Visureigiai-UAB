"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { COMMERCE } from "@/lib/config";
import { NODES, STATUS_LABEL } from "@/lib/copy";
import { buildDemoOrders } from "@/lib/demo";
import { eur, fmtDateTime, int, pct } from "@/lib/format";
import { useAllFormulas } from "@/lib/stores/catalog";
import { useOrdersStore } from "@/lib/stores/orders";
import { useUIStore } from "@/lib/stores/ui";
import { NODE_IDS, ORDER_STATUSES, type Order } from "@/lib/types";
import { Card, PageHead, StatusBadge } from "./parts";

const dayKey = (ts: number) => new Intl.DateTimeFormat("sv-SE", { timeZone: COMMERCE.timezone }).format(new Date(ts));

function RevenueChart({ orders }: { orders: Order[] }) {
  const days = useMemo(() => {
    const out: Array<{ key: string; label: string; cents: number; count: number }> = [];
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const ts = now - i * 86_400_000;
      out.push({ key: dayKey(ts), label: dayKey(ts).slice(8), cents: 0, count: 0 });
    }
    for (const o of orders) {
      const d = out.find((x) => x.key === dayKey(o.createdAt));
      if (d) {
        d.cents += o.totalCents;
        d.count += 1;
      }
    }
    return out;
  }, [orders]);

  const max = Math.max(1, ...days.map((d) => d.cents));
  const W = 560;
  const H = 150;
  const bw = W / days.length;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-auto w-full" role="img" aria-label="Pajamos per paskutines 14 dienų">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1="0" x2={W} y1={H - H * t} y2={H - H * t} stroke="rgb(10 10 11 / 0.06)" />
      ))}
      {days.map((d, i) => {
        const h = Math.max(d.cents > 0 ? 4 : 1, (d.cents / max) * (H - 6));
        return (
          <g key={d.key}>
            <rect x={i * bw + 6} y={H - h} width={bw - 12} height={h} rx={4} fill={d.cents > 0 ? "#0a0a0b" : "rgb(10 10 11 / 0.1)"}>
              <title>{`${d.key}: ${eur(d.cents)} · ${d.count} užs.`}</title>
            </rect>
            <text x={i * bw + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="rgb(10 10 11 / 0.45)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Overview() {
  const hydrated = useUIStore((s) => s.hydrated);
  const orders = useOrdersStore((s) => s.orders);
  const nextSeq = useOrdersStore((s) => s.nextSeq);
  const addMany = useOrdersStore((s) => s.addMany);
  const removeDemo = useOrdersStore((s) => s.removeDemo);
  const formulas = useAllFormulas();
  const toast = useUIStore((s) => s.toast);

  const valid = useMemo(() => orders.filter((o) => o.status !== "atsauktas"), [orders]);
  const revenue = valid.reduce((s, o) => s + o.totalCents, 0);
  const aov = valid.length ? revenue / valid.length : 0;
  const bundleShare = valid.length ? (valid.filter((o) => o.bundleSets > 0).length / valid.length) * 100 : 0;
  const open = orders.filter((o) => ["naujas", "apmoketas", "ruosiamas"].includes(o.status)).length;
  const hasDemo = orders.some((o) => o.demo);

  const lowStock = useMemo(
    () =>
      formulas.flatMap((f) =>
        NODE_IDS.filter((n) => f.variants[n].stock <= COMMERCE.lowStockThreshold).map((n) => ({
          f,
          n,
          stock: f.variants[n].stock,
        })),
      ).sort((a, b) => a.stock - b.stock),
    [formulas],
  );

  const kpis = [
    { label: "Pajamos", value: revenue, fmt: (n: number) => eur(Math.round(n)), hint: "be atšauktų" },
    { label: "Užsakymai", value: valid.length, fmt: (n: number) => int(Math.round(n)), hint: `${open} laukia vykdymo` },
    { label: "Vid. krepšelis", value: aov, fmt: (n: number) => eur(Math.round(n)), hint: "vienam užsakymui" },
    { label: "Ekosistemos rinkiniai", value: bundleShare, fmt: (n: number) => pct(n), hint: "užsakymų su −20 % atlygiu" },
  ];

  return (
    <>
      <PageHead
        title="Apžvalga"
        sub="Gyvi pardavimų, užsakymų ir likučių rodikliai."
        actions={
          hasDemo ? (
            <button type="button" onClick={() => { removeDemo(); toast("Demonstraciniai užsakymai pašalinti"); }} className="ios-btn-ghost">
              Pašalinti demonstracinius
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { addMany(buildDemoOrders(formulas, nextSeq)); toast("Įkelti demonstraciniai užsakymai"); }}
              className="ios-btn-ghost"
            >
              Įkelti demonstracinius užsakymus
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 sm:p-5">
            <p className="text-[12px] text-ink/50">{k.label}</p>
            <p className="mt-3 font-mono text-[24px] font-medium leading-none tracking-tight sm:text-[30px]">
              {hydrated ? <AnimatedNumber value={k.value} format={k.fmt} /> : " "}
            </p>
            <p className="mt-2 text-[11.5px] text-ink/40">{k.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold">Pajamos per 14 dienų</p>
            <p className="font-mono text-[11px] text-ink/40">EUR</p>
          </div>
          <RevenueChart orders={valid} />
        </Card>

        <Card className="p-5">
          <p className="mb-4 text-[14px] font-semibold">Užsakymų būsenos</p>
          <ul className="space-y-3">
            {ORDER_STATUSES.map((s) => {
              const n = orders.filter((o) => o.status === s).length;
              return (
                <li key={s}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span>{STATUS_LABEL[s]}</span>
                    <span className="font-mono tabular-nums text-ink/55">{n}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                    <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${orders.length ? (n / orders.length) * 100 : 0}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold">Naujausi užsakymai</p>
            <Link href="/admin/uzsakymai" className="text-[13px] font-medium text-ink/60 hover:text-ink">Visi →</Link>
          </div>
          {!hydrated ? null : orders.length === 0 ? (
            <p className="py-8 text-center text-[13.5px] text-ink/45">Užsakymų dar nėra. Įkelkite demonstracinius arba pateikite bandomąjį užsakymą parduotuvėje.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-[13.5px]">
                  <span className="min-w-0">
                    <span className="block font-mono text-[12px] text-ink/50">{o.number}</span>
                    <span className="block truncate font-medium">{o.customer.firstName} {o.customer.lastName}</span>
                    <span className="block text-[11.5px] text-ink/40">{fmtDateTime(o.createdAt)}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <span className="font-mono tabular-nums">{eur(o.totalCents)}</span>
                    <StatusBadge status={o.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[14px] font-semibold">Mažėjantys likučiai</p>
            <Link href="/admin/produktai" className="text-[13px] font-medium text-ink/60 hover:text-ink">Tvarkyti →</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-[13.5px] text-ink/45">Visų formulių likučiai pakankami.</p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {lowStock.slice(0, 6).map(({ f, n, stock }) => (
                <li key={`${f.id}-${n}`} className="flex items-center justify-between gap-3 py-3 text-[13.5px]">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{f.name}</span>
                    <span className="text-[11.5px] text-ink/45">{NODES[n].label} · {f.code}</span>
                  </span>
                  <span className={`font-mono text-[13px] font-semibold tabular-nums ${stock <= 0 ? "text-crimson" : "text-amber-700"}`}>
                    {stock <= 0 ? "Išparduota" : `${stock} vnt.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

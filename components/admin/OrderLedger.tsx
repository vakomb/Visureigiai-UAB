"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useMemo, useState } from "react";
import { IconDownload, IconInvoice, IconSearch, IconTrash, NodeIcon } from "@/components/ui/Icon";
import { buildDemoOrders } from "@/lib/demo";
import { downloadFile, downloadInvoicesHtml, invoiceNumber, ordersToCsv, printInvoices } from "@/lib/export";
import { NODES, PAYMENT_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/copy";
import { cx, eur, fmtDateTime, plural } from "@/lib/format";
import { SPRING_TACTILE } from "@/lib/motion";
import { useAllFormulas } from "@/lib/stores/catalog";
import { useOrdersStore } from "@/lib/stores/orders";
import { useUIStore } from "@/lib/stores/ui";
import { NODE_IDS, ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { Card, PageHead } from "./parts";

type Range = "all" | "7" | "30";

function NodeBadges({ order }: { order: Order }) {
  const qty: Record<string, number> = {};
  for (const l of order.lines) qty[l.node] = (qty[l.node] ?? 0) + l.qty;
  return (
    <span className="flex flex-wrap gap-1">
      {NODE_IDS.filter((n) => qty[n]).map((n) => (
        <span key={n} className="inline-flex h-6 items-center gap-1 rounded-full bg-black/[0.05] px-2 text-[11px] font-semibold tracking-wide">
          <NodeIcon node={n} size={12} />
          {NODES[n].label}
          {qty[n] > 1 && <span className="text-ink/45">×{qty[n]}</span>}
        </span>
      ))}
      {order.bundleSets > 0 && (
        <span className="inline-flex h-6 items-center rounded-full bg-ink px-2 text-[11px] font-bold text-white">−20 %</span>
      )}
    </span>
  );
}

function StatusSelect({ order }: { order: Order }) {
  const setStatus = useOrdersStore((s) => s.setStatus);
  return (
    <select
      aria-label={`Būsena: ${order.number}`}
      value={order.status}
      onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
      className={cx(
        "h-9 w-full cursor-pointer appearance-none rounded-full px-3 text-[12.5px] font-semibold outline-none ring-1 ring-inset focus:ring-2 focus:ring-ink",
        STATUS_TONE[order.status],
      )}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-ink">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export function OrderLedger() {
  const hydrated = useUIStore((s) => s.hydrated);
  const toast = useUIStore((s) => s.toast);
  const orders = useOrdersStore((s) => s.orders);
  const nextSeq = useOrdersStore((s) => s.nextSeq);
  const addMany = useOrdersStore((s) => s.addMany);
  const remove = useOrdersStore((s) => s.remove);
  const formulas = useAllFormulas();

  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Set<OrderStatus>>(new Set());
  const [range, setRange] = useState<Range>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("lt");
    const since = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
    return orders.filter((o) => {
      if (statuses.size && !statuses.has(o.status)) return false;
      if (o.createdAt < since) return false;
      if (!q) return true;
      const c = o.customer;
      return [o.number, c.firstName, c.lastName, c.email, c.phone, c.city, invoiceNumber(o)].some((s) =>
        s.toLocaleLowerCase("lt").includes(q),
      );
    });
  }, [orders, query, statuses, range]);

  const selectedOrders = filtered.filter((o) => selected.has(o.id));
  const exportSet = selectedOrders.length ? selectedOrders : filtered;
  const allSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((o) => o.id)));

  const del = (o: Order) => {
    if (!window.confirm(`Ištrinti užsakymą ${o.number}? Veiksmo atšaukti nebus galima.`)) return;
    remove([o.id]);
    setSelected((s) => {
      const n = new Set(s);
      n.delete(o.id);
      return n;
    });
  };

  const exportLabel = selectedOrders.length
    ? `Pasirinktos sąskaitos (${selectedOrders.length})`
    : `Visos sąskaitos (${filtered.length})`;
  const none = exportSet.length === 0;

  return (
    <>
      <PageHead
        title="Užsakymų knyga"
        sub="Visi užsakymai, jų mazgai ir vykdymo būsena. Sąskaitas galite eksportuoti pavieniui arba grupėmis."
        actions={
          <>
            <button type="button" disabled={none} onClick={() => downloadFile("vaidore-uzsakymai.csv", ordersToCsv(exportSet), "text/csv")} className="ios-btn-ghost bg-white ring-1 ring-black/5 disabled:opacity-40">
              <IconDownload size={16} /> CSV
            </button>
            <button type="button" disabled={none} onClick={() => downloadInvoicesHtml(exportSet)} className="ios-btn-ghost bg-white ring-1 ring-black/5 disabled:opacity-40">
              HTML
            </button>
            <motion.button
              type="button"
              disabled={none}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_TACTILE}
              onClick={() => printInvoices(exportSet)}
              className="ios-btn h-11 min-h-0 rounded-xl text-[14px]"
            >
              <IconInvoice size={17} /> {exportLabel} · PDF
            </motion.button>
          </>
        }
      />

      {/* Filtrai */}
      <div className="mb-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Ieškoti užsakymų</span>
            <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Užsakymo Nr., klientas, el. paštas, telefonas, miestas"
              className="h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-[16px] outline-none focus:border-ink focus:ring-4 focus:ring-black/5 sm:text-[14px]"
            />
          </label>
          <select
            aria-label="Laikotarpis"
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="h-11 rounded-xl border border-black/10 bg-white px-3 text-[16px] outline-none focus:border-ink sm:text-[14px]"
          >
            <option value="all">Visas laikotarpis</option>
            <option value="7">Paskutinės 7 dienos</option>
            <option value="30">Paskutinės 30 dienų</option>
          </select>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {ORDER_STATUSES.map((s) => {
            const on = statuses.has(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setStatuses((cur) => {
                    const n = new Set(cur);
                    if (n.has(s)) n.delete(s);
                    else n.add(s);
                    return n;
                  })
                }
                className={cx(
                  "flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                  on ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink/70 hover:border-black/30",
                )}
              >
                {STATUS_LABEL[s]}
                <span className={cx("font-mono text-[11px]", on ? "text-white/60" : "text-ink/40")}>
                  {orders.filter((o) => o.status === s).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {hydrated && orders.length === 0 ? (
        <Card className="grid place-items-center px-6 py-20 text-center">
          <p className="font-display text-[30px]">Užsakymų dar nėra</p>
          <p className="mt-2 max-w-md text-[14px] text-ink/55">
            Pateikite bandomąjį užsakymą parduotuvėje arba įkelkite demonstracinius duomenis, kad išbandytumėte užsakymų knygą ir sąskaitų eksportą.
          </p>
          <button type="button" onClick={() => { addMany(buildDemoOrders(formulas, nextSeq)); toast("Įkelti demonstraciniai užsakymai"); }} className="ios-btn mt-6">
            Įkelti demonstracinius užsakymus
          </button>
        </Card>
      ) : (
        <>
          {/* Staliniai kompiuteriai */}
          <Card className="hidden overflow-hidden lg:block">
            <table className="w-full table-fixed border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-black/10 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                  <th className="w-[4%] px-4 py-3">
                    <input type="checkbox" aria-label="Pažymėti visus" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-black" />
                  </th>
                  <th className="w-[16%] px-2 py-3">Užsakymas</th>
                  <th className="w-[22%] px-2 py-3">Klientas</th>
                  <th className="w-[12%] px-2 py-3">Miestas</th>
                  <th className="w-[16%] px-2 py-3">Mazgai</th>
                  <th className="w-[10%] px-2 py-3 text-right">Suma</th>
                  <th className="w-[12%] px-3 py-3">Būsena</th>
                  <th className="w-[8%] px-3 py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <Fragment key={o.id}>
                    <tr className={cx("border-b border-black/[0.06] align-middle hover:bg-black/[0.015]", selected.has(o.id) && "bg-black/[0.03]")}>
                      <td className="px-4 py-3">
                        <input type="checkbox" aria-label={`Pažymėti ${o.number}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="h-4 w-4 accent-black" />
                      </td>
                      <td className="px-2">
                        <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="text-left">
                          <span className="block font-mono text-[12.5px] font-medium">{o.number}</span>
                          <span className="block text-[11.5px] text-ink/45">{fmtDateTime(o.createdAt)}{o.demo && " · demo"}</span>
                        </button>
                      </td>
                      <td className="min-w-0 px-2">
                        <span className="block truncate font-medium">{o.customer.firstName} {o.customer.lastName}</span>
                        <span className="block truncate text-[11.5px] text-ink/45">{o.customer.email}</span>
                      </td>
                      <td className="px-2 text-ink/70">{o.customer.city}</td>
                      <td className="px-2"><NodeBadges order={o} /></td>
                      <td className="px-2 text-right font-mono tabular-nums">{eur(o.totalCents)}</td>
                      <td className="px-3"><StatusSelect order={o} /></td>
                      <td className="px-3">
                        <div className="flex justify-end gap-0.5">
                          <button type="button" aria-label={`Sąskaita ${o.number}`} title="Sąskaita (PDF)" onClick={() => printInvoices([o])} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-black/5"><IconInvoice size={17} /></button>
                          <button type="button" aria-label={`Šalinti ${o.number}`} onClick={() => del(o)} className="grid h-9 w-9 place-items-center rounded-xl text-ink/35 hover:bg-rose-50 hover:text-crimson"><IconTrash size={17} /></button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {open === o.id && (
                        <tr className="bg-black/[0.02]">
                          <td colSpan={8} className="p-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SPRING_TACTILE} className="overflow-hidden">
                              <OrderDetails order={o} />
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="py-14 text-center text-[14px] text-ink/45">Pagal pasirinktus filtrus užsakymų nerasta.</p>}
          </Card>

          {/* Telefonai ir planšetės */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((o) => (
              <li key={o.id} className="rounded-3xl border border-black/5 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex min-w-0 items-start gap-3">
                    <input type="checkbox" aria-label={`Pažymėti ${o.number}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="mt-1 h-5 w-5 shrink-0 accent-black" />
                    <span className="min-w-0">
                      <span className="block font-mono text-[12.5px] font-medium">{o.number}</span>
                      <span className="block truncate text-[15px] font-medium">{o.customer.firstName} {o.customer.lastName}</span>
                      <span className="block text-[11.5px] text-ink/45">{fmtDateTime(o.createdAt)} · {o.customer.city}{o.demo && " · demo"}</span>
                    </span>
                  </label>
                  <span className="font-mono text-[15px] font-medium tabular-nums">{eur(o.totalCents)}</span>
                </div>
                <div className="mt-3"><NodeBadges order={o} /></div>
                <div className="mt-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  <StatusSelect order={o} />
                  <button type="button" aria-label={`Sąskaita ${o.number}`} onClick={() => printInvoices([o])} className="ios-btn-ghost h-9 min-h-0 px-3"><IconInvoice size={16} /></button>
                  <button type="button" aria-label={`Šalinti ${o.number}`} onClick={() => del(o)} className="ios-btn-ghost h-9 min-h-0 px-3 text-crimson"><IconTrash size={16} /></button>
                </div>
                <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="mt-3 text-[12.5px] font-medium text-ink/55 underline underline-offset-2">
                  {open === o.id ? "Slėpti informaciją" : "Rodyti informaciją"}
                </button>
                <AnimatePresence initial={false}>
                  {open === o.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={SPRING_TACTILE} className="overflow-hidden">
                      <OrderDetails order={o} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
            {filtered.length === 0 && <li className="py-12 text-center text-[14px] text-ink/45">Pagal pasirinktus filtrus užsakymų nerasta.</li>}
          </ul>

          <p className="mt-4 text-[12.5px] text-ink/45">
            Rodoma {filtered.length} iš {orders.length} {plural(orders.length, "užsakymo", "užsakymų", "užsakymų")}. Eksportuojama: {exportSet.length}.
          </p>
        </>
      )}
    </>
  );
}

function OrderDetails({ order: o }: { order: Order }) {
  return (
    <div className="grid gap-5 p-4 text-[13px] sm:grid-cols-2 sm:p-5">
      <div>
        <p className="eyebrow mb-2">Pristatymas</p>
        <p className="leading-relaxed">
          {o.customer.firstName} {o.customer.lastName}
          <br />
          {o.customer.address}, {o.customer.postcode} {o.customer.city}
          <br />
          {o.customer.phone} · {o.customer.email}
        </p>
        {o.customer.note && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-amber-900">„{o.customer.note}“</p>}
        <p className="mt-3 text-ink/55">
          {PAYMENT_LABEL[o.paymentMethod]} · {o.paymentState === "paid" ? "apmokėta" : o.paymentState === "demo" ? "bandomasis režimas (pinigai nenurašyti)" : "laukiama apmokėjimo"} · sąskaita {invoiceNumber(o)}
        </p>
      </div>
      <div>
        <p className="eyebrow mb-2">Prekės</p>
        <ul className="divide-y divide-black/[0.07]">
          {o.lines.map((l) => (
            <li key={`${l.formulaId}-${l.node}`} className="flex justify-between gap-3 py-1.5">
              <span className="min-w-0 truncate">{l.qty}× {l.name} · <span className="text-ink/50">{NODES[l.node].label}</span></span>
              <span className="font-mono tabular-nums">{eur(l.unitCents * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 space-y-0.5 border-t border-black/10 pt-2 text-ink/60">
          {o.bundleDiscountCents > 0 && <p className="flex justify-between text-emerald-700"><span>Tęstinumo atlygis</span><span className="font-mono">−{eur(o.bundleDiscountCents)}</span></p>}
          <p className="flex justify-between"><span>Pristatymas</span><span className="font-mono">{o.shippingCents ? eur(o.shippingCents) : "Nemokamai"}</span></p>
          <p className="flex justify-between font-semibold text-ink"><span>Iš viso</span><span className="font-mono">{eur(o.totalCents)}</span></p>
        </div>
      </div>
    </div>
  );
}

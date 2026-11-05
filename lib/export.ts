import { COMMERCE, COMPANY } from "./config";
import { NODES, PAYMENT_LABEL, STATUS_LABEL } from "./copy";
import { escapeHtml as h, eur, fmtDate, fmtDateTime } from "./format";
import { vatFromGross } from "./pricing";
import type { Order } from "./types";

/* ── Sąskaitos faktūros ─────────────────────────────────────────────────────── */

export const invoiceNumber = (o: Order) =>
  `${COMPANY.invoiceSeries}-${new Date(o.createdAt).getFullYear()}-${String(o.seq).padStart(5, "0")}`;

function invoiceHtml(o: Order): string {
  const vat = vatFromGross(o.totalCents);
  const net = o.totalCents - vat;
  const c = o.customer;

  const rows = o.lines
    .map(
      (l) => `<tr>
        <td><b>${h(l.name)}</b><br><span class="muted">${h(l.code)} · ${h(NODES[l.node].label)} · ${h(NODES[l.node].product)}, ${h(NODES[l.node].unit)}</span></td>
        <td class="num">${l.qty}</td>
        <td class="num">${h(eur(l.unitCents))}</td>
        <td class="num">${h(eur(l.unitCents * l.qty))}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    o.bundleDiscountCents > 0
      ? `<tr><td colspan="3">Ekosistemos tęstinumo atlygis −${Math.round(COMMERCE.bundleRate * 100)} % (${o.bundleSets} rink.)</td><td class="num">−${h(eur(o.bundleDiscountCents))}</td></tr>`
      : "";

  return `<section class="invoice">
    <header>
      <div><div class="brand">VAIDORE</div><div class="muted">PVM sąskaita faktūra</div></div>
      <div class="meta">
        <div><span class="muted">Serija ir Nr.</span> <b>${h(invoiceNumber(o))}</b></div>
        <div><span class="muted">Data</span> ${h(fmtDate(o.createdAt))}</div>
        <div><span class="muted">Užsakymas</span> ${h(o.number)}</div>
      </div>
    </header>
    <div class="parties">
      <div><h4>Pardavėjas</h4>${h(COMPANY.name)}<br>Įm. kodas: ${h(COMPANY.code)}<br>PVM kodas: ${h(COMPANY.vat)}<br>${h(COMPANY.address)}<br>${h(COMPANY.email)} · ${h(COMPANY.phone)}<br>${h(COMPANY.bank)} · ${h(COMPANY.iban)}</div>
      <div><h4>Pirkėjas</h4>${h(c.firstName)} ${h(c.lastName)}<br>${h(c.address)}<br>${h(c.postcode)} ${h(c.city)}<br>${h(c.email)}<br>${h(c.phone)}</div>
    </div>
    <table>
      <thead><tr><th>Prekė</th><th class="num">Kiekis</th><th class="num">Kaina su PVM</th><th class="num">Suma su PVM</th></tr></thead>
      <tbody>${rows}${discountRow}
        <tr><td colspan="3">Skubus Express pristatymas</td><td class="num">${o.shippingCents === 0 ? "Nemokamai" : h(eur(o.shippingCents))}</td></tr>
      </tbody>
    </table>
    <table class="totals">
      <tr><td>Suma be PVM</td><td class="num">${h(eur(net))}</td></tr>
      <tr><td>PVM ${Math.round(COMMERCE.vatRate * 100)} %</td><td class="num">${h(eur(vat))}</td></tr>
      <tr class="grand"><td>Iš viso mokėtina</td><td class="num">${h(eur(o.totalCents))}</td></tr>
    </table>
    <p class="muted">Apmokėjimo būdas: ${h(PAYMENT_LABEL[o.paymentMethod])} · Būsena: ${h(STATUS_LABEL[o.status])}${o.paymentState === "demo" ? " · BANDOMASIS užsakymas – dokumentas nėra teisinis" : ""}</p>
    ${o.demo ? '<p class="muted">Demonstraciniai duomenys.</p>' : ""}
  </section>`;
}

export function buildInvoicesHtml(orders: Order[]): string {
  return `<!doctype html><html lang="lt"><head><meta charset="utf-8">
<title>Vaidore sąskaitos (${orders.length})</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font: 12px/1.5 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #0a0a0b; margin: 0; }
  .invoice { page-break-after: always; padding: 4px 0; }
  .invoice:last-child { page-break-after: auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #0a0a0b; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { font-size: 22px; letter-spacing: .42em; font-weight: 600; }
  .meta { text-align: right; line-height: 1.7; }
  .muted { color: #6b6b70; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
  h4 { margin: 0 0 6px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: #6b6b70; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #6b6b70; border-bottom: 1px solid #d8d8dc; padding: 8px 6px; }
  td { padding: 9px 6px; border-bottom: 1px solid #ececef; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .totals { width: 55%; margin-left: auto; }
  .totals td { border: 0; padding: 4px 6px; }
  .grand td { border-top: 1px solid #0a0a0b; font-weight: 700; font-size: 14px; padding-top: 8px; }
</style></head><body>${orders.map(invoiceHtml).join("")}</body></html>`;
}

/** Spausdina sąskaitas per paslėptą iframe – nereikia iššokančių langų (jų blokuoja naršyklės). */
export function printInvoices(orders: Order[]) {
  if (typeof document === "undefined" || orders.length === 0) return;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc || !frame.contentWindow) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(buildInvoicesHtml(orders));
  doc.close();
  const win = frame.contentWindow;
  const run = () => {
    win.focus();
    win.print();
    setTimeout(() => frame.remove(), 60_000);
  };
  // Leidžiame išsipiešti prieš spausdinant.
  setTimeout(run, 250);
}

/* ── Atsisiuntimai ──────────────────────────────────────────────────────────── */

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export const downloadInvoicesHtml = (orders: Order[]) =>
  downloadFile(
    orders.length === 1 ? `saskaita-${invoiceNumber(orders[0])}.html` : `saskaitos-${orders.length}.html`,
    buildInvoicesHtml(orders),
    "text/html",
  );

/** CSV, tinkamas Excel (lietuviška lokalė: kabliataškis + BOM). Apsaugo nuo formulių injekcijos. */
function csvCell(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function ordersToCsv(orders: Order[]): string {
  const head = [
    "Užsakymo Nr.", "Sąskaitos Nr.", "Data", "Būsena", "Vardas", "Pavardė", "El. paštas", "Telefonas",
    "Adresas", "Miestas", "Pašto kodas", "Mazgai", "Prekės", "Tarpinė suma", "Atlygis", "Pristatymas", "Iš viso", "Apmokėjimas",
  ];
  const lines = orders.map((o) =>
    [
      o.number, invoiceNumber(o), fmtDateTime(o.createdAt), STATUS_LABEL[o.status],
      o.customer.firstName, o.customer.lastName, o.customer.email, o.customer.phone,
      o.customer.address, o.customer.city, o.customer.postcode,
      Array.from(new Set(o.lines.map((l) => NODES[l.node].label))).join(" + "),
      o.lines.map((l) => `${l.qty}× ${l.code} ${NODES[l.node].label}`).join(" | "),
      (o.subtotalCents / 100).toFixed(2).replace(".", ","),
      (o.bundleDiscountCents / 100).toFixed(2).replace(".", ","),
      (o.shippingCents / 100).toFixed(2).replace(".", ","),
      (o.totalCents / 100).toFixed(2).replace(".", ","),
      PAYMENT_LABEL[o.paymentMethod],
    ]
      .map(csvCell)
      .join(";"),
  );
  return "﻿" + [head.map(csvCell).join(";"), ...lines].join("\r\n");
}

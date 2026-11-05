import { NextResponse } from "next/server";
import { NODE_IDS, ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/types";

/**
 * POST /api/orders – užsakymo priėmimas serverio pusėje.
 *  • Patikrina struktūrą ir apribojimus (niekada nepasitikime naršykle).
 *  • Jei nustatytas ORDER_WEBHOOK_URL – persiunčia užsakymą (Make, Zapier, Slack, el. paštas ir pan.).
 * Be webhook'o užsakymas lieka naršyklėje (admin → Užsakymų knyga). Duomenų bazės prijungimas aprašytas README.
 */

const MAX_BODY = 64 * 1024;

const isStr = (v: unknown, max = 200): v is string => typeof v === "string" && v.length <= max;
const isInt = (v: unknown, min = 0, max = 10_000_000): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

function validate(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Neteisingas formatas";
  const o = body as Record<string, unknown>;
  const c = o.customer as Record<string, unknown> | undefined;

  if (!isStr(o.number, 40) || !isStr(o.id, 80)) return "Trūksta užsakymo identifikatoriaus";
  if (!c || !isStr(c.firstName, 80) || !isStr(c.lastName, 80) || !isStr(c.email, 160) || !isStr(c.phone, 40)) return "Neteisingi kliento duomenys";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email as string)) return "Neteisingas el. paštas";
  if (!isStr(c.address, 200) || !isStr(c.city, 80) || !isStr(c.postcode, 20)) return "Neteisingas adresas";
  if (!Array.isArray(o.lines) || o.lines.length < 1 || o.lines.length > 60) return "Neteisingas prekių sąrašas";

  for (const l of o.lines as Array<Record<string, unknown>>) {
    if (!isStr(l.formulaId, 80) || !isStr(l.code, 40) || !isStr(l.name, 160)) return "Neteisinga prekė";
    if (!NODE_IDS.includes(l.node as never)) return "Neteisingas mazgas";
    if (!isInt(l.qty, 1, 99) || !isInt(l.unitCents, 0, 10_000_000)) return "Neteisingas kiekis ar kaina";
  }
  if (!isInt(o.totalCents) || !isInt(o.subtotalCents) || !isInt(o.shippingCents) || !isInt(o.bundleDiscountCents)) return "Neteisingos sumos";
  if (!PAYMENT_METHODS.includes(o.paymentMethod as never)) return "Neteisingas mokėjimo būdas";
  if (!ORDER_STATUSES.includes(o.status as never)) return "Neteisinga būsena";

  // Sumų vientisumas: tarpinė suma − nuolaida + pristatymas = iš viso.
  const sum = (o.lines as Array<{ qty: number; unitCents: number }>).reduce((s, l) => s + l.qty * l.unitCents, 0);
  if (sum !== o.subtotalCents) return "Sumos nesutampa";
  if ((o.subtotalCents as number) - (o.bundleDiscountCents as number) + (o.shippingCents as number) !== o.totalCents) return "Galutinė suma nesutampa";
  return null;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ ok: false, error: "Per didelė užklausa" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Neteisingas JSON" }, { status: 400 });
  }

  const problem = validate(body);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 422 });

  const webhook = process.env.ORDER_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ ok: true, forwarded: false }, { status: 202 });

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "order.created", order: body }),
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ ok: res.ok, forwarded: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, forwarded: false, error: "Webhook nepasiekiamas" }, { status: 502 });
  }
}

import { COMMERCE } from "./config";
import type { Order, PaymentMethod } from "./types";

/**
 * Mokėjimų sluoksnis. Parduotuvė pristatoma BANDOMUOJU režimu: užsakymas užfiksuojamas, bet pinigai nenurašomi.
 *
 * Kaip prijungti tikrą mokėjimą:
 *  1. Sukurkite `PaymentProvider` (pvz., Stripe Payment Request Button – palaiko Apple Pay ir Google Pay,
 *     o Revolut Pay – per Revolut Merchant API / Revolut Pay SDK).
 *  2. Grąžinkite jį iš `getPaymentProvider()`.
 *  3. Nustatykite NEXT_PUBLIC_PAYMENTS_MODE=live.
 * Svarbu: sumą ir užsakymo turinį tikrinkite serveryje (app/api/orders/route.ts) – ne naršyklėje.
 */

export interface PaymentResult {
  ok: boolean;
  state: Order["paymentState"];
  reference?: string;
  error?: string;
}

export interface PaymentProvider {
  id: string;
  pay: (method: PaymentMethod, amountCents: number) => Promise<PaymentResult>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const demoProvider: PaymentProvider = {
  id: "demo",
  async pay() {
    await sleep(900);
    return { ok: true, state: "demo", reference: `DEMO-${Date.now().toString(36).toUpperCase()}` };
  },
};

const unavailableProvider: PaymentProvider = {
  id: "unavailable",
  async pay() {
    return {
      ok: false,
      state: "pending",
      error: "Mokėjimų teikėjas dar neprijungtas. Susisiekite su parduotuve.",
    };
  },
};

export function getPaymentProvider(): PaymentProvider {
  // Kol nėra tikro teikėjo, „live“ režime užsakymų nepriimame – kad niekas nemanytų, jog sumokėjo.
  return COMMERCE.paymentsMode === "live" ? unavailableProvider : demoProvider;
}

"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useRef, useState } from "react";
import { useCartTotals } from "@/hooks/useCartTotals";
import { Field } from "@/components/ui/Field";
import { COMMERCE } from "@/lib/config";
import { T } from "@/lib/copy";
import { CITIES, cityById } from "@/lib/delivery";
import { haptic } from "@/lib/fx";
import { getPaymentProvider } from "@/lib/payments";
import { useCartStore } from "@/lib/stores/cart";
import { useCheckoutStore } from "@/lib/stores/checkout";
import { useOrdersStore } from "@/lib/stores/orders";
import { useUIStore } from "@/lib/stores/ui";
import type { PaymentMethod } from "@/lib/types";
import {
  normalizePhone,
  validateCheckout,
  validateField,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/validation";
import { PaymentGates } from "./PaymentGates";
import { Summary } from "./Summary";

const ORDER = ["firstName", "lastName", "email", "phone", "address", "postcode", "accept"] as const;

export function CheckoutStep() {
  const totals = useCartTotals();
  const values = useCheckoutStore((s) => s.values);
  const setValues = useCheckoutStore((s) => s.set);
  const clearCart = useCartStore((s) => s.clear);
  const createOrder = useOrdersStore((s) => s.create);
  const setStep = useUIStore((s) => s.setCartStep);
  const toast = useUIStore((s) => s.toast);

  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [busy, setBusy] = useState<PaymentMethod | null>(null);
  const shake = useAnimationControls();
  const formRef = useRef<HTMLFormElement>(null);

  const update = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) => {
    setValues({ [key]: value } as Partial<CheckoutValues>);
    // Jei laukas jau buvo su klaida – taisome gyvai, kad klaida dingtų iškart.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: validateField(key, { ...values, [key]: value }) || undefined }));
  };
  const blur = (key: keyof CheckoutValues) =>
    setErrors((e) => ({ ...e, [key]: validateField(key, values) || undefined }));

  const pay = async (method: PaymentMethod) => {
    const errs = validateCheckout(values);
    setErrors(errs);
    const firstBad = ORDER.find((k) => errs[k]);
    if (firstBad) {
      haptic(24);
      shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      formRef.current?.querySelector<HTMLElement>(`#${firstBad}`)?.focus();
      return;
    }
    if (totals.lines.length === 0) return;
    if (totals.lines.some((l) => l.qty > l.stock)) {
      toast("Kai kurių prekių likutis sumažėjo – patikrinkite krepšelį.");
      setStep("cart");
      return;
    }

    setBusy(method);
    try {
      const result = await getPaymentProvider().pay(method, totals.totalCents);
      if (!result.ok) {
        toast(result.error ?? "Mokėjimas nepavyko. Bandykite dar kartą.");
        return;
      }
      const city = cityById(values.cityId);
      const order = createOrder({
        customer: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: normalizePhone(values.phone),
          address: values.address.trim(),
          cityId: city.id,
          city: city.label,
          postcode: values.postcode.trim(),
          note: values.note.trim(),
        },
        lines: totals.lines.map((l) => ({
          formulaId: l.formula.id,
          code: l.formula.code,
          name: l.formula.name,
          node: l.node,
          qty: l.qty,
          unitCents: l.unitCents,
        })),
        subtotalCents: totals.subtotalCents,
        bundleDiscountCents: totals.bundleDiscountCents,
        bundleSets: totals.bundleSetCount,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        paymentMethod: method,
        paymentState: result.state,
      });
      // Neprivalomas persiuntimas (webhook). Nesėkmė niekada netrukdo klientui.
      void fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(order),
        keepalive: true,
      }).catch(() => undefined);

      haptic(30);
      clearCart();
      setValues({ accept: false, note: "" });
      setStep("done", order.id);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <motion.div animate={shake} className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        {COMMERCE.paymentsMode === "demo" && (
          <p className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-[12.5px] leading-snug text-amber-900 ring-1 ring-amber-200">
            {T.cart.demoBanner}
          </p>
        )}

        <form ref={formRef} noValidate onSubmit={(e) => e.preventDefault()} aria-label={T.cart.checkoutTitle}>
          <fieldset>
            <legend className="eyebrow mb-3">{T.checkout.contact}</legend>
            <div className="grid grid-cols-2 gap-x-3">
              <Field id="firstName" required label={T.checkout.fields.firstName} placeholder={T.checkout.placeholders.firstName}
                autoComplete="given-name" value={values.firstName} error={errors.firstName}
                onChange={(v) => update("firstName", v)} onBlur={() => blur("firstName")} />
              <Field id="lastName" required label={T.checkout.fields.lastName} placeholder={T.checkout.placeholders.lastName}
                autoComplete="family-name" value={values.lastName} error={errors.lastName}
                onChange={(v) => update("lastName", v)} onBlur={() => blur("lastName")} />
            </div>
            <Field id="email" required type="email" inputMode="email" label={T.checkout.fields.email} placeholder={T.checkout.placeholders.email}
              autoComplete="email" value={values.email} error={errors.email}
              onChange={(v) => update("email", v)} onBlur={() => blur("email")} />
            <Field id="phone" required type="tel" inputMode="tel" label={T.checkout.fields.phone} placeholder={T.checkout.placeholders.phone}
              autoComplete="tel" value={values.phone} error={errors.phone}
              onChange={(v) => update("phone", v)} onBlur={() => blur("phone")} />
          </fieldset>

          <fieldset className="mt-2">
            <legend className="eyebrow mb-3">{T.checkout.delivery}</legend>
            <Field id="address" required label={T.checkout.fields.address} placeholder={T.checkout.placeholders.address}
              autoComplete="street-address" value={values.address} error={errors.address}
              onChange={(v) => update("address", v)} onBlur={() => blur("address")} />
            <div className="grid grid-cols-[1.4fr_1fr] gap-x-3">
              <Field id="cityId" label={T.checkout.fields.city} value={values.cityId} autoComplete="address-level2"
                onChange={(v) => update("cityId", v)}
                select={CITIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))} />
              <Field id="postcode" required inputMode="numeric" label={T.checkout.fields.postcode} placeholder={T.checkout.placeholders.postcode}
                autoComplete="postal-code" value={values.postcode} error={errors.postcode}
                onChange={(v) => update("postcode", v)} onBlur={() => blur("postcode")} />
            </div>
            <Field id="note" textarea label={T.checkout.fields.note} value={values.note} onChange={(v) => update("note", v)} />
          </fieldset>

          <div className="mt-1">
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-ink/70">
              <input
                id="accept"
                type="checkbox"
                checked={values.accept}
                onChange={(e) => update("accept", e.target.checked)}
                onBlur={() => blur("accept")}
                aria-invalid={Boolean(errors.accept) || undefined}
                className="mt-0.5 h-5 w-5 shrink-0 accent-black"
              />
              <span>
                {T.checkout.terms}{" "}
                <a href="/teisine-informacija/pirkimo-taisykles" target="_blank" className="underline underline-offset-2">
                  Taisyklės
                </a>
                {" · "}
                <a href="/teisine-informacija/privatumo-politika" target="_blank" className="underline underline-offset-2">
                  Privatumas
                </a>
              </span>
            </label>
            <p role={errors.accept ? "alert" : undefined} className="h-5 pt-1 text-[12px] text-crimson">
              {errors.accept || " "}
            </p>
          </div>
        </form>
      </motion.div>

      <footer className="space-y-4 border-t border-black/10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <Summary totals={totals} />
        <p className="text-[12px] leading-snug text-ink/50">{T.checkout.payHint}</p>
        <PaymentGates busy={busy} onPay={pay} />
      </footer>
    </>
  );
}

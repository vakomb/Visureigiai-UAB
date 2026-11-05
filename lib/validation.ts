export interface CheckoutValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  cityId: string;
  postcode: string;
  note: string;
  accept: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export const EMPTY_CHECKOUT: CheckoutValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  cityId: "vilnius",
  postcode: "",
  note: "",
  accept: false,
};

const NAME_RE = /^[\p{L}][\p{L}\s'’.-]{1,59}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE_RE = /^(LT-?)?\d{5}$/i;

export function normalizePhone(value: string): string {
  const cleaned = value.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (/^8\d{8}$/.test(cleaned)) return `+370${cleaned.slice(1)}`;
  if (/^6\d{7}$/.test(cleaned)) return `+370${cleaned}`;
  return cleaned;
}

export function validateField(name: keyof CheckoutValues, values: CheckoutValues): string {
  const raw = values[name];
  const value = typeof raw === "string" ? raw.trim() : raw;

  switch (name) {
    case "firstName":
      if (!value) return "Įveskite vardą";
      return NAME_RE.test(value as string) ? "" : "Vardas atrodo neteisingas";
    case "lastName":
      if (!value) return "Įveskite pavardę";
      return NAME_RE.test(value as string) ? "" : "Pavardė atrodo neteisinga";
    case "email":
      if (!value) return "Įveskite el. pašto adresą";
      return EMAIL_RE.test(value as string) ? "" : "Patikrinkite el. pašto adresą";
    case "phone": {
      if (!value) return "Įveskite telefono numerį";
      const p = normalizePhone(value as string);
      return /^\+?\d{8,15}$/.test(p) ? "" : "Telefono numeris neteisingas";
    }
    case "address":
      if (!value) return "Įveskite pristatymo adresą";
      return (value as string).length >= 5 ? "" : "Adresas per trumpas";
    case "postcode":
      if (!value) return "Įveskite pašto kodą";
      return POSTCODE_RE.test(value as string) ? "" : "Pašto kodas turi būti 5 skaitmenų";
    case "accept":
      return raw ? "" : "Būtina sutikti su taisyklėmis";
    default:
      return "";
  }
}

const REQUIRED: Array<keyof CheckoutValues> = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "postcode",
  "accept",
];

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  for (const key of REQUIRED) {
    const msg = validateField(key, values);
    if (msg) errors[key] = msg;
  }
  return errors;
}

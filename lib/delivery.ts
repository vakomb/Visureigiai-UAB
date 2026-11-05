import { COMMERCE } from "./config";

export interface City {
  id: string;
  label: string;
  /** Darbo dienos nuo išsiuntimo iki pristatymo (Skubus Express) */
  transitDays: number;
}

export const CITIES: readonly City[] = [
  { id: "vilnius", label: "Vilnius", transitDays: 1 },
  { id: "kaunas", label: "Kaunas", transitDays: 1 },
  { id: "klaipeda", label: "Klaipėda", transitDays: 1 },
  { id: "siauliai", label: "Šiauliai", transitDays: 2 },
  { id: "panevezys", label: "Panevėžys", transitDays: 2 },
  { id: "alytus", label: "Alytus", transitDays: 2 },
  { id: "kita", label: "Kita Lietuvos vietovė", transitDays: 3 },
];

export const cityById = (id: string): City => CITIES.find((c) => c.id === id) ?? CITIES[0];

interface Zoned {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
  s: number;
  /** 0 = sekmadienis … 6 = šeštadienis */
  dow: number;
}

const zFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: COMMERCE.timezone,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
});

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function zoned(date: Date): Zoned {
  const p: Record<string, string> = {};
  for (const part of zFmt.formatToParts(date)) p[part.type] = part.value;
  return {
    y: Number(p.year),
    m: Number(p.month),
    d: Number(p.day),
    h: Number(p.hour) % 24,
    min: Number(p.minute),
    s: Number(p.second),
    dow: DOW[p.weekday] ?? 1,
  };
}

const isBusinessDow = (dow: number) => dow >= 1 && dow <= 5;

/** Prideda darbo dienų prie „vietinės datos“, išreikštos UTC pusnakčiu. */
function addBusinessDays(utcMidnight: number, n: number): number {
  let t = utcMidnight;
  let left = n;
  while (left > 0) {
    t += 86_400_000;
    if (isBusinessDow(new Date(t).getUTCDay())) left--;
  }
  return t;
}

const dayFmt = new Intl.DateTimeFormat("lt-LT", {
  timeZone: "UTC",
  weekday: "long",
  month: "long",
  day: "numeric",
});

export interface DeliveryEstimate {
  city: City;
  /** Ar siunta išvyks šiandien */
  dispatchToday: boolean;
  dispatchLabel: string;
  deliveryLabel: string;
  /** Milisekundės iki šiandienos išsiuntimo laiko; null, jei šiandien nebesiunčiama */
  msToCutoff: number | null;
}

export function getDeliveryEstimate(cityId: string, now: Date = new Date()): DeliveryEstimate {
  const city = cityById(cityId);
  const z = zoned(now);
  const todayUtc = Date.UTC(z.y, z.m - 1, z.d);
  const beforeCutoff = z.h < COMMERCE.dispatchCutoffHour;
  const dispatchToday = isBusinessDow(z.dow) && beforeCutoff;

  const dispatchUtc = dispatchToday ? todayUtc : addBusinessDays(todayUtc, 1);
  const deliveryUtc = addBusinessDays(dispatchUtc, city.transitDays);

  const msToCutoff = dispatchToday
    ? (COMMERCE.dispatchCutoffHour * 3600 - (z.h * 3600 + z.min * 60 + z.s)) * 1000
    : null;

  return {
    city,
    dispatchToday,
    dispatchLabel: dispatchToday ? "šiandien" : dayFmt.format(new Date(dispatchUtc)),
    deliveryLabel: dayFmt.format(new Date(deliveryUtc)),
    msToCutoff,
  };
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

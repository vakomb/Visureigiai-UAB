import { NextResponse, type NextRequest } from "next/server";

/**
 * Valdymo stoties (/admin) apsauga – HTTP Basic Auth.
 * Next.js 16: ankstesnis `middleware.ts` pervadintas į `proxy.ts`.
 *
 * • ADMIN_PASSWORD nustatytas → reikalingas prisijungimas.
 * • ADMIN_PASSWORD nenustatytas, kūrimo režimas → praleidžiama.
 * • ADMIN_PASSWORD nenustatytas, produkcija → 503 (niekada neatidarome admin be slaptažodžio).
 */

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function decodeBasic(value: string): [string, string] | null {
  try {
    const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    const idx = text.indexOf(":");
    if (idx < 0) return null;
    return [text.slice(0, idx), text.slice(idx + 1)];
  } catch {
    return null;
  }
}

const MISSING_PASSWORD_HTML = `<!doctype html><html lang="lt"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vaidore · Valdymo stotis</title>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 24px;color:#0a0a0b;line-height:1.6">
<p style="letter-spacing:.3em;font-size:12px;text-transform:uppercase;color:#777">Vaidore</p>
<h1 style="font-weight:600;letter-spacing:-.02em">Valdymo stotis dar neaktyvuota</h1>
<p>Saugos sumetimais valdymo stotis neveikia, kol nenustatytas slaptažodis.</p>
<p>Vercel → <b>Project → Settings → Environment Variables</b> pridėkite <code>ADMIN_PASSWORD</code> (ir, jei norite, <code>ADMIN_USER</code>), tada paleiskite <b>Redeploy</b>.</p></body></html>`;

export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  const user = process.env.ADMIN_USER || "admin";

  if (!password) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse(MISSING_PASSWORD_HTML, {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const creds = decodeBasic(header.slice(6));
    if (creds && safeEqual(creds[0], user) && safeEqual(creds[1], password)) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      res.headers.set("Cache-Control", "no-store");
      return res;
    }
  }

  return new NextResponse("Reikalingas prisijungimas.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Vaidore valdymo stotis", charset="UTF-8"',
      "cache-control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

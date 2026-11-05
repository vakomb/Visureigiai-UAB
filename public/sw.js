/* Vaidore – naršyklės lygio talpykla.
 * • /_next/static, šriftai, paveikslėliai: cache-first (turinys su hash, nekintantis)
 * • Puslapių navigacija: network-first su talpyklos atsarga (veikia ir be ryšio)
 * • /admin, /api ir RSC užklausos niekada netalpinamos
 */
const VERSION = "vaidore-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const MAX_PAGES = 24;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  /\.(?:woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/i.test(url.pathname);

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;
  if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })(),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) {
            cache.put(req, res.clone());
            trim(PAGE_CACHE, MAX_PAGES);
          }
          return res;
        } catch {
          const hit = (await cache.match(req)) || (await cache.match("/"));
          if (hit) return hit;
          return new Response(
            '<!doctype html><html lang="lt"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vaidore</title><body style="font-family:system-ui;max-width:480px;margin:20vh auto;padding:0 24px;text-align:center"><p style="letter-spacing:.4em;font-size:12px">VAIDORE</p><h1>Nėra ryšio</h1><p>Patikrinkite interneto ryšį ir bandykite dar kartą.</p></body></html>',
            { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
          );
        }
      })(),
    );
  }
});

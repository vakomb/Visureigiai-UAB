# Vaidore · vaidore.lt

Interaktyvi kvapų ekosistemos parduotuvė: **ŽMOGUI · MAŠINAI · NAMAMS**.
Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · TypeScript · Zustand.
Visa sąsaja – lietuvių kalba.

---

## 1. Paleidimas (2 minutės)

```bash
npm install
npm run dev          # http://localhost:3000
```

Gamybinis patikrinimas: `npm run typecheck && npm run build && npm start`

> Po pirmo `npm install` sukurtą `package-lock.json` įtraukite į git.

## 2. Įkėlimas į GitHub ir paleidimas per Vercel

```bash
git init
git add .
git commit -m "Vaidore: pirma versija"
git branch -M main
git remote add origin https://github.com/JUSU-VARDAS/vaidore.git
git push -u origin main
```

1. [vercel.com/new](https://vercel.com/new) → **Import** jūsų GitHub saugyklą (Framework: *Next.js* aptinkamas automatiškai).
2. **Settings → Environment Variables** pridėkite (žr. `.env.example`):

| Kintamasis | Paskirtis |
|---|---|
| `ADMIN_PASSWORD` | **Privaloma** – slaptažodis valdymo stočiai `/admin`. Be jo produkcijoje `/admin` rodo 503 (saugos sumetimais). |
| `ADMIN_USER` | Neprivaloma, numatyta `admin`. |
| `NEXT_PUBLIC_SITE_URL` | `https://vaidore.lt` (SEO, sitemap). |
| `NEXT_PUBLIC_PAYMENTS_MODE` | `demo` (numatyta) arba `live` – žr. 5 skyrių. |
| `ORDER_WEBHOOK_URL` | Neprivaloma – kiekvienas naujas užsakymas bus išsiųstas JSON POST užklausa (Make, Zapier, Slack ir pan.). |

3. **Redeploy**. Domeną `vaidore.lt` prijunkite per **Settings → Domains**.

## 3. Kas yra viduje

| Dalis | Kur |
|---|---|
| Matinė antraštė (blur 24 px, 82 % balta), meniu skydas, krepšelio ženkliukas | `components/shell/*` |
| 3 mazgų konsolė, 3D kristalas (CSS 3D, tempiamas/sukamas), gyvų verčių knyga, ekosistemos tiltas, −20 % veiksmo mazgas | `components/console/*` |
| Olfaktorinis terminalas (filtrai, rūšiavimas, statistika), „Cart Injection“ dalelės | `components/terminal/*`, `components/system/ParticleLayer.tsx` |
| Dešinės pusės krepšelis → atsiskaitymas → patvirtinimas, pristatymo kelio sekimas, Apple/Google/Revolut Pay vartai | `components/cart/*` |
| Valdymo stotis: apžvalga, produktų matrica, užsakymų knyga + sąskaitos | `app/admin/*`, `components/admin/*` |
| „Apie mus“ redakcinis puslapis | `app/(shop)/apie-mus/page.tsx` |
| Teisiniai puslapiai (šablonai) | `lib/legal.ts` |
| Kainodara, nuolaida, pristatymo datos, validacija | `lib/pricing.ts`, `lib/delivery.ts`, `lib/validation.ts` |
| Visi lietuviški tekstai | `lib/copy.ts` |
| Verslo parametrai (PVM, pristatymas, −20 %, 15:00 riba) | `lib/config.ts` |

**Papildomai įdiegta (be užklausos):** išmanus krepšelio išsaugojimas (localStorage, sinchronizuojamas tarp skirtukų), išdėstymui stabili validacija (klaidų eilutės vieta rezervuota – CLS = 0), `scrollbar-gutter: stable`, service worker talpykla (`public/sw.js`, tik produkcijoje), maršrutų išankstinis įkėlimas, haptinis atsakas, „Sumažinti judesį“ nuostata, klaviatūros valdymas ir fokuso gaudyklė skyduose, atšaukimo (undo) pranešimai, JSON-LD / sitemap / robots / PWA manifest, serverio pusės užsakymo patikra (`/api/orders`), katalogo eksportas/importas, CSV eksportas apsaugotas nuo formulių injekcijos.

## 4. Valdymo stotis (`/admin`)

* **Produktų matrica** – skaičius (kaina, aliejus %, ilgaamžiškumas, spindulys, likutis) keičiate tiesiai lentelėje; „Nauja formulė“ ir „Redaguoti“ atidaro pilną redaktorių (natos, vaizdo kelias / failo įkėlimas, visi trys mazgai). Šalinimas turi „Atšaukti“.
* **Užsakymų knyga** – filtrai, būsenų keitimas, išskleidžiama informacija; **PDF sąskaitos** (spausdinimas / „Išsaugoti kaip PDF“) pavieniui, pažymėtoms arba visoms filtruotoms; HTML ir CSV eksportas.
* **Apžvalga** – pajamos, užsakymai, vid. krepšelis, rinkinių dalis, 14 dienų grafikas, mažėjantys likučiai. Mygtukas „Įkelti demonstracinius užsakymus“ leidžia viską išbandyti.

### ⚠️ Svarbu: kur saugomi duomenys

Be duomenų bazės katalogo pakeitimai ir užsakymai saugomi **tos naršyklės** `localStorage`. Tai reiškia:

* admin pakeitimai (kainos, nauji produktai) matomi tik tame įrenginyje, kuriame juos atlikote;
* klientų užsakymai **nepasiekia** admin kitame įrenginyje – juos gausite tik per `ORDER_WEBHOOK_URL`.

Tai tinka parodyti, išbandyti ir paleisti kaip vitriną. **Realiam pardavimui** katalogą ir užsakymus reikia perkelti į duomenų bazę (pvz., Supabase / Vercel Postgres): pakeiskite `lib/stores/catalog.ts` ir `lib/stores/orders.ts` į užklausas serveriui ir apsaugokite jas `ADMIN_PASSWORD`. Naudokite „Eksportuoti“ (Produktų matrica), kad turėtumėte atsarginę kopiją.

Produktų nuotraukoms patikimiausia: įkelkite failą į `public/images/`, GitHub, o admin lauke nurodykite kelią `/images/pavadinimas.jpg`.

## 5. Mokėjimai

Pristatoma **bandomuoju režimu** (`NEXT_PUBLIC_PAYMENTS_MODE=demo`): mygtukai *Apple Pay · Google Pay · Revolut Pay* užfiksuoja užsakymą, bet **pinigų nenurašo**, o sąsajoje rodoma aiški „bandomasis režimas“ juosta. Tikram mokėjimui:

1. Sukurkite `PaymentProvider` (`lib/payments.ts`) – pvz., Stripe (Apple Pay ir Google Pay palaikomi per Payment Request / Express Checkout) ir Revolut Merchant API / Revolut Pay.
2. Sumą ir užsakymo turinį tikrinkite serveryje (`app/api/orders/route.ts`) – ne naršyklėje.
3. Tik tada nustatykite `NEXT_PUBLIC_PAYMENTS_MODE=live`. Kol teikėjas neprijungtas, `live` režimas užsakymų **nepriima** (kad niekas nemanytų, jog sumokėjo).

## 6. Prieš paleidžiant viešai – būtina

1. **Įmonės rekvizitai**: `lib/config.ts → COMPANY` (sąskaitoms ir teisiniams puslapiams). Laukai `[SKLIAUSTUOSE]` – šablonai.
2. **Teisiniai tekstai** (`lib/legal.ts`) – peržiūrėkite su teisininku.
3. **„Inspired by …“ nuorodos į žinomus prekių ženklus** (Baccarat, Creed, Tom Ford): ES taisyklės draudžia reklamoje pateikti prekę kaip žinomo ženklo prekės imitaciją ar kopiją (Direktyva 2006/114/EB, 4 str. g punktas), be to, kyla prekių ženklų ginčų rizika. Pasitarkite su teisininku; tekstus galite pakeisti admin lauke „Inspired by“ arba `lib/seed.ts`.
4. **Produktų duomenys** (`lib/seed.ts`) – kainos, koncentracijos, ilgaamžiškumas ir likučiai yra **pavyzdiniai**; pakeiskite tikrais.
5. **Skubumo indikatoriai** rodo tik tikrus duomenis (tikri likučiai, realus išsiuntimo laikas). Nekurkite dirbtinio trūkumo – ES vartotojų apsaugos taisyklės tai laiko klaidinančia praktika.

## 7. Pastabos dėl sprendimų

* Mygtuko užrašas **„Užsakyti su nemokamu pristatymu →“** vietoj „Užsakyti nemokamai →“, nes pastarasis skamba taip, lyg prekė būtų nemokama. Norėdami grįžti prie originalo, pakeiskite `T.bridge.cta` faile `lib/copy.ts`.
* Pavadinimas „−20 %“ pateikiamas kaip **ekosistemos tęstinumo atlygis**, kuris taikomas, kai ta pati formulė pasirinkta visiems trims mazgams (konsolėje ir krepšelyje, kiekvienam pilnam komplektui).
* Admin apsaugotas HTTP Basic Auth (`proxy.ts`, Next.js 16 vietoj `middleware.ts`).
* Service worker neprofiliuoja `/admin`, `/api` ir RSC užklausų.

## 8. Struktūra

```
app/
  (shop)/            parduotuvė (AppShell: antraštė, skydai, krepšelio juosta)
    page.tsx           konsolė + terminalas
    apie-mus/          „Apie mus“
    teisine-informacija/[slug]/
  admin/             valdymo stotis (apsaugota proxy.ts)
  api/orders/        serverio patikra + webhook
components/ {shell, console, terminal, cart, admin, ui, system, about}
lib/ {pricing, delivery, validation, export, payments, copy, config, seed, stores/*}
public/sw.js         naršyklės talpykla
proxy.ts             /admin apsauga
```

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[70svh] max-w-xl place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Klaida 404</p>
        <h1 className="mt-4 font-display text-[56px] font-medium leading-none tracking-tight">Puslapis nerastas</h1>
        <p className="mt-4 text-ink/60">Šio kvapo pėdsakas nuvedė į tuščią erdvę. Grįžkite į konsolę.</p>
        <Link href="/" className="ios-btn mt-8">
          Į pradžią
        </Link>
      </div>
    </section>
  );
}

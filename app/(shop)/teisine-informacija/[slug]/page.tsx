import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL, legalBySlug } from "@/lib/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  return doc
    ? { title: doc.title, description: doc.intro, alternates: { canonical: `/teisine-informacija/${doc.slug}` } }
    : {};
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = legalBySlug(slug);
  if (!doc) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
      <p className="eyebrow">Teisinė informacija</p>
      <h1 className="mt-4 font-display text-[44px] font-medium leading-none tracking-tight sm:text-[64px]">{doc.title}</h1>
      <p className="mt-5 text-[17px] text-ink/65">{doc.intro}</p>

      <div className="mt-12 space-y-10">
        {doc.sections.map((s, i) => (
          <section key={s.h} className="grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-[180px_1fr] sm:gap-8">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/50">
              <span className="mr-2 font-mono text-ink/30">0{i + 1}</span>
              {s.h}
            </h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink/80">
              {s.p.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav aria-label="Kiti dokumentai" className="mt-16 flex flex-wrap gap-2 border-t border-black/10 pt-8">
        {LEGAL.filter((d) => d.slug !== doc.slug).map((d) => (
          <Link key={d.slug} href={`/teisine-informacija/${d.slug}`} className="ios-btn-ghost">
            {d.title}
          </Link>
        ))}
      </nav>
    </article>
  );
}

import { Console } from "@/components/console/Console";
import { Terminal } from "@/components/terminal/Terminal";
import { SEED_FORMULAS } from "@/lib/seed";
import { SITE } from "@/lib/config";

export default function HomePage() {
  // Struktūrizuoti duomenys paieškos sistemoms (kainos iš pradinio katalogo).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Vaidore",
        url: SITE.url,
        email: SITE.email,
      },
      {
        "@type": "WebSite",
        name: "Vaidore",
        url: SITE.url,
        inLanguage: "lt-LT",
      },
      ...SEED_FORMULAS.map((f) => ({
        "@type": "Product",
        name: f.name,
        sku: f.code,
        description: f.description,
        brand: { "@type": "Brand", name: "Vaidore" },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          price: (f.variants.zmogui.priceCents / 100).toFixed(2),
          availability: "https://schema.org/InStock",
          url: SITE.url,
        },
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Console />
      <Terminal />
    </>
  );
}

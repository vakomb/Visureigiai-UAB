import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ServiceWorkerRegister } from "@/components/system/ServiceWorkerRegister";
import { StoreHydrator } from "@/components/system/StoreHydrator";
import { SITE } from "@/lib/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jetbrains", display: "swap" });

const TITLE = "Vaidore – kvapų ekosistema žmogui, mašinai ir namams";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: "%s · Vaidore" },
  description: SITE.description,
  applicationName: "Vaidore",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: "Vaidore",
    title: TITLE,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}>
      <body className="min-h-svh bg-paper font-sans text-ink antialiased">
        <StoreHydrator />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}

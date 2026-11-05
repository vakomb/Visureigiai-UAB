import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaidore – kvapų ekosistema",
    short_name: "Vaidore",
    description: "Vienas kvapas žmogui, mašinai ir namams.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#ffffff",
    lang: "lt",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}

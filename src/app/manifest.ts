import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ML Learn",
    short_name: "ML Learn",
    description:
      "Learn machine learning through interactive visualisations, mathematical intuition, and hands-on neural playgrounds.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1326",
    theme_color: "#0b1326",
    orientation: "portrait",
    categories: ["education", "developer", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/logo-favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}

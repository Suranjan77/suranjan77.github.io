export const siteConfig = {
  name: "ML Learn",
  title: "ML Learn | The Digital Observatory",
  description:
    "Understand AI through interactive machine learning visualisations, mathematical intuition, and production-ready learning experiences.",
  shortDescription: "Understand AI, Mathematically & Intuitively",
  locale: "en_GB",
  keywords: [
    "machine learning",
    "deep learning",
    "neural networks",
    "artificial intelligence",
    "data science",
    "interactive learning",
    "algorithm visualisations",
    "ML education",
  ],
} as const;

export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3000";

  return value.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

import type { MetadataRoute } from "next";
import { algorithmsList } from "@/data/algorithms_content";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const algorithmRoutes: MetadataRoute.Sitemap = algorithmsList.map(
    (algorithm) => ({
      url: getAbsoluteUrl(`/algorithms/${algorithm.id}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...algorithmRoutes];
}

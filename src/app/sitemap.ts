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
    {
      url: getAbsoluteUrl("/tracks"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...["foundations", "practitioner", "modern-ai"].map((track) => ({
      url: getAbsoluteUrl(`/tracks/${track}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
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

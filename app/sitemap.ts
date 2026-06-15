import type { MetadataRoute } from "next";

const SITE = "https://cmap-theta.vercel.app";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/business", "/it"].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}

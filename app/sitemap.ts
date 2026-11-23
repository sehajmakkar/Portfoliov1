import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { featuredProjects } from "@/lib/projects-data";
import { getAllBlogs } from "@/util/mdx_clean";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;
  const posts = await getAllBlogs().catch(() => []);

  return [
    { url: url("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: url("/projects"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...featuredProjects.map((p) => ({
      url: url(`/projects/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: url("/resume.pdf"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: url("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: url("/learn"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: url("/kryptonite"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}

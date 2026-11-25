import type { MetadataRoute } from "next";
import { SITE, SITE_URL } from "@/lib/site";
import { featuredProjects } from "@/lib/projects-data";
import { getAllBlogs } from "@/util/mdx_clean";

// lastModified only where a real date is known: stamping every page with the
// build time teaches crawlers to ignore it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${SITE_URL}${path}`;
  const posts = await getAllBlogs().catch(() => []);

  return [
    { url: url("/"), lastModified: SITE.updated },
    { url: url("/about"), lastModified: SITE.updated, images: [url(SITE.image)] },
    { url: url("/projects") },
    ...featuredProjects.map((p) => ({
      url: url(`/projects/${p.slug}`),
      lastModified: p.detail?.updated,
      images: [url(p.src), ...(p.gallery ?? []).map((g) => url(g.src))],
    })),
    { url: url("/resume.pdf") },
    { url: url("/blog") },
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.date })),
    { url: url("/learn") },
    { url: url("/contact") },
    { url: url("/kryptonite") },
  ];
}

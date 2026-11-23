import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// Per-page metadata. Next replaces (not merges) openGraph/twitter from the
// root layout when a page sets them, so set the shared fields here too.
export function pageMeta({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    // absolute: nested layouts with their own title drop the root template
    title: { absolute: `${title} | ${SITE.name}` },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url: path,
      siteName: SITE.name,
      type,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      creator: "@kryptokodes",
      site: "@kryptokodes",
    },
  };
}

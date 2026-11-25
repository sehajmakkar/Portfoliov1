import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// The share image: app/opengraph-image.jpg. A page that sets its own openGraph
// loses the root's file-convention image, so it has to be named again here.
const IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Ink tree whose leaves are green contribution squares, beside the name Sehaj Preet, sehaj.tech and @kryptokodes on X",
};

// Per-page metadata. Next replaces (not merges) openGraph/twitter from the
// root layout when a page sets them, so set the shared fields here too.
export function pageMeta({
  title,
  fullTitle,
  description,
  path,
  type = "website",
  published,
  modified,
}: {
  title: string;
  // when the title already names the person, skip the "| Sehaj Preet" suffix
  fullTitle?: boolean;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  published?: string;
  modified?: string;
}): Metadata {
  const full = fullTitle ? title : `${title} | ${SITE.name}`;
  const shared = {
    title: full,
    description,
    url: path,
    siteName: SITE.name,
    locale: "en_IN",
    images: [IMAGE],
  };
  return {
    // absolute: nested layouts with their own title drop the root template
    title: { absolute: full },
    description,
    alternates: { canonical: path },
    openGraph:
      type === "article"
        ? { ...shared, type, publishedTime: published, modifiedTime: modified, authors: ["/about"] }
        : type === "profile"
          ? { ...shared, type, firstName: "Sehaj", lastName: "Preet", username: SITE.handles.x }
          : { ...shared, type },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      creator: `@${SITE.handles.x}`,
      site: `@${SITE.handles.x}`,
      images: [IMAGE],
    },
  };
}

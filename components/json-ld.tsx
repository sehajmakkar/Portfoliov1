import { SITE, SITE_URL, abs } from "@/lib/site";
import type { Project } from "@/lib/projects-data";

// One graph across the site: every page points at the same Person and WebSite
// nodes by @id, so search and answer engines see a single entity.
export const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const IMAGE_ID = `${SITE_URL}/#portrait`;

const personRef = { "@type": "Person", "@id": PERSON_ID, name: SITE.name, url: SITE_URL };
const websiteRef = { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE.name, url: `${SITE_URL}/` };
const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    givenName: "Sehaj",
    familyName: "Preet",
    alternateName: SITE.alternateNames,
    url: SITE_URL,
    mainEntityOfPage: abs("/about"),
    image: {
      "@type": "ImageObject",
      "@id": IMAGE_ID,
      url: abs(SITE.image),
      contentUrl: abs(SITE.image),
      width: 1200,
      height: 1200,
      caption: SITE.name,
    },
    email: `mailto:${SITE.email}`,
    jobTitle: SITE.role,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressCountry: SITE.location.country,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: SITE.education.school,
      parentOrganization: { "@type": "CollegeOrUniversity", name: SITE.education.university },
    },
    knowsAbout: SITE.knowsAbout,
    award: SITE.awards,
    sameAs: Object.values(SITE.links),
  };
}

const websiteSchema = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE.name,
  alternateName: ["sehaj.tech", ...SITE.alternateNames],
  description: SITE.description,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

export function homeSchema() {
  return graph(
    websiteSchema,
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: `${SITE.name}, ${SITE.role}`,
      isPartOf: websiteRef,
      about: { "@id": PERSON_ID },
      primaryImageOfPage: { "@id": IMAGE_ID },
      dateModified: SITE.updated,
    },
    personSchema(),
  );
}

// the one page that is about the person and nothing else
export function aboutSchema() {
  return graph(
    {
      "@type": "ProfilePage",
      "@id": `${abs("/about")}#profile`,
      url: abs("/about"),
      name: `About ${SITE.name}`,
      isPartOf: websiteRef,
      mainEntity: { "@id": PERSON_ID },
      dateCreated: SITE.created,
      dateModified: SITE.updated,
    },
    personSchema(),
    websiteSchema,
    breadcrumbs(["About", "/about"]),
  );
}

// trail of [name, path], Home is added
export function breadcrumbs(...trail: [string, string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: ([["Home", "/"], ...trail] as [string, string][]).map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

// any other page: what kind it is, and what it lists
export function pageSchema({
  type = "WebPage",
  name,
  path,
  description,
  items,
}: {
  type?: "WebPage" | "CollectionPage" | "ContactPage" | "Blog";
  name: string;
  path: string;
  description: string;
  items?: object[];
}) {
  return graph(
    {
      "@type": type,
      "@id": `${abs(path)}#webpage`,
      url: abs(path),
      name,
      description,
      isPartOf: websiteRef,
      author: personRef,
      ...(type === "ContactPage" ? { mainEntity: { "@id": PERSON_ID } } : {}),
      ...(items
        ? {
            mainEntity: {
              "@type": "ItemList",
              itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
            },
          }
        : {}),
    },
    breadcrumbs([name, path]),
  );
}

export function projectItem(p: Project) {
  return {
    "@type": "SoftwareApplication",
    "@id": p.detail ? `${abs(`/projects/${p.slug}`)}#app` : undefined,
    name: p.title,
    description: p.detail?.what ?? p.description,
    url: p.detail ? abs(`/projects/${p.slug}`) : p.live || p.github,
    applicationCategory: p.detail?.category,
    operatingSystem: p.detail?.os,
    author: personRef,
  };
}

export function projectSchema(p: Project) {
  const d = p.detail!;
  const url = abs(`/projects/${p.slug}`);
  return graph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: d.seoTitle,
      description: d.seoDescription,
      isPartOf: websiteRef,
      author: personRef,
      mainEntity: { "@id": `${url}#app` },
      datePublished: d.created,
      dateModified: d.updated,
      primaryImageOfPage: { "@type": "ImageObject", url: abs(p.src), caption: d.alt },
    },
    {
      ...projectItem(p),
      image: abs(p.src),
      screenshot: p.gallery?.map((g) => ({ "@type": "ImageObject", url: abs(g.src), caption: g.caption })),
      dateCreated: d.created,
      dateModified: d.updated,
      featureList: d.how,
      ...(p.live ? { installUrl: p.live } : {}),
    },
    ...(p.github
      ? [
          {
            "@type": "SoftwareSourceCode",
            "@id": `${url}#code`,
            name: `${p.title} source code`,
            codeRepository: p.github,
            programmingLanguage: d.languages,
            dateCreated: d.created,
            dateModified: d.updated,
            author: personRef,
            targetProduct: { "@id": `${url}#app` },
          },
        ]
      : []),
    breadcrumbs(["Projects", "/projects"], [p.title, `/projects/${p.slug}`]),
  );
}

export function postSchema(slug: string, post: { title?: string; description?: string; date?: string; image?: string }) {
  const title = post.title ?? slug;
  return graph(
    {
      "@type": "BlogPosting",
      "@id": `${abs(`/blog/${slug}`)}#post`,
      url: abs(`/blog/${slug}`),
      headline: title,
      description: post.description,
      datePublished: post.date,
      image: abs(post.image?.replace(/^\/public/, "") ?? "/opengraph-image.jpg"),
      author: personRef,
      isPartOf: websiteRef,
    },
    breadcrumbs(["Blog", "/blog"], [title, `/blog/${slug}`]),
  );
}

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON from our own constants; escape "<" so it can't close the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

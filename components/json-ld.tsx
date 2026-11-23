import { SITE, SITE_URL, abs } from "@/lib/site";
import type { Project } from "@/lib/projects-data";

export const PERSON_ID = `${SITE_URL}/#person`;

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    url: SITE_URL,
    image: abs(SITE.image),
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

export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: `${SITE.name}, ${SITE.role}`,
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        publisher: { "@id": PERSON_ID },
      },
      personSchema(),
    ],
  };
}

export function projectSchema(p: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.detail?.what ?? p.description,
    url: abs(`/projects/${p.slug}`),
    ...(p.github ? { codeRepository: p.github } : {}),
    ...(p.live ? { sameAs: [p.live] } : {}),
    programmingLanguage: p.detail?.stack,
    author: { "@type": "Person", "@id": PERSON_ID, name: SITE.name, url: SITE_URL },
    image: abs(p.src),
  };
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

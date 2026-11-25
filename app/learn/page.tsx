import Container from "@/components/containers";
import JsonLd, { PERSON_ID, pageSchema } from "@/components/json-ld";
import Courses from "@/components/learn/courses";
import { LEARN_URL, courses } from "@/components/learn/courses-data";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

const description =
  "Free, open-source courses by Sehaj Preet that take one technology from first principles to production. Docker is live, system design is being written.";

export const metadata = pageMeta({ title: "Free Docker and system design courses", description, path: "/learn" });

const rail =
  "absolute top-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12";

export default function Learn() {
  return (
    <Container className="mx-auto min-h-screen px-8 pt-24 pb-16 md:p-20 md:pb-16">
      <JsonLd
        data={pageSchema({
          type: "CollectionPage",
          name: "Learn",
          path: "/learn",
          description,
          items: courses.map((c) => ({
            "@type": "Course",
            name: c.title,
            description: c.description,
            url: `${LEARN_URL}/${c.id}`,
            isAccessibleForFree: true,
            provider: { "@type": "Person", "@id": PERSON_ID, name: SITE.name },
          })),
        })}
      />
      <div className={`${rail} right-0`} />
      <div className={`${rail} left-0`} />

      <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Learn</span>
      </h1>

      <div className="absolute right-6 my-3 hidden h-px w-212 bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

      <Courses />
    </Container>
  );
}

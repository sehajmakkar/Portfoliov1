import Container from "@/components/containers";
import JsonLd, { pageSchema, projectItem } from "@/components/json-ld";
import Projects from "@/components/projects";
import { projects } from "@/lib/projects-data";
import { pageMeta } from "@/lib/seo";

const description =
  "Projects by Sehaj Preet: Vero (AI LaTeX editor), McAgent (local-first macOS agent), Agent Labs (agent evals and debugging) and Genomics AI.";

export const metadata = pageMeta({ title: "AI agent and backend projects", description, path: "/projects" });

const rail =
  "absolute top-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12";

export default function ProjectsPage() {
  return (
    <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
      <JsonLd
        data={pageSchema({
          type: "CollectionPage",
          name: "Projects",
          path: "/projects",
          description,
          items: projects.map(projectItem),
        })}
      />
      <div className={`${rail} right-0`} />
      <div className={`${rail} left-0`} />

      <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Projects</span>
      </h1>

      <div className="absolute right-6 my-3 hidden h-px w-212 bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

      <Projects showAll={true} />
    </Container>
  );
}

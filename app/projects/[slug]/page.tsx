import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Github, Globe } from "lucide-react";
import Container from "@/components/containers";
import JsonLd, { projectSchema } from "@/components/json-ld";
import { featuredProjects, getProject, statusLabel } from "@/lib/projects-data";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProjects.filter((p) => p.detail).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const p = getProject((await params).slug);
  if (!p?.detail) return {};
  return pageMeta({
    title: p.detail.seoTitle,
    description: p.detail.seoDescription,
    path: `/projects/${p.slug}`,
    type: "article",
    published: p.detail.created,
    modified: p.detail.updated,
  });
}

const month = (d: string) =>
  new Date(d).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });

const rail =
  "absolute top-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12";
const rule =
  "-mx-2 my-6 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15";

export default async function ProjectPage({ params }: { params: Params }) {
  const p = getProject((await params).slug);
  if (!p?.detail) notFound();
  const d = p.detail;

  const more = featuredProjects.filter((o) => o.slug !== p.slug);

  return (
    <Container className="relative mx-auto min-h-screen px-8 pt-24 pb-16 md:p-20 md:pb-16">
      <JsonLd data={projectSchema(p)} />
      <div className={`${rail} right-0`} />
      <div className={`${rail} left-0`} />

      <article className="font-custom2">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={14} aria-hidden="true" /> All projects
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-custom text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {p.title}
            </h1>
            {p.status && (
              <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                {statusLabel[p.status]}
              </span>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
            {d.what}
          </p>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Built by{" "}
            <Link href="/about" rel="author" className="text-neutral-900 underline underline-offset-4 dark:text-neutral-100">
              {SITE.name}
            </Link>
            . Started <time dateTime={d.created}>{month(d.created)}</time>, last updated{" "}
            <time dateTime={d.updated}>{month(d.updated)}</time>.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {p.live && (
              <a
                href={p.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
              >
                <Globe size={14} aria-hidden="true" /> Live site
              </a>
            )}
            {p.github && (
              <a
                href={p.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
              >
                <Github size={14} aria-hidden="true" /> Source on GitHub
              </a>
            )}
          </div>
        </header>

        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <Image
            src={p.src}
            alt={d.alt}
            width={1200}
            height={750}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className={rule} />

        <section aria-labelledby="how">
          <h2 id="how" className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            How it works
          </h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {d.how.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {d.numbers && (
          <>
            <div className={rule} />
            <section aria-labelledby="numbers">
              <h2 id="numbers" className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Numbers
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {d.numbers.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {d.story && (
          <>
            <div className={rule} />
            <section aria-labelledby="story">
              <h2 id="story" className="scroll-mt-24 font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {d.story.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {d.story.body}
              </p>
            </section>
          </>
        )}

        {p.gallery && (
          <>
            <div className={rule} />
            <section aria-labelledby="screens">
              <h2 id="screens" className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Screenshots
              </h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {p.gallery.filter((g) => !g.cover).map((g) => (
                  <figure key={g.src}>
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                      <Image src={g.src} alt={g.caption} width={800} height={600} className="max-h-full w-auto object-contain" />
                    </div>
                    <figcaption className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{g.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </>
        )}

        <div className={rule} />

        <section aria-labelledby="stack">
          <h2 id="stack" className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Stack
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {d.stack.map((s) => (
              <li
                key={s}
                className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:text-neutral-200"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        <div className={rule} />

        <nav aria-labelledby="more">
          <h2 id="more" className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            More projects
          </h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {more.map((o) => (
              <li key={o.slug}>
                <Link href={`/projects/${o.slug}`} className="font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100">
                  {o.title}
                </Link>
                : {o.description}
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </Container>
  );
}

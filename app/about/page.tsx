import Image from "next/image";
import Link from "next/link";
import Container from "@/components/containers";
import JsonLd, { aboutSchema } from "@/components/json-ld";
import { experience } from "@/lib/experience";
import { featuredProjects } from "@/lib/projects-data";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMeta({
  title: `About ${SITE.name} (kryptokodes, Sehaj Makkar)`,
  fullTitle: true,
  description:
    "Who is Sehaj Preet? An AI and backend engineer in Delhi, also known as kryptokodes and Sehaj Makkar. Work at PowerPlay, Perf and Reslink, and projects.",
  path: "/about",
  type: "profile",
});

const rail =
  "absolute top-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12";
const rule =
  "-mx-2 my-6 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15";
const h2 = "font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50";
const link =
  "text-neutral-900 underline decoration-neutral-300 underline-offset-[3px] transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100";
const body = "text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300";

const profiles = [
  { where: "GitHub", as: SITE.handles.github, href: SITE.links.github },
  { where: "LinkedIn", as: SITE.handles.linkedin, href: SITE.links.linkedin },
  { where: "X", as: `@${SITE.handles.x}`, href: SITE.links.x },
  { where: "Medium", as: "@sehajmakkar007", href: SITE.links.medium },
  { where: "Courses", as: "learn.sehaj.tech", href: SITE.links.learn },
];

export default function About() {
  const lessons = featuredProjects.filter((p) => p.detail?.story);

  return (
    <Container className="relative mx-auto min-h-screen px-8 pt-24 pb-16 md:p-20 md:pb-16">
      <JsonLd data={aboutSchema()} />
      <div className={`${rail} right-0`} />
      <div className={`${rail} left-0`} />

      <article className="font-custom2">
        <header className="flex flex-col-reverse items-start gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-xl">
            <h1 className="font-custom text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              About {SITE.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
              Sehaj Preet is an AI and backend engineer based in Delhi, India, who builds AI agents,
              the evals that test them, and the backends they run on. Online, Sehaj goes by
              kryptokodes on X and sehajmakkar on GitHub, and some older profiles use the name Sehaj
              Makkar.
            </p>
          </div>
          <Image
            src={SITE.image}
            alt="Sehaj Preet, drawn in black ink, wearing a turban and glasses"
            width={1200}
            height={1200}
            priority
            className="h-28 w-28 shrink-0 rounded-xl border border-neutral-200 sm:h-36 sm:w-36 dark:border-neutral-800"
          />
        </header>

        <div className={rule} />

        <section aria-labelledby="work">
          <h2 id="work" className={h2}>
            Where I&apos;ve worked
          </h2>
          <ul className="mt-3 space-y-4">
            {experience.map((c) => {
              const r = c.content[0];
              return (
                <li key={c.title} className={body}>
                  <p>
                    <a href={r.href} target="_blank" rel="noopener noreferrer" className={`font-medium ${link}`}>
                      {r.title}
                    </a>
                    , {r.type}. <span className="text-neutral-500 dark:text-neutral-400">{r.dates}, {r.location}</span>
                  </p>
                  <p className="mt-1">{r.description.trim().split("\n")[0].trim()}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={rule} />

        <section aria-labelledby="building">
          <h2 id="building" className={h2}>
            What I build
          </h2>
          <ul className="mt-3 space-y-3">
            {featuredProjects.map((p) => (
              <li key={p.slug} className={body}>
                <Link href={`/projects/${p.slug}`} className={`font-medium ${link}`}>
                  {p.title}
                </Link>
                : {p.detail?.what.replace(new RegExp(`^${p.title} (is )?`), "")}
              </li>
            ))}
          </ul>
          <p className={`mt-4 ${body}`}>
            There are more on the{" "}
            <Link href="/projects" className={link}>
              projects page
            </Link>
            , and I write free courses at{" "}
            <a href={SITE.links.learn} className={link}>
              learn.sehaj.tech
            </a>
            , starting with Docker.
          </p>
        </section>

        <div className={rule} />

        <section aria-labelledby="lessons">
          <h2 id="lessons" className={h2}>
            Things I learned by getting them wrong
          </h2>
          <ul className="mt-3 space-y-4">
            {lessons.map((p) => (
              <li key={p.slug} className={body}>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  <Link href={`/projects/${p.slug}#story`} className={link}>
                    {p.detail!.story!.title}
                  </Link>
                </h3>
                <p className="mt-1">{p.detail!.story!.body.match(/^.+?\.(?= )/)?.[0]}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className={rule} />

        <section aria-labelledby="background">
          <h2 id="background" className={h2}>
            Education and awards
          </h2>
          <ul className={`mt-3 space-y-2 ${body}`}>
            <li>
              {SITE.education.degree}, {SITE.education.school} ({SITE.education.university}),{" "}
              {SITE.education.years}.
            </li>
            <li>1st place at Hackaccino 3.0, Bennett University, out of 250+ teams.</li>
            <li>President of MindFlare at MAIT: ran hackathons and mentored 50+ people on web and AI projects.</li>
          </ul>
        </section>

        <div className={rule} />

        <section aria-labelledby="elsewhere">
          <h2 id="elsewhere" className={h2}>
            Elsewhere
          </h2>
          <dl className={`mt-3 grid max-w-md grid-cols-[7rem_1fr] gap-y-1.5 ${body}`}>
            {profiles.map((p) => (
              <div key={p.where} className="contents">
                <dt className="text-neutral-500 dark:text-neutral-400">{p.where}</dt>
                <dd>
                  <a href={p.href} target="_blank" rel="me noopener noreferrer" className={link}>
                    {p.as}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <p className={`mt-5 ${body}`}>
            I&apos;m open to AI and backend roles and to freelance projects, and I can start right away. Read my{" "}
            <a href={SITE.resume} target="_blank" rel="noopener" className={link}>
              resume
            </a>{" "}
            or{" "}
            <Link href="/contact" className={link}>
              send me a message
            </Link>
            .
          </p>
        </section>
      </article>
    </Container>
  );
}

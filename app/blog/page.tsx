import Container from "@/components/containers";
import { getAllBlogs } from "@/util/mdx_clean";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Karn Singh",
  description:
    "Thoughts on software engineering, web development, and technology",
};

export default async function BlogIndex() {
  const posts = await getAllBlogs();

  const externalPosts = [
    {
      id: "medium-authentication-101",
      title: "Authentication 101",
      description:
        "A technical overview of web authentication covering session vs JWT mechanisms, token handling, and scalability trade-offs.",
      href: "https://medium.com/@sehajmakkar007/authentication-101-05ae1da8c69c",
      date: "2025-07-06" as string | null,
      tag: "Medium",
      isExternal: true,
    },
  ];

  const localPosts = posts.map((p) => ({
    id: p.slug,
    title: p.title ?? p.slug,
    description: p.description,
    href: `/blog/${p.slug}`,
    date: p.date ?? null,
    tag: null as string | null,
    isExternal: false,
  }));

  const allPosts = [...externalPosts, ...localPosts].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Container className="relative mx-auto min-h-screen px-8 pt-24 md:p-20 md:pb-10">
      <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12" />

      {/* LEFT BORDER */}
      <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12" />
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-3">
          <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
            <span className="link--elara">All blogs</span>
          </h1>

          <p className="text-s font-custom2 mt-1 max-w-xl leading-relaxed tracking-tight text-neutral-600 dark:text-neutral-400">
            Learning and sharing thoughts on software engineering, web development, and technology.
          </p>
        </div>
        <div className="absolute right-6 hidden h-px w-[53rem] bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

        {/* Blog Posts List */}
        <div className="mt-8 flex flex-col gap-4">
          {allPosts.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              target={p.isExternal ? "_blank" : undefined}
              rel={p.isExternal ? "noopener noreferrer" : undefined}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-transparent p-5 transition-all duration-300 hover:border-neutral-300/50 hover:bg-white hover:shadow-sm md:p-6 dark:border-neutral-800/50 dark:hover:border-neutral-700/50 dark:hover:bg-neutral-900/40 dark:hover:shadow-none"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3 md:justify-start">
                    <div className="flex items-center gap-2">
                      <h2 className="font-custom text-lg font-bold text-neutral-900 transition-colors group-hover:text-neutral-700 md:text-xl dark:text-neutral-100 dark:group-hover:text-neutral-300">
                        {p.title}
                      </h2>
                      {p.tag && (
                        <span className="rounded border border-emerald-300/70 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {p.tag}
                        </span>
                      )}
                    </div>

                    {/* Arrow for mobile, visible inline with title */}
                    <ArrowRight className="h-4 w-4 -rotate-45 text-neutral-400 md:hidden" />
                  </div>

                  {p.description && (
                    <p className="font-custom2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-1">
                  {p.date && (
                    <time className="font-custom2 text-xs font-medium tracking-widest whitespace-nowrap text-neutral-400 uppercase dark:text-neutral-500">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}

                  {/* Arrow for desktop, slides up from bottom */}
                  <div className="absolute right-6 bottom-4 hidden translate-y-2 items-center gap-1 text-xs font-medium text-neutral-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex dark:text-neutral-400">
                    <span>Read</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

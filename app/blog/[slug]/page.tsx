import Container from "@/components/containers";
import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getSingleBlog } from "@/util/mdx_clean";

export const metadata: Metadata = {
  title: "Blog | Sehaj Preet",
  description: "Reading a blog...",
};

type PageParams = Promise<{ slug: string }>;

export default async function SingleBlogPage({
  params,
}: {
  params: PageParams;
}) {
  // `params` may be a Promise in some Next versions; await to unwrap it safely
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  let content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let frontmatter: Record<string, any> = {};
  try {
    const res = await getSingleBlog(slug);
    content = res.content;
    frontmatter = res.data || {};
  } catch {
    notFound();
  }

  return (
    <Container className="font-custom2 min-h-screen px-8 pt-24 tracking-tight md:p-20 md:pb-10">
      <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-90 dark:opacity-15" />

      {/* LEFT BORDER */}
      <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-90 dark:opacity-15" />
      <h1 className="font-custom text-4xl font-bold text-neutral-900 md:text-5xl dark:text-neutral-50">
        {frontmatter.title ?? slug}
      </h1>

      {frontmatter.date ? (
        <p className="mt-2 text-right text-sm text-neutral-600 dark:text-neutral-400">
          {frontmatter.date}
        </p>
      ) : null}

      {frontmatter.image ? (
        <div className="mx-auto my-6 max-w-3xl">
          <Image
            src={
              frontmatter.image.startsWith("/public")
                ? frontmatter.image.replace("/public", "")
                : frontmatter.image
            }
            alt={frontmatter.title ?? ""}
            width={1200}
            height={600}
            className="h-auto w-full rounded-xl object-cover shadow-xl"
          />
        </div>
      ) : null}

      <div className="prose font-custom2 mx-auto tracking-normal">
        <MDXRemote source={content} />
      </div>
    </Container>
  );
}

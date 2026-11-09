"use client";

import Container from "@/components/containers";
import Courses from "@/components/learn/courses";

export default function Learn() {
  return (
    <Container className="mx-auto min-h-screen px-8 pt-24 pb-16 md:p-20 md:pb-16">
      {/* RIGHT BORDER */}
      <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

      {/* LEFT BORDER */}
      <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

      <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Learn</span>
      </h1>

      <div className="absolute right-6 my-3 hidden h-px w-212 bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

      <Courses />
    </Container>
  );
}

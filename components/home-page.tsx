"use client";

import { useState } from "react";

import Container from "@/components/containers";

import Projects from "@/components/projects";
import { FileText, Github, Linkedin, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import Timeline from "@/components/timeline";
import GithubGraph from "@/components/githubgraph";
import type { ContributionData } from "@/lib/contributions";
import Skills from "@/components/skills";
import GetInTouch from "@/components/get-in-touch";
import Education from "@/components/education";
import LinkPreview from "@/components/link-preview";
import { useLenis } from "lenis/react";
import KoiPond from "@/components/pond/koi-pond";
import Desk from "@/components/desk/desk";
import NameSwitch from "@/components/kryptonite/name-switch";
import Rangoli from "@/components/diwali/rangoli";
import { useDiwali } from "@/lib/festive";

export default function HomePage({
  contributions,
}: {
  contributions: ContributionData | null;
}) {
  const lenis = useLenis();
  const diwali = useDiwali();

  const scrollToGetInTouch = () => {
    const target = document.getElementById("get-in-touch");
    if (!target) return;
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startups = [
    { name: "Perf", href: "https://withperf.com/", image: "/previews/perf.webp" },
    { name: "PowerPlay", href: "https://www.getpowerplay.ai/", image: "/previews/powerplay.webp" },
    { name: "Reslink", href: "https://reslink.org/", image: "/previews/reslink.webp" },
  ];

  const socials = [
    { name: "GitHub", icon: Github, href: "https://github.com/sehajmakkar" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/sehajmakkar" },
    { name: "X", icon: FaXTwitter, href: "https://x.com/kryptokodes" },
    { name: "Email", icon: Mail, href: "mailto:sehajmakkar007@gmail.com" },
  ];

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden font-sans">
      <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
        {/* RIGHT BORDER */}
        <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        {/* LEFT BORDER */}
        <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        <KoiPond />

        {/* ---------------------------------------- */}
        {/* HEADING + SOCIALS (FIXED SAME LINE) */}
        {/* ---------------------------------------- */}

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
            <NameSwitch />
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:justify-end">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "me noopener noreferrer" : undefined}
                aria-label={social.name}
                title={social.name}
                className="text-neutral-900 opacity-70 transition hover:opacity-100 dark:text-neutral-50"
              >
                <social.icon size={20} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* ---------------------------------------- */}
        {/* SUBTEXT: plain facts, also what AI answers quote */}
        {/* ---------------------------------------- */}

        <div className="text-secondary font-custom2 mt-2 max-w-3xl space-y-2 dark:text-neutral-300">
          <p className="text-base font-medium text-neutral-900 dark:text-neutral-50">
            I build AI agents, evals and the backends they run on.
          </p>
          <p className="text-sm">
            Previously at 3 startups:{" "}
            {startups.map((s, i) => (
              <span key={s.name}>
                <LinkPreview href={s.href} image={s.image} className="text-neutral-900 underline decoration-neutral-300 underline-offset-[3px] transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100">
                  {s.name}
                </LinkPreview>
                {i < startups.length - 2 ? ", " : i === startups.length - 2 ? " and " : "."}
              </span>
            ))}
            <br />
            Open to AI and backend roles.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-50 transition-opacity hover:opacity-85 dark:border-neutral-700 dark:bg-neutral-50 dark:text-neutral-900"
            >
              <FileText size={14} aria-hidden="true" />
              Resume
            </a>
            <button
              type="button"
              onClick={scrollToGetInTouch}
              className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-[3px] transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-600 dark:hover:decoration-neutral-100"
            >
              Get in touch
            </button>
          </div>
        </div>

        <div className="relative">
          <div className={`-mx-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15 ${diwali ? "my-10" : "my-6"}`}></div>
          {diwali && <Rangoli />}
        </div>

        <Projects />

        <div className="-mx-2 my-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

        <Timeline></Timeline>

        <GithubGraph contributions={contributions} />

        <Desk />

        <Skills />

        <Education />

        <div id="get-in-touch">
          <GetInTouch />
        </div>
      </Container>
    </div>
  );
}

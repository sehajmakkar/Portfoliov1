"use client";

import { useState } from "react";

import Container from "@/components/containers";

import Projects from "@/components/projects";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Timeline from "@/components/timeline";
import GithubGraph from "@/components/githubgraph";
import Skills from "@/components/skills";
import GetInTouch from "@/components/get-in-touch";

export default function Home() {
  const socials = [
    {
      name: "GitHub",
      icon: Github,
      action: () => window.open("https://github.com/sehajmakkar", "_blank"),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      action: () =>
        window.open("https://www.linkedin.com/in/sehajmakkar", "_blank"),
    },
    {
      name: "X",
      icon: Twitter,
      action: () => window.open("https://x.com/sehajmakkarr", "_blank"),
    },
    {
      name: "Email",
      icon: Mail,
      action: () => (window.location.href = "mailto:sehajmakkar007@gmail.com"),
    },
  ];

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden font-sans">
      <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
        {/* RIGHT BORDER */}
        <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        {/* LEFT BORDER */}
        <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        {/* ---------------------------------------- */}
        {/* HEADING + SOCIALS (FIXED SAME LINE) */}
        {/* ---------------------------------------- */}

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
            <span className="link--elara">Sehaj Preet</span>
          </h1>

          <div className="flex flex-wrap gap-4 sm:justify-end">
            {socials.map((social) => (
              <div
                key={social.name}
                className="group relative cursor-alias"
                onClick={social.action}
              >
                <social.icon
                  size={20}
                  className="text-neutral-900 opacity-70 transition hover:opacity-100 dark:text-neutral-50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------- */}
        {/* SUBTEXT */}
        {/* ---------------------------------------- */}

        <div className="text-secondary font-custom2 text-s mt-1">
          <p>
            <span className="font-semibold text-neutral-950 dark:text-neutral-100"></span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Engineer / Artist — I love building and breaking stuff.
            </span>
          </p>

          <p>
            <span className="font-bold text-neutral-950 dark:text-neutral-100"></span>
            <span className="text-neutral-700 dark:text-neutral-300">
              AI is something that excites me nowadays.
            </span>
          </p>

          <p>
            <span className="font-semibold text-neutral-950 dark:text-neutral-100"></span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Believe in putting my code where my mouth is.
            </span>
          </p>
        </div>

        <div className="-mx-2 my-6 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

        <Projects />

        <div className="-mx-2 my-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

        <Timeline></Timeline>

        <GithubGraph></GithubGraph>

        <Skills />

        <GetInTouch />
      </Container>
    </div>
  );
}

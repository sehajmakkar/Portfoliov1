"use client";

import Container from "@/components/containers";

import Projects from "@/components/projects";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Timeline from "@/components/timeline";
import GithubGraph from "@/components/githubgraph";

import GetInTouch from "@/components/get-in-touch";


export default function Home() {
  return (
    <div className="relative flex min-h-screen justify-center font-sans overflow-hidden">
      <Container className="in-h-[200vh] px-8 pt-24 md:p-20 md:pb-10 mx-auto ">

        {/* RIGHT BORDER */}
        <div
          className="absolute right-0 top-0 h-full w-6 border-x border-x-(--pattern-fg) opacity-80 dark:opacity-12
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed"
        > </div>

        {/* LEFT BORDER */}
        <div
          className="absolute left-0 top-0 h-full w-6 border-x border-x-(--pattern-fg) opacity-80 dark:opacity-12
          bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)]
          bg-size-[10px_10px] bg-fixed"
        ></div>

        {/* ---------------------------------------- */}
        {/* HEADING + SOCIALS (FIXED SAME LINE) */}
        {/* ---------------------------------------- */}

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-900 dark:text-neutral-50">
            <span className="link--elara">Karn Singh</span>
          </h1>

          <div className="flex flex-wrap gap-4 sm:justify-end">
            <Github
              size={20}
              onClick={() => window.open("https://github.com/Ashutoshx7", "_blank")}
              className="text-neutral-900 dark:text-neutral-50 opacity-70 hover:opacity-100 transition cursor-pointer"
            />
            <Linkedin
              size={20}
              onClick={() => window.open("https://linkedin.com/in/your-linkedin", "_blank")}
              className="text-neutral-900 dark:text-neutral-50 opacity-70 hover:opacity-100 transition cursor-pointer"
            />
            <Twitter
              size={20}
              onClick={() => window.open("https://x.com/Ashutosh_7x7", "_blank")}
              className="text-neutral-900 dark:text-neutral-50 opacity-70 hover:opacity-100 transition cursor-pointer"
            />
            <Mail
              size={20}
              onClick={() => (window.location.href = "mailto:as1142120@gmail.com")}
              className="text-neutral-900 dark:text-neutral-50 opacity-70 hover:opacity-100 transition cursor-pointer"
            />
          </div>
        </div>

        {/* ---------------------------------------- */}
        {/* SUBTEXT */}
        {/* ---------------------------------------- */}

        <div className="text-secondary font-custom2 text-s mt-1">
          <p>
            <span className="text-neutral-950 dark:text-neutral-100 font-semibold font-custom">⚀ </span>
            <span className="text-neutral-700 dark:text-neutral-300">Engineer / Artist — I love building and breaking stuff.</span>
          </p>

          <p>
            <span className="text-neutral-950 dark:text-neutral-100 font-semibold">⚁ </span>
            <span className="text-neutral-700 dark:text-neutral-300">AI is something that excites me nowadays.</span>
          </p>

          <p>
            <span className="text-neutral-950 dark:text-neutral-100 font-semibold">⚂ </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Believe in putting my code where my mouth is.
            </span>
          </p>
        </div>

        <div className="hidden md:block absolute right-6 w-[53rem] h-px bg-(--pattern-fg) my-3 opacity-90 dark:opacity-15"></div>



        <Projects />

        <br />
        <div className="hidden md:block absolute right-6 w-[53rem] h-px bg-(--pattern-fg) opacity-90 dark:opacity-15"></div>


        <Timeline></Timeline>


        <br></br>
        <GithubGraph></GithubGraph>

        <br></br>
        <br></br>
        <br></br>
                <div className="hidden md:block absolute right-6 w-[53rem] h-px bg-(--pattern-fg) opacity-90 dark:opacity-15"></div>

        
        <GetInTouch />


      </Container>
    </div>
  );
}
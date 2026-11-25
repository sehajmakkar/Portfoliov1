"use client";

import React from "react";
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiDocker,
  SiGit,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
  SiFastapi,
  SiThreedotjs,
  SiCloudflare,
  SiGooglegemini,
  SiSwift,
  SiSqlite,
  SiOpentelemetry,
  SiPytest,
  SiVitest,
  SiDrizzle,
  SiGithubactions,
  SiGooglechrome,
  SiLangchain,
  SiCplusplus,
  SiAmazonwebservices,
  SiPydantic,
  SiZod,
  SiClerk,
  SiUv,
  SiVercel,
} from "react-icons/si";
import { IconType } from "react-icons";

// Real brand logos only, and only tools with a project or internship behind
// them. color: undefined means a black/white logo that follows the text color.
type Skill = { name: string; icon: IconType; color?: string };

export const skillGroups: { label: string; skills: Skill[] }[] = [
  {
    label: "Languages",
    skills: [
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Python", icon: SiPython, color: "#3776AB" },
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
      { name: "Swift", icon: SiSwift, color: "#F05138" },
      { name: "C++", icon: SiCplusplus, color: "#00599C" },
    ],
  },
  {
    label: "Backend and data",
    skills: [
      { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
      { name: "Express", icon: SiExpress },
      { name: "FastAPI", icon: SiFastapi, color: "#009688" },
      { name: "Pydantic", icon: SiPydantic, color: "#E92063" },
      { name: "Zod", icon: SiZod, color: "#3E67B1" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "Drizzle", icon: SiDrizzle, color: "#9BB52E" },
      { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
      { name: "SQLite", icon: SiSqlite, color: "#44A8E0" },
      { name: "Clerk", icon: SiClerk, color: "#6C47FF" },
    ],
  },
  {
    label: "AI",
    skills: [
      { name: "Gemini API", icon: SiGooglegemini, color: "#8E75FF" },
      { name: "LangGraph", icon: SiLangchain },
      { name: "OpenTelemetry", icon: SiOpentelemetry, color: "#F5A800" },
    ],
  },
  {
    label: "Infra and testing",
    skills: [
      { name: "Docker", icon: SiDocker, color: "#2496ED" },
      { name: "AWS", icon: SiAmazonwebservices, color: "#FF9900" },
      { name: "Cloudflare R2", icon: SiCloudflare, color: "#F38020" },
      { name: "Vercel", icon: SiVercel },
      { name: "GitHub Actions", icon: SiGithubactions, color: "#2088FF" },
      { name: "uv", icon: SiUv, color: "#DE5FE9" },
      { name: "pytest", icon: SiPytest, color: "#0A9EDC" },
      { name: "Vitest", icon: SiVitest, color: "#6E9F18" },
      { name: "Git", icon: SiGit, color: "#F05032" },
    ],
  },
  {
    label: "Frontend",
    skills: [
      { name: "React", icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Three.js", icon: SiThreedotjs },
      { name: "Chrome Extensions", icon: SiGooglechrome, color: "#4285F4" },
    ],
  },
];

export default function Skills() {
  return (
    <div className="relative mt-4 w-full">
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <div className="flex flex-col items-start space-y-3">
        <h2 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
          <span className="link--elara">Skills</span>
        </h2>
      </div>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <div className="flex flex-col items-start space-y-3">
        <p className="font-custom2 mt-3 mb-4 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          Everything here is used in a project or internship above.
        </p>

        <div className="flex w-full flex-col gap-3">
          {skillGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
              <h3 className="font-custom2 w-36 shrink-0 pt-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {group.label}
              </h3>
              <ul className="flex flex-wrap items-center gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="flex cursor-default items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 transition-colors hover:border-neutral-300 dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
                  >
                    <skill.icon
                      className="h-4 w-4 text-neutral-900 transition-colors duration-200 dark:text-neutral-100"
                      style={skill.color ? { color: skill.color } : undefined}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                      {skill.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

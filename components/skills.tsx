"use client";

import React, { useState } from "react";
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiNextdotjs,
  SiPrisma,
  SiPostgresql,
  SiPython,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiExpress,
} from "react-icons/si";
import { FaDatabase, FaLink, FaAws, FaCode } from "react-icons/fa";

const skills = [
  { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "NextJs", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Express", icon: SiExpress, color: "#ffffff" },
  { name: "Nodejs", icon: SiNodedotjs, color: "#339933" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Langchain", icon: FaLink, color: "#00A67E" },
  { name: "Langgraph", icon: FaLink, color: "#8B5CF6" },
  { name: "Postgres", icon: SiPostgresql, color: "#4169E1" },
  { name: "Prisma", icon: SiPrisma, color: "#5A67D8" },
  { name: "C", icon: FaCode, color: "#A8B9CC" },
  { name: "Docker", icon: SiDocker, color: "#2496ED" },
  { name: "Kubernetes", icon: SiKubernetes, color: "#326CE5" },
  { name: "AWS", icon: FaAws, color: "#FF9900" },
  { name: "Git", icon: SiGit, color: "#F05032" },
];

export default function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="relative mt-4 w-full">
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <div className="flex flex-col items-start space-y-3">
        <h1 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
          <span className="link--elara">Skills</span>
        </h1>
      </div>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <div className="flex flex-col items-start space-y-3">
        <p className="font-custom2 mt-3 mb-6 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          I love working with these technologies to build beautiful and
          functional applications.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex cursor-default items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 transition-colors hover:border-neutral-300 dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:hover:border-neutral-600"
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <skill.icon
                className="h-4 w-4 transition-colors duration-200"
                style={{
                  color: hoveredSkill === skill.name ? skill.color : "#737373",
                }}
              />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

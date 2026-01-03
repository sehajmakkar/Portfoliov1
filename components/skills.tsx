"use client";

import React from "react";
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
    { name: "JavaScript", icon: SiJavascript },
    { name: "TypeScript", icon: SiTypescript },
    { name: "React", icon: SiReact },
    { name: "NextJs", icon: SiNextdotjs },
    { name: "Express", icon: SiExpress },
    { name: "Nodejs", icon: SiNodedotjs },
    { name: "Python", icon: SiPython },
    { name: "Langchain", icon: FaLink },
    { name: "Langgraph", icon: FaLink },
    { name: "Postgres", icon: SiPostgresql },
    { name: "Prisma", icon: SiPrisma },
    { name: "C", icon: FaCode },
    { name: "Docker", icon: SiDocker },
    { name: "Kubernetes", icon: SiKubernetes },
    { name: "AWS", icon: FaAws },
    { name: "Git", icon: SiGit },
];

export default function Skills() {
    return (
        <div className="w-full mt-4 relative">
            <div className="flex flex-col items-start space-y-3">
                <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-900 dark:text-neutral-50">
                    <span className="link--elara">Skills</span>
                </h1>

                <p className="tracking-tight font-custom2 text-neutral-600 dark:text-neutral-400 max-w-lg text-sm md:text-base mb-6">
                    I love working with these technologies to build beautiful and functional applications.
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/50 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-default"
                        >
                            <skill.icon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
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

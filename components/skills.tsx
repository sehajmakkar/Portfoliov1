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
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    return (
        <div className="w-full mt-4 relative">
            <div className="flex flex-col items-start space-y-3">
                <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-900 dark:text-neutral-50">
                    <span className="link--elara">Skills</span>
                </h1>

                <p className="tracking-tight font-custom2 text-neutral-600 dark:text-neutral-400 max-w-lg text-sm md:text-base mb-6">
                    I love working with these technologies to build beautiful and functional applications.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="relative cursor-pointer group"
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            <skill.icon className="w-6 h-6 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors" />

                            {hoveredSkill === skill.name && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                                    <div className="relative bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[10px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-neutral-200 dark:border-neutral-700">
                                        {skill.name}

                                        {/* Pixel Cat Decoration */}
                                        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-neutral-900 dark:text-neutral-100">
                                                <path d="M12 2C13 2 14 3 14 4C14 5 13 6 12 6C11 6 10 5 10 4C10 3 11 2 12 2ZM12 7C14.5 7 16.5 9 16.5 11.5C16.5 14 14.5 16 12 16C9.5 16 7.5 14 7.5 11.5C7.5 9 9.5 7 12 7ZM8 11.5C8 12 8.5 12.5 9 12.5C9.5 12.5 10 12 10 11.5C10 11 9.5 10.5 9 10.5C8.5 10.5 8 11 8 11.5ZM15 11.5C15 12 15.5 12.5 16 12.5C16.5 12.5 17 12 17 11.5C17 11 16.5 10.5 16 10.5C15.5 10.5 15 11 15 11.5Z" />
                                            </svg>
                                        </div>

                                        {/* Arrow */}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-100 dark:bg-neutral-800 rotate-45 border-b border-r border-neutral-200 dark:border-neutral-700"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

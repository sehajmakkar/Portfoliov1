import React, { useState } from 'react';
import Image from 'next/image';
import Link from "next/link";
import {
  SiNextdotjs,
  SiTypescript,
  SiReact,
  SiThreedotjs,
  SiPrisma,
  SiCloudflare,
  SiLangchain,
  SiNodedotjs,
} from "react-icons/si";

type TechKey =
  | "next"
  | "ts"
  | "react"
  | "three"
  | "prisma"
  | "cloud"
  | "langchain"
  | "node";

const iconMap: Record<TechKey, any> = {
  next: SiNextdotjs,
  ts: SiTypescript,
  react: SiReact,
  three: SiThreedotjs,
  prisma: SiPrisma,
  cloud: SiCloudflare,
  langchain: SiLangchain,
  node: SiNodedotjs,
};

const techNames: Record<TechKey, string> = {
  next: "Next.js",
  ts: "TypeScript",
  react: "React",
  three: "Three.js",
  prisma: "Prisma",
  cloud: "Cloudflare",
  langchain: "LangChain",
  node: "Node.js",
};

type Data = {
  title: string;
  href?: string;
  content: {
    title: string;
    description: string;
    src: string;
    href: string;
    tech?: TechKey[];
  }[];
};

export const Timeline = () => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const data: Data[] = [
    {
      title: "Google Summer Of Code",
      href: "https://summerofcode.withgoogle.com/",
      content: [
        {
          title: "May 2025 - August 2025",
          description: `
            Built scalable solutions for open source organizations
            Received mentorship from top engineers and industry experts
            Contributed real-world features that impacted thousands of users
          `,
          src: "/Inquiro.png",
          href: "https://summerofcode.withgoogle.com/",
          tech: ["next", "ts", "react", "node"],
        },
      ],
    },
    {
      title: "C4GT",
      href: "https://c4gt.in/",
      content: [
        {
          title: "May 2025 - August 2025",
          description: `
            Developed innovative tools solving real developer problems
            Shipped production features with 10k+ downloads
            Collaborated with open source maintainers and communities
          `,
          src: "/Inquiro.png",
          href: "https://c4gt.in/",
          tech: ["prisma", "cloud", "langchain", "ts"],
        },
      ],
    },
    {
      title: "Open Source Contributor",
      href: "https://github.com/",
      content: [
        {
          title: "December 2024 - April 2024",
          description: `
            Mastered React, Node.js, databases, and deployment technologies
            Contributed to multiple popular open source projects
            Built strong foundation in full-stack development practices
          `,
          src: "/Inquiro.png",
          href: "https://github.com/",
          tech: ["react", "node", "ts"],
        },
      ],
    }
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-900 dark:text-neutral-50 pb-1">
        <span className="link--elara">Experiences</span>
      </h1>

      <div className="pl-6">
        {data.map((year, idx) => (
          <div key={year.title}>
            {year.href ? (
              <Link
                href={year.href}
                target="_blank"
                className="text-neutral-900 dark:text-neutral-50 font-custom font-semibold py-1 tracking-wide text-lg hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <div className="absolute right-6 w-212 h-px bg-(--pattern-fg) border border-dashed opacity-15 dark:opacity-15"></div>
                {year.title}
              </Link>
            ) : (
              <p className="text-neutral-900 dark:text-neutral-50 font-custom font-semibold py-1 tracking-wide text-lg">
                {year.title}
              </p>
            )}

            {year.content.map((item, idx) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 text-neutral-700 dark:text-neutral-300 font-custom2 text-sm md:text-s mt-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50">{item.title}</h3>
                  <ul className="py-5 list-disc pl-6">
                    {item.description
                      .toString()
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                  </ul>

                  {/* 🔹 Icons Updated to match Skills style with Tooltip */}
                  {item.tech && (
                    <div className="flex flex-wrap gap-3 py-3">
                      {item.tech.map((key) => {
                        const Icon = iconMap[key];
                        // Create a unique ID for each instance to avoid conflicts if same tech appears multiple times
                        const uniqueId = `${item.title}-${key}`;

                        return (
                          <div
                            key={key}
                            className="group relative cursor-pointer"
                            onMouseEnter={() => setHoveredTech(uniqueId)}
                            onMouseLeave={() => setHoveredTech(null)}
                          >
                            <Icon
                              className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors"
                            />

                            {hoveredTech === uniqueId && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                                <div className="relative bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[10px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-neutral-200 dark:border-neutral-700">
                                  {techNames[key]}

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
                        );
                      })}
                    </div>
                  )}
                </div>

                <Image
                  src={item.src}
                  alt={item.title}
                  width={200}
                  height={120}
                  className="rounded-full size-10 self-start md:self-auto"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

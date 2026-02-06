import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';
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
import { IconType } from "react-icons";

type TechKey =
  | "next"
  | "ts"
  | "react"
  | "three"
  | "prisma"
  | "cloud"
  | "langchain"
  | "node";

const iconMap: Record<TechKey, IconType> = {
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
    type?: string;
    dates?: string;
    location?: string;
    imageFit?: "contain" | "cover";
    imageZoom?: number;
  }[];
};

export const Timeline = () => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  // Track which experience is open (by index)
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const data: Data[] = [
    {
      title: "Google Summer Of Code",
      href: "https://summerofcode.withgoogle.com/",
      content: [
        {
          title: "Google Summer Of Code",
          description: `
            Built scalable solutions for open source organizations
            Received mentorship from top engineers and industry experts
            Contributed real-world features that impacted thousands of users
            Optimized codebase performance and reduced technical debt significantly
          `,
          src: "/Experience-image/Google_Summer_of_Code_sun_logo_2022.svg%20(1).png",
          href: "https://summerofcode.withgoogle.com/",
          tech: ["next", "ts", "react", "node"],
          dates: "May 2025 - August 2025",
          location: "Remote",
          imageFit: "contain",
          imageZoom: 0.9,
        },
      ],
    },
    {
      title: "C4GT",
      href: "https://c4gt.in/",
      content: [
        {
          title: "C4GT",
          description: `
            Developed innovative tools solving real developer problems
            Shipped production features with 10k+ downloads
            Collaborated with open source maintainers and communities
            Authored technical documentation to streamline developer onboarding
          `,
          src: "https://static.wixstatic.com/media/060b0c_8029055ce0074bfaa4bb6d9f1c2c33d2~mv2.png/v1/fill/w_2266,h_2168,al_c,q_95,usm_0.66_1.00_0.01,enc_auto/060b0c_8029055ce0074bfaa4bb6d9f1c2c33d2~mv2.png",
          href: "https://c4gt.in/",
          tech: ["prisma", "cloud", "langchain", "ts"],
          dates: "May 2025 - August 2025",
          location: "Remote",
          imageFit: "contain",
          imageZoom: 1.2,
        },
      ],
    },
    {
      title: "Open Source Contributor",
      href: "https://github.com/",
      content: [
        {
          title: "Open Source Contributor",
          description: `
            Mastered React, Node.js, databases, and deployment technologies
            Contributed to multiple popular open source projects
            Built strong foundation in full-stack development practices
            Participated in code reviews and community discussions actively
          `,
          src: "/Experience-image/pngegg%20(1).png",
          href: "https://github.com/",
          tech: ["react", "node", "ts"],
          dates: "December 2024 - April 2024",
          location: "Remote",
          imageFit: "contain",
          imageZoom: 1.5,
        },
      ],
    }
  ];

  return (
    <div>

      <h1 className="text-3xl md:text-3xl font-bold font-custom tracking-tight text-neutral-950 dark:text-neutral-50 pb-2 mt-2">
        <span className="link--elara">Experiences</span>
      </h1>
      <div className="w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 dark:opacity-15 mb-4 -mx-2 md:-mx-14"></div>
      <div className="flex flex-col gap-4">
        {data.map((year, idx) => (
          <div key={year.title} className="relative pb-2 -mx-2 md:-mx-14 px-2 md:px-14">
            {year.content.map((item, cidx) => {
              const isOpen = openIdx === idx * 100 + cidx;
              return (
                <React.Fragment key={item.title}>
                  <div
                    className="flex items-center gap-4 group py-3 cursor-pointer"
                    onClick={() => setOpenIdx(isOpen ? null : idx * 100 + cidx)}
                  >
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-lg border border-neutral-200 dark:border-neutral-700 p-[2px] shrink-0">
                      <div
                        className={`w-full h-full rounded-md border border-neutral-200/70 dark:border-neutral-700/70 overflow-hidden ${item.imageFit === 'contain' ? 'bg-neutral-50 dark:bg-neutral-50' : 'bg-neutral-50 dark:bg-neutral-900'}`}
                      >
                        <Image
                          src={item.src}
                          alt={item.title}
                          width={48}
                          height={48}
                          style={item.imageZoom ? { transform: `scale(${item.imageZoom})` } : undefined}
                          className={`${item.imageFit === 'contain' ? 'object-contain' : 'object-cover'} w-full h-full`}
                        />
                      </div>
                    </div>
                    {/* Main summary info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base md:text-lg text-neutral-950 dark:text-neutral-50 truncate">
                          {item.title}
                        </span>
                        {/* Optional: Full Time/Intern/Other badge */}
                        {item.type && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-neutral-700 text-xs text-neutral-100 font-medium border border-neutral-600">
                            {item.type}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Dates and location */}
                    <div className="text-right min-w-[120px]">
                      <div className="text-xs md:text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                        {item.dates || item.title}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.location || "Remote"}
                      </div>
                    </div>
                    {/* See/Arrow button */}
                    <div
                      className="ml-2 flex items-center justify-center w-7 h-7 p-0 bg-transparent border-none shadow-none focus:outline-none group"
                    >
                      <FiChevronDown
                        className={`w-5 h-5 transition-transform duration-300 stroke-[2.2] ${isOpen ? 'rotate-180 text-neutral-950 dark:text-neutral-50' : 'text-neutral-500 dark:text-neutral-500 group-hover:text-neutral-950 dark:group-hover:text-neutral-50'}`}
                        aria-hidden="true"
                      />
                      <span className="sr-only">{isOpen ? 'Hide details' : 'Show details'}</span>
                    </div>
                  </div>
                  {/* Details section with smooth accordion animation */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      {/* Inner container for padding control */}
                      <div className={`${isOpen ? 'py-4 opacity-100 translate-y-0' : 'py-0 opacity-0 -translate-y-2'} transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]`}>
                        <ul className="mb-4 list-disc list-inside pl-0 text-neutral-800 dark:text-neutral-200 text-sm space-y-2">
                          {item.description
                            .toString()
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                        </ul>
                        {/* Tech icons */}
                        {item.tech && (
                          <div className="flex flex-wrap gap-2">
                            {item.tech.map((key) => {
                              const name = techNames[key];
                              return (
                                <div
                                  key={key}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-950 dark:text-neutral-200 shadow-sm"
                                >
                                  {name}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {idx !== data.length - 1 && (
              <div
                className="absolute bottom-0 left-0 w-full h-[1px] opacity-100 dark:opacity-15"
                style={{
                  backgroundImage: "linear-gradient(to right, var(--pattern-fg) 50%, transparent 50%)",
                  backgroundSize: "15px 1px",
                  backgroundRepeat: "repeat-x"
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import Image from "next/image";
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

const techColors: Record<TechKey, string> = {
  next: "#ffffff",
  ts: "#3178C6",
  react: "#61DAFB",
  three: "#8b5cf6",
  prisma: "#5A67D8",
  cloud: "#F38020",
  langchain: "#00A67E",
  node: "#339933",
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
      title: "Powerplay",
      href: "https://www.getpowerplay.ai/",
      content: [
        {
          title: "Powerplay",
          description: `
            Refactored excel export architecture from offset pagination to MongoDB streaming, processing 100K+ records under 2 minutes (previously 7+ minutes) with significant memory reduction.
          `,
          src: "/Experience-image/powerplay-logo.jpeg",
          href: "https://www.getpowerplay.ai",
          tech: ["next", "ts", "react", "node"],
          dates: "Feb 2026 – Mar 2026",
          location: "Bengaluru, India (Onsite)",
          imageFit: "contain",
          imageZoom: 0.9,
          type: "Backend Intern",
        },
      ],
    },
    {
      title: "Perf",
      href: "https://withperf.com/",
      content: [
        {
          title: "Perf",
          type: "SDE Intern",
          description: `
            Engineered 15+ production features using the MERN stack (MongoDB, Express.js, React.js, Node.js) across a codebase serving 1000s of active users.
            Wrote unit tests and participated in code reviews to maintain high code quality and release confidence.
            Orchestrated 25+ production deployments via AWS Amplify and Elastic Beanstalk, implementing CI/CD best practices and maintaining 99.9% uptime across staging and production environments.
          `,
          src: "/Experience-image/perf-logo.png",
          href: "https://withperf.com/",
          tech: ["prisma", "cloud", "langchain", "ts"],
          dates: "Sep 2025 – Jan 2026",
          location: "London, UK (Remote)",
          imageFit: "contain",
          imageZoom: 1.2,
        },
      ],
    },
    {
      title: "Reslink",
      href: "https://reslink.org/",
      content: [
        {
          title: "Reslink Technologies",
          type: "SDE Intern",
          description: `
            Improved dashboard initial load time by 15% through lazy loading, component memoization, and API response caching.
            Delivered 6+ feature releases on schedule across a production environment while maintaining release stability.
            Developed a full-stack solar panel design tool using Three.js, Next.js, and TypeScript with object-oriented design patterns to render real-time 3D models across 5+ panel configurations with sub-2s load performance.
          `,
          src: "/Experience-image/reslink-logo.jpg",
          href: "https://reslink.org/",
          tech: ["react", "node", "ts"],
          dates: "Jun 2025 – Sep 2025",
          location: "Delhi, India (Hybrid)",
          imageFit: "contain",
          imageZoom: 1.5,
        },
      ],
    },
  ];

  return (
    <div>
      <h1 className="font-custom mt-2 pb-2 text-3xl font-bold tracking-tight text-neutral-950 md:text-3xl dark:text-neutral-50">
        <span className="link--elara">Experiences</span>
      </h1>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <div className="flex flex-col gap-4">
        {data.map((year, idx) => (
          <div
            key={year.title}
            className="relative -mx-2 px-2 pb-2 md:-mx-14 md:px-14"
          >
            {year.content.map((item, cidx) => {
              const isOpen = openIdx === idx * 100 + cidx;
              return (
                <React.Fragment key={item.title}>
                  <div
                    className="group flex cursor-pointer items-start gap-3 py-3 md:items-center md:gap-4"
                    onClick={() => setOpenIdx(isOpen ? null : idx * 100 + cidx)}
                  >
                    {/* Logo */}
                    <div className="h-12 w-12 shrink-0 rounded-lg border border-neutral-200/80 bg-neutral-50 p-[2px] dark:border-neutral-700 dark:bg-neutral-900">
                      <div
                        className={`h-full w-full overflow-hidden rounded-md border border-neutral-200/60 dark:border-neutral-700/70 ${item.imageFit === "contain" ? "bg-neutral-50 dark:bg-neutral-50" : "bg-neutral-50 dark:bg-neutral-900"}`}
                      >
                        <Image
                          src={item.src}
                          alt={item.title}
                          width={48}
                          height={48}
                          style={
                            item.imageZoom
                              ? { transform: `scale(${item.imageZoom})` }
                              : undefined
                          }
                          className={`${item.imageFit === "contain" ? "object-contain" : "object-cover"} h-full w-full`}
                        />
                      </div>
                    </div>
                    {/* Main summary info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-base leading-tight font-semibold text-neutral-950 md:text-lg dark:text-neutral-50">
                          {item.title}
                        </span>
                      </div>
                      {/* Type: plain small text on mobile/tablet, badge on desktop */}
                      {item.type && (
                        <>
                          <p className="mt-0.5 text-[11px] font-medium text-neutral-600 lg:hidden dark:text-neutral-400">
                            {item.type}
                          </p>
                          <span className="mt-0.5 hidden rounded border border-neutral-600 bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-100 lg:inline-flex">
                            {item.type}
                          </span>
                        </>
                      )}

                      <div className="mt-0.5 md:hidden">
                        <div className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.dates || item.title}
                        </div>
                      </div>
                    </div>
                    {/* Dates and location */}
                    <div className="hidden min-w-26 text-right sm:min-w-30 md:block">
                      <div className="text-xs font-semibold text-neutral-950 md:text-sm dark:text-neutral-50">
                        {item.dates || item.title}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.location || "Remote"}
                      </div>
                    </div>
                    {/* See/Arrow button */}
                    <div className="group mt-0.5 ml-1 flex h-7 w-7 shrink-0 items-center justify-center border-none bg-transparent p-0 shadow-none focus:outline-none md:mt-0 md:ml-2">
                      <FiChevronDown
                        className={`h-5 w-5 stroke-[2.2] transition-transform duration-300 ${isOpen ? "rotate-180 text-neutral-950 dark:text-neutral-50" : "text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-500 dark:group-hover:text-neutral-50"}`}
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {isOpen ? "Hide details" : "Show details"}
                      </span>
                    </div>
                  </div>
                  {/* Details section with smooth accordion animation */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      {/* Inner container for padding control */}
                      <div
                        className={`${isOpen ? "translate-y-0 pt-2 pb-3 opacity-100" : "-translate-y-2 py-0 opacity-0"} transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]`}
                      >
                        <div className="mb-2 md:hidden">
                          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                            {item.location || "Remote"}
                          </p>
                        </div>
                        <ul className="mb-3 w-full space-y-1.5 text-[13px] leading-snug text-neutral-700 dark:text-neutral-200">
                          {item.description
                            .toString()
                            .split("\n")
                            .filter((line) => line.trim() !== "")
                            .map((point, i) => (
                              <li
                                key={i}
                                className="flex w-full items-start gap-2"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                                <span className="block min-w-0 flex-1 font-medium wrap-break-word whitespace-normal text-neutral-800 dark:text-neutral-100">
                                  {point.trim()}
                                </span>
                              </li>
                            ))}
                        </ul>
                        {/* Tech icons */}
                        {item.tech && (
                          <div className="flex flex-wrap gap-2">
                            {item.tech.map((key) => {
                              const name = techNames[key];
                              const Icon = iconMap[key];
                              const uniqueId = `${item.title}-${key}`;
                              const isHovered = hoveredTech === uniqueId;
                              return (
                                <div
                                  key={key}
                                  className="group flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-950 shadow-sm transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                  onMouseEnter={() => setHoveredTech(uniqueId)}
                                  onMouseLeave={() => setHoveredTech(null)}
                                >
                                  <Icon
                                    className="h-3.5 w-3.5 transition-colors duration-200"
                                    style={{
                                      color: isHovered
                                        ? techColors[key]
                                        : "#a3a3a3",
                                    }}
                                    aria-hidden="true"
                                  />
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
                className="absolute bottom-0 left-0 h-px w-full opacity-100 dark:opacity-15"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--pattern-fg) 50%, transparent 50%)",
                  backgroundSize: "15px 1px",
                  backgroundRepeat: "repeat-x",
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

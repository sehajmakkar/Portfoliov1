"use client";

// Refined ProjectCard with Ambient Backgrounds by Narsi
import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Github, Star, X, Network, Search } from "lucide-react";
import {
  SiNextdotjs,
  SiTypescript,
  SiReact,
  SiThreedotjs,
  SiPrisma,
  SiCloudflare,
  SiLangchain,
  SiNodedotjs,
  SiFramer,
  SiTailwindcss,
  SiBun,
  SiEslint,
  SiRadixui,
  SiChartdotjs,
  SiGithub,
  SiFastapi,
  SiRedis,
  SiCelery,
  SiTldraw,
  SiCss3,
  SiPython,
  SiAnthropic,
  SiClaude,
  SiGooglegemini,
  SiMeta,
} from "react-icons/si";
type TechIcon = ComponentType<{ className?: string }>;

type TechKey =
  | "next"
  | "ts"
  | "react"
  | "three"
  | "prisma"
  | "cloud"
  | "langchain"
  | "langgraph"
  | "rag"
  | "node"
  | "motion"
  | "tailwind"
  | "bun"
  | "eslint"
  | "radixui"
  | "charts"
  | "github"
  | "fastapi"
  | "redis"
  | "celery"
  | "tldraw"
  | "css3"
  | "python"
  | "anthropic"
  | "claude"
  | "gemini"
  | "llama";

type TechItem =
  | TechKey
  | {
      label: string;
      tooltip?: string;
    };

interface Project {
  title: string;
  src: string;
  lightModeSrc?: string;
  video: string;
  description: string;
  tech: TechItem[];
  github: string;
  live: string;
  starsText?: string;
  backgroundImage?: string;
}

const iconMap: Record<TechKey, TechIcon> = {
  next: SiNextdotjs,
  ts: SiTypescript,
  react: SiReact,
  three: SiThreedotjs,
  prisma: SiPrisma,
  cloud: SiCloudflare,
  langchain: SiLangchain,
  langgraph: Network,
  rag: Search,
  node: SiNodedotjs,
  motion: SiFramer,
  tailwind: SiTailwindcss,
  bun: SiBun,
  eslint: SiEslint,
  radixui: SiRadixui,
  charts: SiChartdotjs,
  github: SiGithub,
  fastapi: SiFastapi,
  redis: SiRedis,
  celery: SiCelery,
  tldraw: SiTldraw,
  css3: SiCss3,
  python: SiPython,
  anthropic: SiAnthropic,
  claude: SiClaude,
  gemini: SiGooglegemini,
  llama: SiMeta,
};

const techNames: Record<TechKey, string> = {
  next: "Next.js",
  ts: "TypeScript",
  react: "React",
  three: "Three.js",
  prisma: "Prisma",
  cloud: "Cloudflare",
  langchain: "LangChain",
  langgraph: "LangGraph",
  rag: "RAG (Retrieval-Augmented Generation)",
  node: "Node.js",
  motion: "Framer Motion",
  tailwind: "Tailwind CSS",
  bun: "Bun",
  eslint: "ESLint",
  radixui: "Radix UI (shadcn/ui)",
  charts: "Charts (Recharts)",
  github: "GitHub API (Octokit)",
  fastapi: "FastAPI",
  redis: "Redis",
  celery: "Celery",
  tldraw: "tldraw",
  css3: "CSS3",
  python: "Python",
  anthropic: "Anthropic",
  claude: "Claude",
  gemini: "Gemini",
  llama: "LLaMA",
};

const ProjectCard = ({
  project,
  idx,
  setActiveVideo,
}: {
  project: Project;
  idx: number;
  setActiveVideo: (video: string) => void;
}) => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imageSrc =
    mounted && theme === "light" && project.lightModeSrc
      ? project.lightModeSrc
      : project.src;

  // Clean, consistent gradients

  return (
    <motion.div
      className="group relative z-10 rounded-xl border border-neutral-200 bg-white p-3 transition-all duration-300 hover:border-neutral-300 hover:shadow-2xl hover:shadow-neutral-500/5 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <div className="flex w-full cursor-pointer flex-col gap-4">
        {/* Image container wrapper - Clean style */}
        <div className="rounded-[12px] border border-neutral-200 bg-neutral-50 p-[4px] dark:border-neutral-800 dark:bg-neutral-900/50">
          {/* Main Image container */}
          <div className="relative h-[220px] w-full overflow-hidden rounded-[8px] border border-neutral-200 bg-neutral-100 select-none dark:border-neutral-800 dark:bg-neutral-900">
            {/* Ambient Background - Image Style */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${project.backgroundImage || "/image.png"}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              variants={{
                rest: { opacity: 0, scale: 1 },
                hover: { opacity: 1, scale: 1.05 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Title - Subtler slide */}
            <motion.h1
              className="font-custom absolute top-2 left-2 z-30 text-[11px] font-bold tracking-widest text-neutral-500 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] dark:text-neutral-400"
              variants={{
                rest: {
                  left: "0.75rem",
                  top: "0.75rem",
                  x: "0%",
                  color: "var(--neutral-500)",
                  opacity: 0,
                },
                hover: {
                  left: "50%",
                  top: "22%",
                  x: "-50%",
                  color: "#000000",
                  opacity: 1,
                },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              View Project
            </motion.h1>

            {/* Play Button - Scales up with a nice bounce */}
            <motion.div
              onClick={(e) => {
                e.stopPropagation();
                setActiveVideo(project.video);
              }}
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center group-hover:pointer-events-auto"
              variants={{
                rest: { scale: 0.5, opacity: 0 },
                hover: { scale: 1, opacity: 1 },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.05,
              }}
            >
              <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-110 active:scale-95">
                <svg
                  className="ml-0.5 h-5 w-5 fill-current text-neutral-900"
                  viewBox="0 0 24 24"
                >
                  <path d="M5.25 5.653v12.694c0 .856.926 1.39 1.668.958l11.1-6.347a1.125 1.125 0 000-1.916L6.918 4.695c-.742-.432-1.668.102-1.668.958z" />
                </svg>
              </div>
            </motion.div>

            {/* Floating screenshot - The signature Narsi move */}
            <motion.div
              className="absolute bottom-0 left-1/2 z-20 w-[82%] rounded-t-[6px] border-x border-t border-neutral-200 bg-white p-[2px] pb-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
              variants={{
                rest: { height: "76%", y: 0, x: "-50%" },
                hover: { height: "70%", y: 4, x: "-50%" }, // floats down/shrinks slightly
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="size-full overflow-hidden rounded-t-[4px]">
                <Image
                  src={imageSrc}
                  alt={`${project.title} preview`}
                  width={600}
                  height={400}
                  className="size-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="font-custom truncate text-lg font-bold tracking-wide text-neutral-900 transition-colors duration-300 dark:text-neutral-100">
                {project.title}
              </h3>
              {project.starsText && (
                <span className="font-custom2 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50/80 px-2 py-0.5 text-[10px] font-medium text-neutral-700 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-200">
                  <Star
                    size={12}
                    fill="currentColor"
                    className="text-amber-500/90 dark:text-amber-400"
                  />
                  <span>{project.starsText}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {project.title !== "Scribble3D" &&
                project.title !== "Blueprint" &&
                project.title !== "RepoLens" &&
                project.title !== "Inquiro" && (
                  <Globe
                    size={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(project.live, "_blank");
                    }}
                    className="cursor-pointer text-neutral-700 opacity-50 transition hover:opacity-100 dark:text-neutral-300"
                  />
                )}
              <Github
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.github, "_blank");
                }}
                className="cursor-pointer text-neutral-700 opacity-50 transition hover:opacity-100 dark:text-neutral-300"
              />
            </div>
          </div>

          <p className="font-custom2 line-clamp-2 h-10 text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
            {project.description}
          </p>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-3">
              {project.tech.map((item) => {
                const key = typeof item === "string" ? item : item.label;
                const isIconItem = typeof item === "string";
                const tooltipText = isIconItem
                  ? techNames[item]
                  : item.tooltip || item.label;
                const uniqueId = `${project.title}-${key}`;

                return (
                  <div
                    key={key}
                    className="relative"
                    onMouseEnter={() => setHoveredTech(uniqueId)}
                    onMouseLeave={() => setHoveredTech(null)}
                  >
                    {isIconItem ? (
                      (() => {
                        const TechIcon = iconMap[item];
                        return (
                          <TechIcon className="h-4 w-4 text-neutral-400 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100" />
                        );
                      })()
                    ) : (
                      <span className="font-custom2 rounded border border-neutral-200 px-1.5 py-0.5 text-[9px] leading-none text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                        {item.label}
                      </span>
                    )}
                    <AnimatePresence>
                      {hoveredTech === uniqueId && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2"
                        >
                          <div className="font-custom2 rounded bg-neutral-900 px-2 py-0.5 text-[10px] whitespace-nowrap text-neutral-100 shadow-xl dark:bg-neutral-100 dark:text-neutral-900">
                            {tooltipText}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {(() => {
              const isNotStarted = project.title === "Inquiro";
              const isBuilding = project.title === "Blueprint";

              const dotColor = isNotStarted
                ? "bg-neutral-400"
                : isBuilding
                  ? "bg-red-500"
                  : "bg-emerald-500";

              const label = isNotStarted
                ? "Not Started Yet"
                : isBuilding
                  ? "Building"
                  : "All Systems Operational";

              return (
                <span className="font-custom2 inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-black dark:text-neutral-200">
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full ${dotColor} animate-[statusDotPulse_2.6s_ease-in-out_infinite] motion-reduce:animate-none`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
                    />
                  </span>
                  {label}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = ({ showAll = false }: { showAll?: boolean }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const projects: Project[] = [
    {
      title: "VengenceUI",
      src: "/project-image/image copy.png",
      lightModeSrc: "/project-image/image.png",
      video: "https://www.youtube.com/embed/Z-5Y1JQlrdw?si=hA_aQJ3Syv-_jzo0",
      description:
        "VengenceUI helps you to build your landing page by providing you animated beautiful components",
      tech: ["next", "react", "ts", "tailwind", "motion"],
      github: "https://github.com/sehajmakkar/VengeanceUI",
      live: "https://www.vengenceui.com/",
      starsText: "500+ Github Stars",
      backgroundImage: "/image copy 5.png",
    },
    {
      title: "Scribble3D",
      src: "/Screenshot%202026-02-07%20234301.png",
      lightModeSrc: "/Screenshot%202026-02-07%20234011.png",
      video: "https://www.youtube.com/embed/vEW0auc6fXI?si=SEShsAG_h-e9kdnP",
      description:
        "Turn your sketches into 3D objects and worlds — no 3D skills required.",
      tech: ["next", "tldraw", "three", "ts", "fastapi", "gemini"],
      github: "https://github.com/sehajmakkar/Scribble3D-Sketch-to-3rd-",
      live: "https://yourlive.com",
      backgroundImage: "/image copy.png",
    },
    {
      title: "Blueprint",
      src: "/Screenshot%202026-02-07%20233440.png",
      lightModeSrc: "/Screenshot%202026-02-07%20233831.png",
      video: "",
      description:
        "Blueprint is an AI UI builder that turns prompts into structured, production-ready interfaces.",
      tech: [
        "next",
        "ts",
        "tailwind",
        "prisma",
        "bun",
        "node",
        "langchain",
        "rag",
      ],
      github: "https://github.com/sehajmakkar/Blueprint",
      live: "https://motion-suite-site.vercel.app/",
      backgroundImage: "/image copy 3.png",
    },
    {
      title: "Inquiro",
      src: "/Screenshot 2026-02-07 011550.png",
      lightModeSrc: "/Screenshot 2026-02-07 012511.png",
      video: "/inquiro.mp4",
      description:
        "Inquiro is a  AI-powered search engine that helps you find information on the internet",
      tech: [
        "next",
        "ts",
        "radixui",
        "node",
        "gemini",
        "langchain",
        "langgraph",
      ],
      github: "https://github.com/sehajmakkar/Inquiro-",
      live: "https://yourlive.com",
      backgroundImage: "/image copy 4.png",
    },
    {
      title: "RepoLens",
      src: "/Screenshot%202026-02-07%20225125.png",
      lightModeSrc: "/Screenshot%202026-02-07%20225107.png",
      video: "https://www.youtube.com/embed/nuE-KWBeauE?si=z-hrZjuMuFVfSxc5",
      description:
        "An all-in-one GitHub explorer with tech stack insights, code browsing, and analytics.",
      tech: ["next", "tailwind", "radixui", "charts", "github", "rag"],
      github: "https://github.com/sehajmakkar/RepoLens-",
      live: "https://motion-suite-site.vercel.app/",
    },
    {
      title: "MotionSuite",
      src: "/project-image/image copy 2.png",
      lightModeSrc: "/project-image/image copy 3.png",
      video: "/scribble.mp4",
      description:
        "motion-suite is a lightweight animation toolkit for React + Framer Motion",
      tech: ["ts", "next", "react", "motion"],
      github: "https://github.com/sehajmakkar/Motion-SUITE",
      live: "https://motion-suite-site.vercel.app/",
      backgroundImage: "/image copy 2.png",
    },
  ];

  return (
    <div className="mt-8">
      {/* Subtitle */}
      <p className="font-custom2 mt-3 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-4 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        I love designing and building thoughtful, production-grade applications.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-2">
        {(showAll ? projects : projects.slice(0, 2)).map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <ProjectCard
              project={project}
              idx={idx}
              setActiveVideo={setActiveVideo}
            />
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-3xl overflow-hidden rounded-xl bg-black shadow-2xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-50 cursor-pointer rounded-full bg-neutral-800/80 p-2 transition-colors hover:bg-neutral-700"
              >
                <X size={20} className="text-neutral-200" />
              </button>

              {activeVideo.includes("youtube") ? (
                <iframe
                  src={activeVideo}
                  className="aspect-video w-full border-0"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activeVideo}
                  className="h-auto w-full"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAll && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-4 flex justify-center"
        >
          <Link href="/projects">
            <AnimatedButton className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800">
              View all projects
            </AnimatedButton>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;

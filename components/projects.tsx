"use client";

// Refined ProjectCard with Ambient Backgrounds by Narsi
import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Github,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Network,
  Search,
  BrainCircuit,
  Cpu,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
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
  SiPostgresql,
  SiDocker,
  SiVite,
  SiExpress,
  SiMongodb,
  SiSocketdotio,
  SiSupabase,
  SiJavascript,
  SiSwift,
  SiSqlite,
  SiDrizzle,
  SiOpentelemetry,
} from "react-icons/si";
type TechIcon = ComponentType<{ className?: string }>;

import {
  projects,
  featuredProjects,
  earlierProjects,
  statusLabel,
  type Project,
  type TechKey,
} from "@/lib/projects-data";

export { projects };

type GalleryImage = { src: string; caption: string };

type ActiveModal =
  | { type: "video"; url: string }
  | { type: "gallery"; title: string; images: GalleryImage[] }
  | { type: "coming-soon"; reason: "building" | "demo" }
  | null;

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
  postgres: SiPostgresql,
  docker: SiDocker,
  vite: SiVite,
  express: SiExpress,
  mongodb: SiMongodb,
  socketio: SiSocketdotio,
  supabase: SiSupabase,
  js: SiJavascript,
  ml: BrainCircuit,
  modal: Cpu,
  clerk: ShieldCheck,
  dodo: CreditCard,
  swift: SiSwift,
  sqlite: SiSqlite,
  drizzle: SiDrizzle,
  otel: SiOpentelemetry,
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
  postgres: "PostgreSQL",
  docker: "Docker",
  vite: "Vite",
  express: "Express",
  mongodb: "MongoDB",
  socketio: "Socket.io",
  supabase: "Supabase",
  js: "JavaScript",
  ml: "Machine Learning",
  modal: "Modal H100 GPUs",
  clerk: "Clerk",
  dodo: "Dodo Payments",
  swift: "Swift (macOS Accessibility API)",
  sqlite: "SQLite + sqlite-vec",
  drizzle: "Drizzle ORM",
  otel: "OpenTelemetry",
};

const ProjectCard = ({
  project,
  idx,
  setActiveVideo,
  heading: Heading,
}: {
  project: Project;
  heading: "h2" | "h3";
  idx: number;
  setActiveVideo: (payload: ActiveModal) => void;
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
            {/* Subtle patterned base (visible when not hovered) */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--pattern-fg) 1px, transparent 1px), linear-gradient(to bottom, var(--pattern-fg) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
              variants={{
                rest: { opacity: 0.18 },
                hover: { opacity: 0.06 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />

            {/* Ambient Background - Image Style */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${project.backgroundImage || "/card-bg/0.webp"}')`,
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
            <motion.span
              aria-hidden="true"
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
                  top: "20%",
                  x: "-50%",
                  color: "#000000",
                  opacity: 1,
                },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              View Project
            </motion.span>

            {/* Play Button - Scales up with a nice bounce */}
            <motion.div
              onClick={(e) => {
                e.stopPropagation();
                const isYouTube = project.video.includes("youtube");
                const isBuilding = project.status === "building";
                const isNotStarted = project.status === "not-started";

                if (
                  (!isYouTube || isBuilding || isNotStarted) &&
                  project.gallery?.length
                ) {
                  setActiveVideo({
                    type: "gallery",
                    title: project.title,
                    images: project.gallery,
                  });
                  return;
                }

                if (!isYouTube || isBuilding || isNotStarted) {
                  setActiveVideo({
                    type: "coming-soon",
                    reason: isBuilding ? "building" : "demo",
                  });
                  return;
                }

                setActiveVideo({ type: "video", url: project.video });
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
              className="absolute bottom-0 left-1/2 z-20 w-[92%] rounded-t-[6px] border-x border-t border-neutral-200 bg-white p-[2px] pb-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
              variants={{
                rest: { height: "80%", y: 0, x: "-50%" },
                hover: { height: "74%", y: 4, x: "-50%" }, // floats down/shrinks slightly
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="size-full overflow-hidden rounded-t-[4px]">
                <Image
                  src={imageSrc}
                  alt={project.detail?.alt ?? `${project.title} screenshot`}
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
              <Heading className="font-custom truncate text-lg font-bold tracking-wide text-neutral-900 transition-colors duration-300 dark:text-neutral-100">
                {project.detail ? (
                  <Link href={`/projects/${project.slug}`} className="hover:underline hover:underline-offset-4">
                    {project.title}
                  </Link>
                ) : (
                  project.title
                )}
              </Heading>
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
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} live site`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-neutral-700 opacity-50 transition hover:opacity-100 dark:text-neutral-300"
                >
                  <Globe size={16} aria-hidden="true" />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} source on GitHub`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-neutral-700 opacity-50 transition hover:opacity-100 dark:text-neutral-300"
                >
                  <Github size={16} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          <p className="font-custom2 line-clamp-3 h-15 text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-200">
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
              const status = project.status ?? "oss";
              const dotColor =
                status === "live"
                  ? "bg-emerald-500"
                  : status === "building"
                    ? "bg-brand"
                    : "bg-neutral-400";
              const pulse = status === "live" || status === "building";
              const label = statusLabel[status];

              return (
                <span className="font-custom2 inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-black dark:text-neutral-200">
                  <span className="relative flex h-2 w-2">
                    {pulse && (
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full ${dotColor} animate-[statusDotPulse_2.6s_ease-in-out_infinite] motion-reduce:animate-none`}
                      />
                    )}
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

const Gallery = ({ title, images }: { title: string; images: GalleryImage[] }) => {
  const [index, setIndex] = useState(0);
  const go = (step: number) =>
    setIndex((i) => (i + step + images.length) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length]);

  const image = images[index];

  return (
    <div className="flex flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="relative flex max-h-[72vh] items-center justify-center p-3 pt-14">
        <Image
          key={image.src}
          src={image.src}
          alt={`${title}: ${image.caption}`}
          width={1600}
          height={1000}
          className="h-auto max-h-[calc(72vh-4rem)] w-auto max-w-full rounded-md border border-neutral-200 object-contain dark:border-neutral-800"
        />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <p className="font-custom2 min-w-0 text-sm text-neutral-700 dark:text-neutral-300">
          <span className="font-custom mr-2 text-base text-neutral-900 dark:text-neutral-100">
            {title}
          </span>
          {image.caption}
        </p>
        {images.length > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-custom2 text-xs text-neutral-500 tabular-nums">
              {index + 1} / {images.length}
            </span>
            <button
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="cursor-pointer rounded-full bg-neutral-200/90 p-1.5 transition-colors hover:bg-neutral-300 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
            >
              <ChevronLeft size={16} className="text-neutral-800 dark:text-neutral-200" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="cursor-pointer rounded-full bg-neutral-200/90 p-1.5 transition-colors hover:bg-neutral-300 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
            >
              <ChevronRight size={16} className="text-neutral-800 dark:text-neutral-200" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Projects = ({ showAll = false }: { showAll?: boolean }) => {
  const [activeVideo, setActiveVideo] = useState<ActiveModal>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={showAll ? "mt-8" : "mt-2"}>
      {!showAll && (
        <h2 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          <span className="link--elara">Projects</span>
        </h2>
      )}
      {/* Subtitle */}
      <p className="font-custom2 mt-3 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-4 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        AI systems, backends and the products around them. Most recent first.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-2">
        {featuredProjects.map((project, idx) => (
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
              heading={showAll ? "h2" : "h3"}
            />
          </motion.div>
        ))}
      </div>

      {showAll && earlierProjects.length > 0 && (
        <section aria-labelledby="earlier-work" className="pb-8">
          <h2
            id="earlier-work"
            className="font-custom mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Earlier work
          </h2>
          <ul className="divide-y divide-dashed divide-neutral-200 dark:divide-neutral-800">
            {earlierProjects.map((p) => (
              <li key={p.slug} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="font-custom w-32 shrink-0 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {p.title}
                  {p.status === "building" && (
                    <span className="font-custom2 ml-2 text-[10px] font-medium text-brand-ink">
                      building
                    </span>
                  )}
                </span>
                <span className="font-custom2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {p.description}
                </span>
                <span className="font-custom2 flex shrink-0 gap-3 text-xs">
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noopener noreferrer" className="text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300">
                      Live
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-neutral-700 underline-offset-2 hover:underline dark:text-neutral-300">
                      GitHub
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
              className={`relative w-[90%] cursor-default overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-black ${
                activeVideo.type === "gallery" ? "max-w-5xl" : "max-w-3xl"
              }`}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-50 cursor-pointer rounded-full bg-neutral-200/90 p-2 transition-colors hover:bg-neutral-300 dark:bg-neutral-800/80 dark:hover:bg-neutral-700"
              >
                <X
                  size={20}
                  className="text-neutral-800 dark:text-neutral-200"
                />
              </button>

              {activeVideo.type === "gallery" ? (
                <Gallery title={activeVideo.title} images={activeVideo.images} />
              ) : activeVideo.type === "coming-soon" ? (
                <div className="flex aspect-video w-full items-center justify-center bg-neutral-100 dark:bg-neutral-950">
                  <div className="rounded-xl border border-neutral-200 bg-white/90 px-6 py-5 text-center shadow-xl dark:border-neutral-800 dark:bg-neutral-900/70">
                    <p className="font-custom text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Coming soon!
                    </p>
                    <p className="font-custom2 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {activeVideo.reason === "building"
                        ? "Still building this one."
                        : "No demo video yet."}
                    </p>
                  </div>
                </div>
              ) : activeVideo.url.includes("youtube") ? (
                <iframe
                  src={activeVideo.url}
                  className="aspect-video w-full border-0"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activeVideo.url}
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

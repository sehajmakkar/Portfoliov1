"use client";

// Refined ProjectCard with Ambient Backgrounds by Narsi
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Github, X } from "lucide-react";
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
  | "node"
  | "motion";

interface Project {
  title: string;
  src: string;
  lightModeSrc?: string;
  video: string;
  description: string;
  tech: TechKey[];
  github: string;
  live: string;
  backgroundImage?: string;
}

const iconMap: Record<TechKey, IconType> = {
  next: SiNextdotjs,
  ts: SiTypescript,
  react: SiReact,
  three: SiThreedotjs,
  prisma: SiPrisma,
  cloud: SiCloudflare,
  langchain: SiLangchain,
  node: SiNodedotjs,
  motion: SiFramer,
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
  motion: "Framer Motion",
};

// Colorful gradients matching the "Narsi" aesthetic
const CARD_GRADIENTS = [
  "linear-gradient(to bottom right, #f9a8d4, #a78bfa, #818cf8)", // Pink/Purple/Indigo
  "linear-gradient(to bottom right, #6ee7b7, #3b82f6, #9333ea)", // Green/Blue/Purple
  "linear-gradient(to bottom right, #fbbf24, #f87171, #c084fc)", // Amber/Red/Purple
  "linear-gradient(to bottom right, #38bdf8, #818cf8, #c084fc)", // Sky/Indigo/Purple
];


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

  const imageSrc = mounted && theme === 'light' && project.lightModeSrc
    ? project.lightModeSrc
    : project.src;

  // Clean, consistent gradients
  const backgroundGradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

  return (
    <motion.div
      className="group relative z-10 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-black hover:shadow-2xl hover:shadow-neutral-500/5"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <div className="flex w-full cursor-pointer flex-col gap-4">
        {/* Image container wrapper - Clean style */}
        <div className="rounded-[12px] border border-neutral-200 dark:border-neutral-800 p-[4px] bg-neutral-50 dark:bg-neutral-900/50">

          {/* Main Image container */}
          <div className="relative h-[220px] w-full overflow-hidden rounded-[8px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 select-none">

            {/* Ambient Background - Image Style */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${project.backgroundImage || '/image.png'}')`,
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
              className="absolute top-2 left-2 text-[11px] font-bold font-custom text-neutral-500 dark:text-neutral-400 z-30 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              variants={{
                rest: {
                  left: "0.75rem",
                  top: "0.75rem",
                  x: "0%",
                  color: "var(--neutral-500)",
                  opacity: 0
                },
                hover: {
                  left: "50%",
                  top: "22%",
                  x: "-50%",
                  color: "#ffffff",
                  opacity: 1
                },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              View Project
            </motion.h1>

            {/* Play Button - Scales up with a nice bounce */}
            <motion.div
              onClick={(e) => { e.stopPropagation(); setActiveVideo(project.video); }}
              className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto"
              variants={{
                rest: { scale: 0.5, opacity: 0 },
                hover: { scale: 1, opacity: 1 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
            >
              <div className="h-12 w-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200 border border-white/50">
                <svg className="w-5 h-5 text-neutral-900 ml-0.5 fill-current" viewBox="0 0 24 24">
                  <path d="M5.25 5.653v12.694c0 .856.926 1.39 1.668.958l11.1-6.347a1.125 1.125 0 000-1.916L6.918 4.695c-.742-.432-1.668.102-1.668.958z" />
                </svg>
              </div>
            </motion.div>

            {/* Floating screenshot - The signature Narsi move */}
            <motion.div
              className="absolute bottom-0 left-1/2 w-[82%] rounded-t-[6px] bg-white dark:bg-neutral-950 p-[2px] pb-0 shadow-2xl z-20 border-x border-t border-neutral-200 dark:border-neutral-800"
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
            <h3 className="text-lg font-bold font-custom tracking-wide text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
              {project.title}
            </h3>
            <div className="flex gap-3">
              {project.title !== "Scribble3D" && (
                <Globe
                  size={16}
                  onClick={(e) => { e.stopPropagation(); window.open(project.live, "_blank"); }}
                  className="opacity-50 hover:opacity-100 transition cursor-pointer text-neutral-700 dark:text-neutral-300 hover:scale-110 active:scale-95"
                />
              )}
              <Github
                size={16}
                onClick={(e) => { e.stopPropagation(); window.open(project.github, "_blank"); }}
                className="opacity-50 hover:opacity-100 transition cursor-pointer text-neutral-700 dark:text-neutral-300 hover:scale-110 active:scale-95"
              />
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400 font-custom2 h-10 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors duration-300">
            {project.description}
          </p>

          <div className="flex gap-3 flex-wrap pt-2">
            {project.tech.map((key) => {
              const Icon = iconMap[key];
              const uniqueId = `${project.title}-${key}`;

              return (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => setHoveredTech(uniqueId)}
                  onMouseLeave={() => setHoveredTech(null)}
                >
                  <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
                  <AnimatePresence>
                    {hoveredTech === uniqueId && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                      >
                        <div className="bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap">
                          {techNames[key]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
      description: "VengenceUI helps you to build your landing page by providing you animated beautiful components out of the box",
      tech: ["next", "ts", "cloud", "node"],
      github: "https://github.com/Ashutoshx7/VengeanceUI",
      live: "https://www.vengenceui.com/",
      backgroundImage: "/image copy 5.png",
    },
    {
      title: "Scribble3D",
      src: "/Scribble3D.png",
      video: "https://www.youtube.com/embed/vEW0auc6fXI?si=SEShsAG_h-e9kdnP",
      description: "Scribble3D is an AI-powered creative suite that removes the complexity of 3D modeling. From quick doodles to detailed sketches",
      tech: ["ts", "next", "prisma", "langchain"],
      github: "https://github.com/Ashutoshx7/Scribble3D-Sketch-to-3rd-",
      live: "https://yourlive.com",
      backgroundImage: "/image copy.png",
    },
    {
      title: "Blueprint",
      src: "/stage-1767884553863.png",
      video: "",
      description: "motion-suite is a lightweight animation toolkit for React + Framer Motion",
      tech: ["ts", "next", "react", "motion"],
      github: "https://github.com/Ashutoshx7/Motion-SUITE",
      live: "https://motion-suite-site.vercel.app/",
      backgroundImage: "/image copy 3.png",
    },
    {
      title: "Inquiro",
      src: "/Inquiro.png",
      video: "/inquiro.mp4",
      description: "Turn your sketches into 3D objects and worlds — no 3D skills required.",
      tech: ["next", "ts", "react", "three"],
      github: "https://github.com/Ashutoshx7/Inquiro-",
      live: "https://yourlive.com",
      backgroundImage: "/image copy 4.png",
    },
    {
      title: "RepoLens",
      src: "/stage-1767884553863.png",
      video: "",
      description: "motion-suite is a lightweight animation toolkit for React + Framer Motion",
      tech: ["ts", "next", "react", "motion"],
      github: "https://github.com/Ashutoshx7/Motion-SUITE",
      live: "https://motion-suite-site.vercel.app/",
    },
    {
      title: "MotionSuite",
      src: "/project-image/image copy 2.png",
      lightModeSrc: "/project-image/image copy 3.png",
      video: "/scribble.mp4",
      description: "motion-suite is a lightweight animation toolkit for React + Framer Motion",
      tech: ["ts", "next", "react", "motion"],
      github: "https://github.com/Ashutoshx7/Motion-SUITE",
      live: "https://motion-suite-site.vercel.app/",
      backgroundImage: "/image copy 2.png",
    },
  ];

  return (
    <div className="mt-8">
      {/* Subtitle */}
      <p
        className="
          font-custom2 text-neutral-700 dark:text-neutral-300 mt-3 px-4 py-[7px]
           text-sm inline-block
          bg-neutral-100 dark:bg-neutral-900 border-dashed border-neutral-300 dark:border-neutral-700 border
        "
      >
        I love designing and building thoughtful, production-grade applications.
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 py-8">
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black rounded-xl overflow-hidden w-[90%] max-w-3xl shadow-2xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 p-2 bg-neutral-800/80 hover:bg-neutral-700 rounded-full cursor-pointer transition-colors z-50"
              >
                <X size={20} className="text-neutral-200" />
              </button>

              {activeVideo.includes("youtube") ? (
                <iframe
                  src={activeVideo}
                  className="w-full aspect-video border-0"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activeVideo}
                  className="w-full h-auto"
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
          className="flex justify-center mt-4"
        >
          <Link href="/projects">
            <AnimatedButton className="group relative overflow-hidden rounded-lg 
                      bg-linear-to-b from-white to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 
                      border border-neutral-200 dark:border-neutral-800 
                      text-neutral-800 dark:text-neutral-200 text-sm font-medium px-6 py-2.5 
                      transition-all duration-300 
                      hover:from-neutral-50 hover:to-neutral-100 dark:hover:from-neutral-800 dark:hover:to-neutral-800
                      shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] 
                      dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              View all projects
            </AnimatedButton>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Projects;

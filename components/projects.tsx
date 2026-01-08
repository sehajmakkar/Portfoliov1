"use client";

import { useState, useEffect } from "react";
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
  video: string;
  description: string;
  tech: TechKey[];
  github: string;
  live: string;
}

const iconMap: Record<TechKey, any> = {
  next: SiNextdotjs,
  ts: SiTypescript,
  react: SiReact,
  three: SiThreedotjs,
  prisma: SiPrisma,
  cloud: SiCloudflare,
  langchain: SiLangchain,
  node: SiNodedotjs,
  motion: SiFramer, // You may want to use a different icon here, e.g. SiReact or a custom SVG
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

const Projects = ({ showAll = false }: { showAll?: boolean }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

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
      src: "/stage-1767884304520.png",
      video: "https://www.youtube.com/embed/98QD-V3ox8g?si=wPWipbLIfGpQ9ttK",
      description: "An AI-powered web IDE built fully in the browser using WebContainers.",
      tech: ["next", "ts", "cloud", "node"],
      github: "https://github.com/Ashutoshx7/VengeanceUI",
      live: "https://www.vengenceui.com/",
    },
    {
      title: "Scribble3D",
      src: "/Scribble3D.png",
      video: "/scribble.mp4",
      description: "A real-time research assistant built with modern web technologies.",
      tech: ["ts", "next", "prisma", "langchain"],
      github: "https://github.com/Ashutoshx7/Scribble3D-Sketch-to-3rd-",
      live: "https://yourlive.com",
    },
    {
      title: "Inquiro",
      src: "/Inquiro.png",
      video: "/inquiro.mp4",
      description: "Turn your sketches into 3D objects and worlds — no 3D skills required.",
      tech: ["next", "ts", "react", "three"],
      github: "https://github.com/Ashutoshx7/Inquiro-",
      live: "https://yourlive.com",
    },
    {
      title: "MotionSuite",
      src: "/stage-1767884553863.png",
      video: "/scribble.mp4",
      description: "motion-suite is a lightweight animation toolkit for React + Framer Motion",
      tech: ["ts", "next", "react", "motion"],
      github: "https://github.com/Ashutoshx7/Motion-SUITE",
      live: "https://motion-suite-site.vercel.app/",
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
      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 gap-5 py-7">
        {(showAll ? projects : projects.slice(0, 2)).map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: idx * 0.12,
            }}
            viewport={{ once: true, amount: 0.2 }}
            className="
              relative group overflow-hidden rounded-xl
              border border-neutral-200 dark:border-neutral-800
              bg-white dark:bg-black
              hover:shadow-md
              transition-all duration-300
            "
          >
            {/* Glow */}
            <div
              className="
                absolute inset-0 pointer-events-none
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                bg-[radial-gradient(circle_at_50%_130%,rgba(0,0,0,0.08),transparent_70%)]
                dark:bg-[radial-gradient(circle_at_50%_130%,rgba(255,255,255,0.10),transparent_75%)]
              "
            />

            {/* IMAGE */}
            <div className="relative w-full h-44 overflow-hidden">
              <Image
                src={project.src}
                alt={project.title}
                fill
                className="object-cover"
              />

              {/* Black tint overlay */}
              <div
                className="
                  absolute inset-0 
                  bg-black/0 
                  group-hover:bg-black/10
                  transition-all duration-500
                "
              />

              {/* PLAY BUTTON */}
              <div
                onClick={() => setActiveVideo(project.video)}
                className="
                  absolute inset-0 z-20 flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition duration-300 cursor-pointer
                "
              >
                <div
                  className="
                    h-12 w-12 bg-white/90 dark:bg-black/75 rounded-full 
                    flex items-center justify-center shadow-md backdrop-blur-md
                  "
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                    className='w-6 h-6 text-black dark:text-white'
                  >
                    <path d='M5.25 5.653v12.694c0 .856.926 1.39 1.668.958l11.1-6.347a1.125 1.125 0 000-1.916L6.918 4.695c-.742-.432-1.668.102-1.668.958z' />
                  </svg>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5">

              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-custom font-semibold text-neutral-900 dark:text-neutral-50">
                  {project.title}
                </h2>

                <div className="flex gap-3">
                  <Globe
                    size={17}
                    onClick={() => window.open(project.live, "_blank")}
                    className="opacity-75 hover:opacity-100 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
                  />
                  <Github
                    size={17}
                    onClick={() => window.open(project.github, "_blank")}
                    className="opacity-75 hover:opacity-100 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed tracking-wide font-custom2">
                {project.description}
              </p>

              {/* TECH STACK */}
              <p className="text-xs text-neutral-500 font-medium mb-2 font-custom2">
                Tech Stack
              </p>

              <div className="flex gap-3 flex-wrap">
                {project.tech.map((key) => {
                  const Icon = iconMap[key];
                  const uniqueId = `${project.title}-${key}`;

                  return (
                    <div
                      key={key}
                      className="relative cursor-pointer"
                      onMouseEnter={() => setHoveredTech(uniqueId)}
                      onMouseLeave={() => setHoveredTech(null)}
                    >
                      <Icon
                        className="w-5 h-5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      />

                      {hoveredTech === uniqueId && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                          <div className="relative bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[10px] font-medium px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-neutral-200 dark:border-neutral-700">
                            {techNames[key]}

                            {/* Arrow */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-100 dark:bg-neutral-800 rotate-45 border-b border-r border-neutral-200 dark:border-neutral-700"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
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
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black rounded-xl overflow-hidden w-[90%] max-w-3xl shadow-xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 p-2 bg-neutral-500 rounded-full cursor-pointer"
              >
                <X size={20} className="text-neutral-200" />
              </button>

              {activeVideo.includes("youtube") ? (
                <iframe
                  src={activeVideo}
                  className="w-full aspect-video"
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
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: 2 * 0.12,
        }}
        viewport={{ once: true, amount: 0.2 }}
        className="w-full "
      >
        {!showAll && (
          <div>
            <div className="flex justify-center" >
              <div className="flex justify-center mt-2">
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
              </div>
            </div>
          </div>
        )}
      </motion.div >

    </div >
  );
};

export default Projects;

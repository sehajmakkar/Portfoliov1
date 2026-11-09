"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import DitherIcon from "@/components/learn/dither-icon";
import {
  LEARN_URL,
  courses,
  upcoming,
  type CourseStatus,
  type LearnCourse,
} from "@/components/learn/courses-data";

const STATUS: Record<CourseStatus, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-emerald-500" },
  writing: { label: "Writing in public", dot: "bg-yellow-500" },
  next: { label: "Up next", dot: "bg-sky-500" },
  planned: { label: "Planned", dot: "bg-neutral-400" },
};

function StatusPill({ status }: { status: CourseStatus }) {
  const { label, dot } = STATUS[status];
  const pulse = status === "live" || status === "writing";
  return (
    <span className="font-custom2 inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-black dark:text-neutral-200">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${dot} animate-[statusDotPulse_2.6s_ease-in-out_infinite] motion-reduce:animate-none`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
      </span>
      {label}
    </span>
  );
}

const gridBg = {
  backgroundImage:
    "linear-gradient(to right, var(--pattern-fg) 1px, transparent 1px), linear-gradient(to bottom, var(--pattern-fg) 1px, transparent 1px)",
  backgroundSize: "14px 14px",
  // Fade the grid out behind the logo so the dots read cleanly.
  maskImage: "radial-gradient(circle at center, transparent 0, transparent 70px, black 130px)",
  WebkitMaskImage: "radial-gradient(circle at center, transparent 0, transparent 70px, black 130px)",
};

function CourseCard({ course }: { course: LearnCourse }) {
  const [hovered, setHovered] = useState(false);
  const href = `${LEARN_URL}/${course.id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative z-10 block rounded-xl border border-neutral-200 bg-white p-3 transition-all duration-300 hover:border-neutral-300 hover:shadow-2xl hover:shadow-neutral-500/5 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
    >
      <div className="flex w-full flex-col gap-4">
        <div className="rounded-[12px] border border-neutral-200 bg-neutral-50 p-[4px] dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-neutral-200 bg-neutral-100 select-none dark:border-neutral-800 dark:bg-neutral-900">
            <div
              className="absolute inset-0 opacity-[0.18] transition-opacity duration-300 group-hover:opacity-[0.08]"
              style={gridBg}
            />
            <span className="absolute top-3 left-3 font-plex text-[10px] tracking-wide text-neutral-400 dark:text-neutral-500">
              learn.sehaj.tech/{course.id}
            </span>
            <span className="absolute right-3 bottom-3 font-plex text-[10px] text-neutral-400 dark:text-neutral-500">
              {course.meta}
            </span>
            <motion.div
              className="relative"
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <DitherIcon
                path={course.path}
                hex={course.hex}
                title={course.title}
                size={112}
                cells={34}
                hovered={hovered}
              />
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-custom truncate text-lg font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
              {course.title}
            </h3>
            <ArrowUpRight
              size={16}
              className="shrink-0 text-neutral-700 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-neutral-300"
            />
          </div>
          <p className="font-custom text-[15px] text-neutral-500 italic dark:text-neutral-400">
            {course.tagline}
          </p>
          <p className="font-custom2 text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-900 md:min-h-[60px] dark:text-neutral-400 dark:group-hover:text-neutral-200">
            {course.description}
          </p>
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="font-plex text-[10px] text-neutral-500 dark:text-neutral-400">
              free · open source
            </span>
            <StatusPill status={course.status} />
          </div>
        </div>
      </div>
    </a>
  );
}

function UpcomingTile({ course }: { course: LearnCourse }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col gap-4 rounded-xl border border-dashed border-neutral-300 bg-white/60 p-4 dark:border-neutral-800 dark:bg-black/40"
    >
      <div className="flex items-start justify-between">
        <DitherIcon
          path={course.path}
          hex={course.hex}
          title={course.title}
          size={40}
          cells={20}
          muted
          hovered={hovered}
        />
        <span
          className={`font-plex text-[9px] tracking-[0.12em] uppercase ${course.status === "next" ? "text-sky-600 dark:text-sky-400" : "text-neutral-400 dark:text-neutral-500"}`}
        >
          {STATUS[course.status].label}
        </span>
      </div>
      <h4 className="font-custom text-xl leading-none text-neutral-700 dark:text-neutral-300">
        {course.title}
      </h4>
    </li>
  );
}

export default function Courses() {
  return (
    <div className="mt-8">
      <p className="font-custom2 mt-3 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-4 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        Free, open-source courses I write in public. No login, no paywall.
      </p>

      <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2">
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <CourseCard course={course} />
          </motion.div>
        ))}
      </div>

      <h2 className="font-custom mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        Coming up
      </h2>
      <p className="font-custom2 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Next on the list, roughly in this order.
      </p>
      <ul className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 md:grid-cols-5">
        {upcoming.map((course) => (
          <UpcomingTile key={course.id} course={course} />
        ))}
      </ul>

      <div className="mt-2 flex justify-center">
        <a href={LEARN_URL} target="_blank" rel="noopener">
          <AnimatedButton className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800">
            Open learn.sehaj.tech
          </AnimatedButton>
        </a>
      </div>
    </div>
  );
}

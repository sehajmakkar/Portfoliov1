import React from "react";

const achievements = [
  {
    title: "1st place, Hackaccino 3.0",
    detail: "Bennett University. 250+ teams, 3,600+ participants.",
  },
  {
    title: "President, MindFlare at MAIT",
    detail: "Organized hackathons and mentored 50+ students on web and AI projects.",
  },
];

export default function Education() {
  return (
    <section aria-labelledby="education" className="relative mt-4 w-full">
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <h2
        id="education"
        className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50"
      >
        <span className="link--elara">Education</span>
      </h2>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-950 md:text-lg dark:text-neutral-50">
            Maharaja Agrasen Institute of Technology (GGSIPU)
          </h3>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400">
            B.Tech in Information Technology · GPA 9.05
          </p>
        </div>
        <div className="text-xs text-neutral-600 sm:text-right dark:text-neutral-400">
          <div className="font-semibold text-neutral-950 md:text-sm dark:text-neutral-50">
            2023 – 2027
          </div>
          Delhi, India
        </div>
      </div>

      <ul className="mt-3 mb-2 flex flex-col">
        {achievements.map((a, i) => (
          <li
            key={a.title}
            className={`flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4 ${i ? "border-t border-dashed border-neutral-200 dark:border-neutral-800" : ""}`}
          >
            <span className="text-sm font-semibold text-neutral-900 sm:w-80 sm:shrink-0 dark:text-neutral-100">
              {a.title}
            </span>
            <span className="text-[13px] text-neutral-600 dark:text-neutral-400">{a.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

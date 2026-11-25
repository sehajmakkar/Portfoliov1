// Work history, shared by the Human timeline and the Agent page.

export type TechKey =
  | "next"
  | "ts"
  | "react"
  | "three"
  | "langchain"
  | "node"
  | "mongodb"
  | "aws"
  | "express"
  | "js"
  | "rag"
  | "canvas"
  | "langgraph"
  | "chrome";

export type Company = {
  title: string;
  href?: string;
  content: {
    title: string;
    summary?: string;
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

export const experience: Company[] = [
  {
    title: "PowerPlay",
    href: "https://www.getpowerplay.ai/",
    content: [
      {
        title: "PowerPlay",
        summary:
          "Construction management software. I worked on the backend: exports, data quality and client scripts.",
        description: `
          Moved the Excel export from offset pagination to MongoDB streaming: 100K+ records now export in under 2 minutes (was 7+), with much lower memory use.
          Built 5+ client-facing backend scripts, including a deduplication engine that uses composite field hashing to recheck uniqueness across 95,000+ existing records.
        `,
        src: "/Experience-image/powerplay-logo.jpeg",
        href: "https://www.getpowerplay.ai",
        tech: ["mongodb", "node", "express", "js"],
        dates: "Feb 2026 – Mar 2026",
        location: "Bengaluru, India (Onsite)",
        imageFit: "contain",
        imageZoom: 0.9,
        type: "Backend Development Intern",
      },
    ],
  },
  {
    title: "Perf",
    href: "https://withperf.com/",
    content: [
      {
        title: "Perf",
        type: "Software Engineering Intern",
        summary:
          "Vrkflo, a Chrome extension that records a workflow, turns it into a guide, and lets an AI agent replay it.",
        description: `
          Built an AI browser agent as a Chrome extension (Manifest V3, TypeScript) that records workflows from DOM events and replays them, using LLM element grounding to self-heal when the UI changes.
          Added a human-in-the-loop fallback with LangGraph interrupts that pauses replay on low-confidence matches, and auto-generated step-by-step SOPs with screenshots, cutting documentation time by 80%+.
          Shipped 15+ production features in React and TypeScript from Figma designs, with proper loading, empty and error states against REST APIs.
          Ran 7+ production deployments on AWS (Elastic Beanstalk, Amplify) across staging and production with CI/CD.
        `,
        src: "/Experience-image/perf-logo.png",
        href: "https://withperf.com/",
        tech: ["ts", "react", "chrome", "langgraph", "aws"],
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
        type: "Software Engineering Intern",
        summary:
          "3D solar design software for Indian EPCs. I worked on internal dashboards and the panel design tool.",
        description: `
          Cut internal dashboard load time by 15% with lazy loading, memoization and API response caching.
          Built a solar panel design tool in Next.js, TypeScript and Three.js with a real-time 3D preview.
        `,
        src: "/Experience-image/reslink-logo.jpg",
        href: "https://reslink.org/",
        tech: ["three", "next", "ts"],
        dates: "Jun 2025 – Sep 2025",
        location: "Delhi, India (Hybrid)",
        imageFit: "contain",
        imageZoom: 1.5,
      },
    ],
  },
];

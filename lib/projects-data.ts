// Project data shared by the cards (client) and the /projects/[slug] pages
// (server). Numbers here must match the resume fact bank; do not round up.

export type TechKey =
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
  | "llama"
  | "postgres"
  | "docker"
  | "vite"
  | "express"
  | "mongodb"
  | "socketio"
  | "supabase"
  | "js"
  | "ml"
  | "modal"
  | "clerk"
  | "dodo"
  | "swift"
  | "sqlite"
  | "drizzle"
  | "otel";

export type TechItem = TechKey | { label: string; tooltip?: string };

export type ProjectStatus = "live" | "building" | "not-started" | "local" | "oss";

export interface ProjectDetail {
  // one sentence that answers "what is it", written to be quoted
  what: string;
  how: string[];
  numbers?: string[];
  story?: { title: string; body: string };
  stack: string[];
}

export interface Project {
  title: string;
  slug: string;
  featured?: boolean;
  src: string;
  lightModeSrc?: string;
  video: string;
  description: string;
  tech: TechItem[];
  // empty string when the repo is private
  github: string;
  live: string;
  starsText?: string;
  backgroundImage?: string;
  status?: ProjectStatus;
  // screenshots shown in place of a demo video, until there is one
  gallery?: { src: string; caption: string }[];
  detail?: ProjectDetail;
}

export const statusLabel: Record<ProjectStatus, string> = {
  live: "Live",
  building: "Building",
  "not-started": "Not started yet",
  local: "macOS app",
  oss: "Open source",
};

export const projects: Project[] = [
  {
    title: "Vero",
    slug: "vero",
    featured: true,
    src: "/project-image/vero-cover.png",
    lightModeSrc: "/project-image/vero-cover.png",
    video: "https://www.youtube.com/embed/KV65sAj8Za4",
    description:
      "Cursor for LaTeX resumes. Press Ctrl+K and the AI edit streams in as a diff you accept or reject, with ATS scoring built in.",
    tech: ["next", "ts", "postgres", "drizzle", "gemini", "clerk", "docker", "cloud"],
    github: "https://github.com/sehajmakkar/Vero",
    live: "https://www.withvero.app/",
    starsText: "Startup",
    backgroundImage: "/image copy 5.png",
    status: "live",
    detail: {
      what: "Vero is an AI-native LaTeX editor for resumes and technical documents, where every AI edit arrives as a diff you can accept or reject.",
      how: [
        "Select text and press Ctrl+K: Gemini's edit streams in as a reviewable diff instead of overwriting your work.",
        "Every AI edit is checked against 13+ validation rules before you see it.",
        "ATS scoring combines rule-based checks with LLM grading.",
        "Imports existing resumes from PDF and DOCX, autosaves, and shows a live PDF preview.",
        "Payments through Dodo Payments with signed webhooks; files stored on Cloudflare R2.",
      ],
      story: {
        title: "The hardest part: LaTeX doesn't run on serverless",
        body: "Compiling worked locally and broke on Vercel, because serverless hosts have no TeX. I split compilation into its own Dockerized TeX Live service: secret-authed, a temp directory per job, shell escape off, a 60 second timeout, a 500 KB input limit, a bounded queue, and automatic fallback across pdflatex, xelatex and lualatex.",
      },
      stack: [
        "Next.js (App Router)",
        "TypeScript",
        "PostgreSQL + Drizzle ORM",
        "Clerk",
        "Gemini API",
        "CodeMirror 6",
        "Zustand, TanStack Query, Zod",
        "Express + Docker (TeX Live)",
        "Cloudflare R2",
        "Dodo Payments",
        "Vitest",
      ],
    },
  },
  {
    title: "McAgent",
    slug: "mcagent",
    featured: true,
    src: "/project-image/mcagent-cover.png",
    lightModeSrc: "/project-image/mcagent-cover.png",
    video: "",
    description:
      "A local-first macOS agent that catches promises you made on screen and drafts the follow-up. It can't send on its own: you approve every email.",
    tech: ["swift", "python", "fastapi", "gemini", "sqlite"],
    github: "https://github.com/sehajmakkar/contextagent",
    live: "",
    backgroundImage: "/image copy 2.png",
    status: "local",
    gallery: [
      {
        src: "/project-image/mcagent/inbox.png",
        caption: "The inbox: open loops found on screen, each with the quote that created it",
      },
      {
        src: "/project-image/mcagent/draft.png",
        caption: "Close it for me: the agent drafts the email, nothing sends until you approve",
      },
      {
        src: "/project-image/mcagent/menu-bar.png",
        caption: "The menu-bar panel",
      },
    ],
    detail: {
      what: "McAgent is a local-first macOS menu-bar agent that remembers what was on your screen, finds open loops like promises and follow-ups, and drafts the email to close them, sending nothing without your approval.",
      how: [
        "Reads on-screen text through the macOS Accessibility API. No screenshots.",
        "Stores memories in SQLite with FTS5 and sqlite-vec, and searches them with hybrid keyword + embedding retrieval.",
        "A hand-written function-calling loop searches memory and Gmail, drafts a reply, waits for you to approve the exact text, then checks it landed in Sent.",
        "The agent has no send tool. Recipient and authority rules live in code, and screen text is treated as data, never as instructions.",
      ],
      numbers: [
        "97% Recall@5 and 0.94 MRR on memory search (31 questions over 45 memories).",
        "Open-loop detection: 100% precision and recall on 43 labelled screens; 91% precision and 100% recall on 16 held-out screens; 0 unsafe closes.",
        "12/12 agent scenarios passed, including prompt injection. 0 emails sent by the agent.",
      ],
      story: {
        title: "The eval that passed and was still wrong",
        body: "My first agent eval scored 10/10, while one of the drafts agreed to renew an 11-month lease on the user's behalf. The rubric had no axis for authority. I fixed the eval first, then moved the rule out of the prompt and into code.",
      },
      stack: [
        "Swift 6 / SwiftUI",
        "macOS Accessibility API",
        "Python 3.13 + FastAPI + Pydantic",
        "SQLite (WAL) + FTS5 + sqlite-vec",
        "Gemini embeddings + Gemini Flash",
        "SSE streaming",
        "Gmail API (OAuth token in Keychain)",
        "pytest",
      ],
    },
  },
  {
    title: "Agent Labs",
    slug: "agent-labs",
    featured: true,
    src: "/project-image/agent-labs-cover.png",
    lightModeSrc: "/project-image/agent-labs-cover.png",
    video: "",
    description:
      "Find the exact step where an AI agent went wrong, and prove the fix. Auto-Blame finds it 92% of the time on 50 planted bugs.",
    tech: ["python", "gemini", "otel", "sqlite", "react", "ts"],
    github: "https://github.com/sehajmakkar/agent-labs",
    live: "https://agent-labs-chi.vercel.app",
    backgroundImage: "/image copy 3.png",
    status: "live",
    gallery: [
      {
        src: "/project-image/agent-labs/overview.png",
        caption: "Record, evaluate, blame, fork, diff, lock it in",
      },
      {
        src: "/project-image/agent-labs/decision-tree.png",
        caption: "Every run as a decision tree you can click through",
      },
      {
        src: "/project-image/agent-labs/fork.png",
        caption: "A fork proving the fix: 5/5 with the change, 0/5 without",
      },
      {
        src: "/project-image/agent-labs/blame-accuracy.png",
        caption: "Blame accuracy on 50 deliberately planted bugs",
      },
    ],
    detail: {
      what: "Agent Labs is an evaluation and debugging framework for AI agents: it records every run, finds the first step that went wrong, and proves a fix with controlled reruns.",
      how: [
        "JSONL eval datasets with programmatic checks (tool called, answer contains, grounded, max steps) plus an LLM judge with structured output.",
        "Failures are sorted into categories: wrong tool, invalid arguments, false claim, incomplete, timeout. Each task reports p50/p95 latency and cost.",
        "Deterministic replay of recorded runs, and forking from any step to rerun N times against a control, scored with Fisher's exact test.",
        "Trajectory diffs between models, and a CI gate that fails the build below a 90% pass rate.",
      ],
      numbers: [
        "Auto-Blame finds the first wrong step 92% of the time with Gemini Flash (72% with Flash-Lite) on 50 seeded failures from 10 bugs, against a 30% baseline.",
        "13/13 runs replayed identically offline, at $0.",
        "A fork proving a fix: 5/5 with the change vs 0/5 without (p = 0.008).",
      ],
      story: {
        title: "The fix that only looked significant",
        body: "One fix scored 4/5 against 0/5 and looked like a win. Reading the trajectories showed the agent was inventing IDs to get there. That's why every fix in Agent Labs has to survive a fork and a trajectory read, not just a pass rate.",
      },
      stack: [
        "Python 3.12 + uv",
        "Gemini Flash / Flash-Lite",
        "OpenTelemetry GenAI-style spans",
        "SQLite trace store",
        "React UI",
        "pytest",
        "GitHub Actions",
      ],
    },
  },
  {
    title: "Genomics AI",
    slug: "genomics-ai",
    featured: true,
    src: "/project-image/genomics-cover.png",
    lightModeSrc: "/project-image/genomics-cover.png",
    video: "https://www.youtube.com/embed/UoxcimVpSIU",
    description:
      "Variant analysis on Stanford's Evo 2 model with a GPU backend, checked against 20,000+ validated clinical records.",
    tech: ["next", "ts", "fastapi", "python", "modal"],
    github: "https://github.com/sehajmakkar/GenomicsAI",
    live: "https://genomics-ai.vercel.app/",
    backgroundImage: "/image copy.png",
    status: "live",
    detail: {
      what: "Genomics AI predicts whether a genetic variant is likely harmful, using Stanford's Evo 2 genomic language model on a GPU backend.",
      how: [
        "Next.js and TypeScript frontend, with a Python + FastAPI backend that runs Evo 2 inference on serverless GPUs.",
        "Integrates 5+ genomic APIs for reference sequences and known variants.",
        "Compares predictions against 20,000+ validated clinical records.",
      ],
      stack: ["Next.js", "TypeScript", "Python", "FastAPI", "Evo 2", "Serverless GPUs (Modal)"],
    },
  },
  {
    title: "RunBook",
    slug: "runbook",
    src: "/project-image/runbook-cover.png",
    lightModeSrc: "/project-image/runbook-cover.png",
    video: "",
    description:
      "An AI manager that runs scheduled voice meetings to hold you accountable for your goals, like a workplace stand-up.",
    tech: ["next", "python", "postgres", "supabase"],
    github: "https://github.com/sehajmakkar/RunBook",
    live: "https://runbook.vercel.app/",
    backgroundImage: "/image copy 3.png",
    status: "building",
  },
  {
    title: "Chronos AI",
    slug: "chronos-ai",
    src: "/project-image/chronos-cover.png",
    lightModeSrc: "/project-image/chronos-cover.png",
    video: "https://www.youtube.com/embed/vdJw3kE1lqw",
    description:
      "A collaborative coding platform with an AI assistant that generates a project structure from a prompt, with real-time editing for teams.",
    tech: ["react", "node", "mongodb", "socketio", "gemini", "redis"],
    github: "https://github.com/sehajmakkar/ChronosAI",
    live: "https://chronos-ai-seven.vercel.app/",
    backgroundImage: "/image copy 4.png",
    status: "live",
  },
  {
    title: "DocTime",
    slug: "doctime",
    src: "/project-image/doctime-cover.png",
    lightModeSrc: "/project-image/doctime-cover.png",
    video: "",
    description:
      "Doctor appointment booking with separate dashboards and role-based access for admins, doctors and patients.",
    tech: ["mongodb", "react", "express", "node", "js"],
    github: "https://github.com/sehajmakkar/DocTime",
    live: "https://doc-time-rust.vercel.app/",
    status: "live",
  },
  {
    title: "ScreamShots",
    slug: "screamshots",
    src: "/project-image/screamshots-cover.png",
    lightModeSrc: "/project-image/screamshots-cover.png",
    video: "",
    description: "Drop in a screenshot and get a clean device mockup in seconds.",
    tech: ["ts", "next", "react", "motion"],
    github: "", // repo is private
    live: "https://screamshots.vercel.app/",
    backgroundImage: "/image copy.png",
    status: "live",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const earlierProjects = projects.filter((p) => !p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

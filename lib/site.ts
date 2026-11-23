// One place for the facts every page, sitemap, JSON-LD and llms.txt repeat.
export const SITE_URL = "https://www.sehaj.tech";

export const SITE = {
  name: "Sehaj Preet",
  // Legal / official name is "Sehaj Preet". Older profiles and the email use
  // "Sehaj Makkar"; handles are sehajmakkar (GitHub, LinkedIn) and kryptokodes (X).
  // Tell search and answer engines these are one person.
  alternateNames: ["Sehaj Makkar"],
  handles: { github: "sehajmakkar", linkedin: "sehajmakkar", x: "kryptokodes" },
  role: "AI and backend engineer",
  tagline: "I build AI agents, evals and the backends they run on.",
  description:
    "Sehaj Preet builds AI agents, evals and the backends they run on. Previously at 3 startups: Perf, PowerPlay and Reslink. Open to AI and backend roles.",
  email: "sehajmakkar007@gmail.com",
  location: { city: "Delhi", country: "IN" },
  image: "/myavatar.png",
  resume: "/resume.pdf",
  links: {
    github: "https://github.com/sehajmakkar",
    linkedin: "https://www.linkedin.com/in/sehajmakkar",
    x: "https://x.com/kryptokodes",
    medium: "https://medium.com/@sehajmakkar007",
    learn: "https://learn.sehaj.tech",
  },
  education: {
    school: "Maharaja Agrasen Institute of Technology",
    university: "Guru Gobind Singh Indraprastha University",
    degree: "B.Tech in Information Technology",
    years: "2023–2027",
    gpa: "9.05",
  },
  knowsAbout: [
    "AI agents",
    "LLM evaluation",
    "Retrieval-augmented generation",
    "Backend engineering",
    "Full-stack web development",
    "TypeScript",
    "Python",
    "Next.js",
    "FastAPI",
    "PostgreSQL",
    "LangGraph",
    "Chrome extensions",
  ],
  awards: ["1st place, Hackaccino 3.0 (Bennett University, 250+ teams)"],
};

export const abs = (path: string) => new URL(path, SITE_URL).toString();

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Projects",
  description:
    "Projects by Sehaj Preet: Vero (AI LaTeX editor), McAgent (local-first macOS agent), Agent Labs (agent evals and debugging) and Genomics AI.",
  path: "/projects",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

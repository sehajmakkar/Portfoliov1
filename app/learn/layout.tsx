import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Learn",
  description:
    "Hands-on courses by Sehaj Preet on learn.sehaj.tech, starting with Docker from first principles.",
  path: "/learn",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

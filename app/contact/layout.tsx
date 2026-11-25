import JsonLd, { pageSchema } from "@/components/json-ld";
import { pageMeta } from "@/lib/seo";

const description =
  "Contact Sehaj Preet about AI engineer or backend roles, or a freelance project. Send a message here, email, or book a call.";

export const metadata = pageMeta({ title: "Contact", description, path: "/contact" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={pageSchema({ type: "ContactPage", name: "Contact", path: "/contact", description })} />
      {children}
    </>
  );
}

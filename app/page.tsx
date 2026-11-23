import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import JsonLd, { homeSchema } from "@/components/json-ld";
import { SITE } from "@/lib/site";
import { getContributions } from "@/lib/contributions-server";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | ${SITE.role}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

// refresh the contribution graph once a day
export const revalidate = 86400;

export default async function Home() {
  const contributions = await getContributions();
  return (
    <>
      <JsonLd data={homeSchema()} />
      <HomePage contributions={contributions} />
    </>
  );
}

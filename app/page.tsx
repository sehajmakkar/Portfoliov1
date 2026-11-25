import HomeSwitch from "@/components/home-switch";
import JsonLd, { homeSchema } from "@/components/json-ld";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { getContributions } from "@/lib/contributions-server";

export const metadata = pageMeta({
  title: `${SITE.name} | ${SITE.role}`,
  fullTitle: true,
  description: SITE.description,
  path: "/",
});

// refresh the contribution graph once a day
export const revalidate = 86400;

export default async function Home() {
  const contributions = await getContributions();
  return (
    <>
      <JsonLd data={homeSchema()} />
      <HomeSwitch contributions={contributions} />
    </>
  );
}

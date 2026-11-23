import KryptoniteSide from "@/components/kryptonite/kryptonite-side";

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Kryptonite",
  description: "The other side of Sehaj Preet: beats, bars and the booth.",
  path: "/kryptonite",
});

export default function KryptonitePage() {
  return <KryptoniteSide />;
}

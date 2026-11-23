import type { ContributionData, Day } from "@/lib/contributions";

const USERNAME = "sehajmakkar";

// Same public source the old calendar widget used, fetched on the server and
// cached for a day so the numbers are in the HTML (and crawlable).
export async function getContributions(): Promise<ContributionData | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=all`,
      { next: { revalidate: 86_400 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { contributions?: Day[] };
    // GitHub counts days in the profile's timezone; Sehaj is in India
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const days = (json.contributions ?? [])
      .map(({ date, count }) => ({ date, count }))
      .filter((d) => d.date <= today)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    return days.length ? { days, today } : null;
  } catch {
    return null;
  }
}

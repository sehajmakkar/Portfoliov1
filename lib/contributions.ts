// Contribution data helpers, shared by the server fetch and the client views.
// Dates are "YYYY-MM-DD" strings and all math is done in UTC so a visitor's
// timezone never shifts a day.

export type Day = { date: string; count: number };
// one count per day from `start`, no gaps: a tenth of the size of {date, count}[]
export type ContributionData = { start: string; counts: number[]; today: string };
export type Range = "last" | number;

const DAY_MS = 86_400_000;
const parse = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10);

export function packDays(days: Day[], today: string): ContributionData {
  const start = days[0].date;
  const counts = Array<number>(Math.round((parse(today) - parse(start)) / DAY_MS) + 1).fill(0);
  for (const d of days) counts[Math.round((parse(d.date) - parse(start)) / DAY_MS)] = d.count;
  return { start, counts, today };
}

export function yearsIn(data: ContributionData): number[] {
  const first = +data.start.slice(0, 4);
  const last = +data.today.slice(0, 4);
  return Array.from({ length: last - first + 1 }, (_, i) => last - i);
}

// A contiguous run of days for the range, with gaps filled as 0.
export function sliceRange(data: ContributionData, range: Range): Day[] {
  const origin = parse(data.start);
  const end = range === "last" ? parse(data.today) : Math.min(Date.UTC(range, 11, 31), parse(data.today));
  const start = range === "last" ? end - 364 * DAY_MS : Date.UTC(range, 0, 1);
  const out: Day[] = [];
  for (let t = start; t <= end; t += DAY_MS) {
    out.push({ date: fmt(t), count: data.counts[Math.round((t - origin) / DAY_MS)] ?? 0 });
  }
  return out;
}

// Columns of 7 (Sunday first), padded with nulls like GitHub's graph.
export function toWeeks(days: Day[]): (Day | null)[][] {
  if (!days.length) return [];
  const pad = new Date(parse(days[0].date)).getUTCDay();
  const cells: (Day | null)[] = [...Array(pad).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// GitHub-style levels: quartiles of the non-zero days in view.
export function levelScale(days: Day[]): (count: number) => 0 | 1 | 2 | 3 | 4 {
  const nz = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p: number) => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))] ?? 1;
  const [a, b, c] = [q(0.25), q(0.5), q(0.75)];
  return (n) => (n <= 0 ? 0 : n <= a ? 1 : n <= b ? 2 : n <= c ? 3 : 4);
}

export function monthLabels(weeks: (Day | null)[][]): { col: number; label: string }[] {
  const out: { col: number; label: string }[] = [];
  let last = -1;
  weeks.forEach((w, col) => {
    const first = w.find(Boolean);
    if (!first) return;
    const m = +first.date.slice(5, 7) - 1;
    if (m !== last) {
      // skip a label squeezed into the first partial column
      if (!(col === 0 && w.filter(Boolean).length < 4))
        out.push({ col, label: new Date(Date.UTC(2000, m, 1)).toLocaleString("en", { month: "short", timeZone: "UTC" }) });
      last = m;
    }
  });
  return out;
}

export function prettyDate(s: string) {
  return new Date(parse(s)).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

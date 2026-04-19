"use client";

import { useEffect, useState, cloneElement } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { Tooltip } from "react-tooltip";

interface PR {
  id: string;
  title: string;
  url: string;
  repository: {
    nameWithOwner: string;
  };
  state: string;
  createdAt: string;
  mergedAt?: string;
  closedAt?: string;
}

const GithubGraph = () => {
  const { theme } = useTheme();
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "merged" | "open" | "closed"
  >("all");
  const [showPRSection, setShowPRSection] = useState(true);
  const [closedPRIds, setClosedPRIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const initialCount = 2;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const response = await fetch(`/api/github/prs?filter=${filterType}`);
        const data = await response.json();
        if (Array.isArray(data?.prs)) {
          const fetchedPRs = data.prs as PR[];
          // Sort by date (newest first)
          fetchedPRs.sort((a: PR, b: PR) => {
            const dateA = new Date(
              b.mergedAt || b.closedAt || b.createdAt,
            ).getTime();
            const dateB = new Date(
              a.mergedAt || a.closedAt || a.createdAt,
            ).getTime();
            return dateA - dateB;
          });
          setPrs(fetchedPRs);
          setShowAll(false);
        }
      } catch (error) {
        console.error("Failed to fetch PRs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [filterType]);

  return (
    <div>
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <h1 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Proof Of Work</span>
      </h1>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <p className="font-custom2 mt-3 mb-6 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-2 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        {" "}
        I live spending time in open source,building real stuff and solving real
        problems
      </p>

      {/* Graph Component */}
      <div className="flex w-full justify-center">
        <div className="flex w-full justify-center">
          {mounted && (
            <>
              <GitHubCalendar
                username="sehajmakkar"
                colorScheme={theme === "dark" ? "dark" : "light"}
                blockSize={isMobile ? 6 : 10}
                blockMargin={isMobile ? 2 : 3}
                fontSize={isMobile ? 10 : 12}
                style={{
                  color: theme === "dark" ? "#e5e5e5" : "#171717",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                renderBlock={(block: any, activity: any) =>
                  cloneElement(block, {
                    "data-tooltip-id": "github-tooltip",
                    "data-tooltip-content": `${activity.count} contributions on ${activity.date}`,
                  })
                }
              />
              <Tooltip
                id="github-tooltip"
                style={{
                  backgroundColor: theme === "dark" ? "#171717" : "#ffffff",
                  color: theme === "dark" ? "#e5e5e5" : "#171717",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border:
                    theme === "dark"
                      ? "1px solid #404040"
                      : "1px solid #e5e5e5",
                  opacity: 1,
                }}
              />
            </>
          )}
        </div>
      </div>
      {showPRSection && (
        <div className="mt-4">
          <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              <span className="link--elara">Pull Requests</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative grid w-fit grid-cols-4 rounded-lg border border-neutral-300/30 bg-black/5 p-1 select-none dark:border-neutral-700/30 dark:bg-white/5">
                {/* Sliding Pill Background */}
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/4)] transform rounded bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-transform dark:bg-neutral-800 ${
                    filterType === "all"
                      ? "translate-x-0"
                      : filterType === "merged"
                        ? "translate-x-[100%]"
                        : filterType === "open"
                          ? "translate-x-[200%]"
                          : "translate-x-[300%]"
                  }`}
                />

                {/* Buttons */}
                <button
                  onClick={() => setFilterType("all")}
                  className={`relative z-10 px-3 py-1.5 text-center text-xs font-medium transition-colors duration-200 ${
                    filterType === "all"
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("merged")}
                  className={`relative z-10 px-3 py-1.5 text-center text-xs font-medium transition-colors duration-200 ${
                    filterType === "merged"
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  Merged
                </button>
                <button
                  onClick={() => setFilterType("open")}
                  className={`relative z-10 px-3 py-1.5 text-center text-xs font-medium transition-colors duration-200 ${
                    filterType === "open"
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setFilterType("closed")}
                  className={`relative z-10 px-3 py-1.5 text-center text-xs font-medium transition-colors duration-200 ${
                    filterType === "closed"
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>
          <p className="font-custom2 mb-4 text-xs text-neutral-600 dark:text-neutral-400">
            {filterType === "all"
              ? "All pull requests"
              : filterType === "merged"
                ? "Merged contributions to open source"
                : filterType === "open"
                  ? "Active pull requests"
                  : "Closed pull requests"}
          </p>
          <div className="-mx-2 mt-6 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

          {loading ? (
            <div className="font-custom2 mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              Loading pull requests...
            </div>
          ) : prs.length > 0 ? (
            <div>
              <div className="mt-5 space-y-2">
                {prs
                  .slice(0, showAll ? prs.length : initialCount)
                  .filter((pr) => !closedPRIds.has(pr.id))
                  .map((pr, index) => (
                    <div
                      key={pr.id}
                      className="group flex items-start gap-3 rounded-md border border-transparent p-3 transition-all duration-200 hover:border-neutral-300/50 hover:bg-neutral-100 dark:hover:border-neutral-700/50 dark:hover:bg-neutral-800/50"
                    >
                      <div className="mt-0.5 shrink-0">
                        <div
                          className={`h-1 w-1 rounded-full transition-transform duration-200 group-hover:scale-150 ${
                            pr.state === "MERGED"
                              ? "bg-linear-to-r from-purple-400 to-pink-400"
                              : pr.state === "OPEN"
                                ? "bg-linear-to-r from-green-400 to-emerald-400"
                                : "bg-linear-to-r from-red-400 to-rose-400"
                          }`}
                        ></div>
                      </div>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 hover:no-underline"
                      >
                        <h3 className="truncate text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-700 dark:text-neutral-50 dark:group-hover:text-neutral-200">
                          {pr.title}
                        </h3>
                        <p className="font-custom2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-500">
                          {pr.repository.nameWithOwner}
                        </p>
                      </a>
                    </div>
                  ))}
              </div>
              {prs.length > initialCount && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="group relative w-full overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800"
                  >
                    {showAll
                      ? "↑ Collapse"
                      : `↓ Expand • ${prs.length - closedPRIds.size - initialCount} more`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-secondary font-custom2 mt-4 text-sm">
              No pull requests found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GithubGraph;

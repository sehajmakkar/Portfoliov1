"use client";

import ProofOfWork from "@/components/proof-of-work";
import type { ContributionData } from "@/lib/contributions";


const GithubGraph = ({ contributions }: { contributions: ContributionData | null }) => {
  // The pull request list below is hidden for now; its state and fetch live
  // in git history (see the commented block) if it comes back.
  /* pull requests are hidden for now, so they aren't fetched either
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
  */

  return (
    <div>
      <div className="-mx-2 mb-2 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>

      <h2 className="font-custom py-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Proof of work</span>
      </h2>
      <div className="-mx-2 mb-4 w-auto border-t border-solid border-[var(--pattern-fg)] opacity-100 md:-mx-14 dark:opacity-15"></div>
      <ProofOfWork data={contributions} />
      {/* Pull requests section, hidden for now. To bring it back, remove this
          comment wrapper (and the one around the fetch above) and turn the
          "// Sliding Pill Background" and "// Buttons" lines back into JSX comments.
      {showPRSection && (
        <div className="mt-4">
          <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-custom text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              <span className="link--elara">Pull Requests</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative grid w-fit grid-cols-4 rounded-lg border border-neutral-300/30 bg-black/5 p-1 select-none dark:border-neutral-700/30 dark:bg-white/5">
                // Sliding Pill Background
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

                // Buttons
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
      */}
    </div>
  );
};

export default GithubGraph;

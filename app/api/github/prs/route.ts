import { NextRequest, NextResponse } from "next/server";

type FilterType = "all" | "merged" | "open" | "closed";

const USERNAME = "sehajmakkar";

function getSearchQuery(filter: FilterType) {
  if (filter === "merged") return `author:${USERNAME} type:pr is:merged`;
  if (filter === "open") return `author:${USERNAME} type:pr is:open`;
  if (filter === "closed")
    return `author:${USERNAME} type:pr is:closed is:unmerged`;
  return `author:${USERNAME} type:pr`;
}

export async function GET(request: NextRequest) {
  const filterParam = request.nextUrl.searchParams.get("filter");
  const filter: FilterType =
    filterParam === "merged" ||
    filterParam === "open" ||
    filterParam === "closed" ||
    filterParam === "all"
      ? filterParam
      : "all";

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        prs: [],
        error:
          "Missing GitHub token. Add GITHUB_TOKEN in server env to fetch pull requests.",
      },
      { status: 500 },
    );
  }

  const query = `query {
    search(query: "${getSearchQuery(filter)}", type: ISSUE, first: 12) {
      edges {
        node {
          ... on PullRequest {
            id
            title
            url
            repository {
              nameWithOwner
            }
            state
            createdAt
            mergedAt
            closedAt
          }
        }
      }
    }
  }`;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { prs: [], error: "Failed to fetch pull requests from GitHub." },
        { status: response.status },
      );
    }

    const data = await response.json();
    const prs = Array.isArray(data?.data?.search?.edges)
      ? data.data.search.edges
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((edge: any) => edge?.node)
          .filter(Boolean)
      : [];

    return NextResponse.json({ prs });
  } catch {
    return NextResponse.json(
      { prs: [], error: "Unexpected error while fetching pull requests." },
      { status: 500 },
    );
  }
}

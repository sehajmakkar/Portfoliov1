// /llms.txt: a plain-text summary for AI assistants and answer engines,
// built from the same data as the site so it never drifts.
import { SITE, SITE_URL } from "@/lib/site";
import { featuredProjects, earlierProjects } from "@/lib/projects-data";

export const dynamic = "force-static";

export function GET() {
  const featured = featuredProjects
    .map((p) => {
      const links = [
        `[${p.title}](${SITE_URL}/projects/${p.slug})`,
        p.live && `live: ${p.live}`,
        p.github && `code: ${p.github}`,
      ].filter(Boolean);
      const numbers = p.detail?.numbers?.map((n) => `  - ${n}`).join("\n");
      return `- ${links.join(" · ")}: ${p.detail?.what ?? p.description}${numbers ? `\n${numbers}` : ""}`;
    })
    .join("\n");

  const earlier = earlierProjects
    .map((p) => `- ${p.title}: ${p.description}${p.live ? ` (${p.live})` : ""}`)
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (also known as ${SITE.alternateNames[0]}; GitHub and LinkedIn: ${SITE.handles.github}; X: @${SITE.handles.x}) is an ${SITE.role} based in Delhi, India. He builds AI agents, the evals that test them, and the backends they run on. He is open to AI and backend roles and to freelance projects, and can start right away.

## Experience

- PowerPlay, Backend Development Intern, Bengaluru (Feb 2026 – Mar 2026): moved Excel export to MongoDB streaming so 100K+ records export in under 2 minutes (was 7+); built a deduplication engine across 95,000+ records.
- Perf, Software Engineering Intern, London, remote (Sep 2025 – Jan 2026): built an AI browser agent as a Chrome extension that replays recorded workflows and self-heals with LLM element grounding; added a LangGraph human-in-the-loop fallback; auto-generated SOPs cut documentation time by 80%+; shipped 15+ features and ran 7+ AWS deployments.
- Reslink Technologies, Software Engineering Intern, Delhi (Jun 2025 – Sep 2025): cut dashboard load time by 15%; built a 3D solar panel design tool in Next.js and Three.js.

## Projects

${featured}

Earlier work:
${earlier}

## Education and awards

- ${SITE.education.degree}, ${SITE.education.school} (${SITE.education.university}), ${SITE.education.years}, GPA ${SITE.education.gpa}.
- 1st place, Hackaccino 3.0 at Bennett University (250+ teams, 3,600+ participants).

## Links

- Website: ${SITE_URL}
- Resume (PDF): ${SITE_URL}${SITE.resume}
- GitHub: ${SITE.links.github}
- LinkedIn: ${SITE.links.linkedin}
- X: ${SITE.links.x}
- Courses: ${SITE.links.learn}
- Email: ${SITE.email}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

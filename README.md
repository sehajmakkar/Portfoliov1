# Portfoliov1

Personal portfolio website built with Next.js, TypeScript, Tailwind CSS, MDX, and Framer Motion.

## Live Website

- https://www.karnashutosh.tech/

## Highlights

- App Router architecture with Next.js
- Responsive UI with Tailwind CSS + reusable components
- Animated interactions using Framer Motion
- Blog system powered by MDX
- Dynamic GitHub graph and project integration
- Dark mode support
- SEO + Open Graph metadata

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- MDX
- Vercel Analytics + Speed Insights

## Project Structure

```text
app/                 # Routes (App Router)
components/          # UI and feature components
data/                # MDX content
lib/                 # Utilities and config
public/              # Static assets
```

## Getting Started

### 1. Clone

```bash
git clone https://github.com/Ashutoshx7/Portfoliov1.git
cd Portfoliov1
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Optional: used for GitHub API-backed sections
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. Run development server

```bash
npm run dev
# or
bun run dev
```

Open http://localhost:3000

## Available Scripts

```bash
npm run dev      # Start local development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

Recommended: deploy on Vercel.

- Import this repository in Vercel
- Add `GITHUB_TOKEN` in project environment variables (if needed)
- Deploy

## Customization Notes

- Update personal info/social links in `app/page.tsx`
- Add or edit projects in components and data files
- Add blog posts in `data/*.mdx`
- Replace assets inside `public/`

## License

This project is licensed under the MIT License.

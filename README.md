# Portfoliov1

[![Live Site](https://img.shields.io/badge/Live-karnashutosh.tech-111111?style=for-the-badge&logo=vercel)](https://www.karnashutosh.tech/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

Personal portfolio website built with Next.js App Router, TypeScript, Tailwind CSS, MDX, and Framer Motion.

`#portfolio` `#nextjs` `#typescript` `#tailwindcss` `#mdx` `#framer-motion` `#vercel`

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Customization](#customization)
- [License](#license)

## Overview

This repository contains the source code for my personal developer portfolio.
It includes project showcases, blog support via MDX, custom UI animations, and GitHub-related dynamic sections.

## Features

- Next.js App Router architecture
- Responsive, component-driven UI
- Dark mode support
- Framer Motion animations and interactive effects
- MDX-powered content/blog flow
- GitHub graph / integration sections
- SEO + Open Graph metadata
- Vercel Analytics + Speed Insights integration

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- MDX (`@next/mdx`, `next-mdx-remote`)
- Vercel Analytics / Speed Insights

## Project Structure

```text
app/                 # App Router pages and layouts
components/          # Shared UI + feature components
data/                # MDX content files
lib/                 # Utilities and app config
public/              # Static assets (images, audio, gifs)
```

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/Ashutoshx7/Portfoliov1.git
cd Portfoliov1
```

2. Install dependencies

```bash
npm install
# or
bun install
```

3. Run the development server

```bash
npm run dev
# or
bun run dev
```

4. Open in browser

```text
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Optional: used by GitHub API-backed sections
GITHUB_TOKEN=your_github_personal_access_token
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

Recommended deployment target: Vercel.

1. Import this repository into Vercel.
2. Configure environment variables (if required), especially `GITHUB_TOKEN`.
3. Deploy.

## Customization

- Edit intro/content in `app/page.tsx`
- Update project/experience sections in `components/`
- Add or edit blog posts in `data/*.mdx`
- Replace media assets in `public/`

## License

Licensed under the MIT License.

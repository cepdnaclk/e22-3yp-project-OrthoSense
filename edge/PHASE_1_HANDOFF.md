# Phase 1 Handoff --- Next.js Project Setup

## Goal

Create a clean, buildable Next.js App Router project and establish the
frontend engineering baseline before implementing the design system.

## Recommended stack

-   Next.js App Router
-   TypeScript strict mode
-   Tailwind CSS
-   ESLint
-   Lucide React
-   Recharts when the chart phase begins
-   React Hook Form and Zod only where form complexity warrants them
-   Vitest and React Testing Library
-   Playwright for end-to-end tests

Confirm versions with current official documentation when creating the
project. Avoid unnecessary dependencies at bootstrap.

## Initial tasks

1.  Check whether a repository already exists; never overwrite it.
2.  Create the Next.js application if needed.
3.  Enable TypeScript, Tailwind CSS, ESLint, App Router, and import
    alias.
4.  Create the base folders for `app`, `components`, `features`, `lib`,
    `mocks`, `types`, and `tests`.
5.  Add `.env.example` with placeholders only.
6.  Add this package's `AGENTS.md` and `README.md`.
7.  Add scripts for development, build, lint, type checking, unit tests,
    and E2E tests as dependencies are introduced.
8.  Run the development server and production build.
9.  Commit the clean baseline to Git.
10. Record commands, versions, and any warnings in the README.

## Initial Antigravity prompt

Inspect the current repository before changing files. Read `AGENTS.md`,
`README.md`, and all documents in `docs/`. Confirm the current Next.js
version and project conventions. Create a small implementation plan for
Phase 1 only. Do not build dashboard features yet. Set up or repair the
Next.js App Router, strict TypeScript, Tailwind CSS, ESLint, basic
folder structure, and useful scripts without deleting existing user
work. Run the available checks and report exact commands, results,
changed files, and remaining issues.

## Phase 1 acceptance criteria

-   The app starts locally.
-   The initial route renders.
-   TypeScript and lint checks run.
-   The production build succeeds.
-   `.env.example` has no real credentials.
-   Git baseline exists.
-   README documents setup and commands.

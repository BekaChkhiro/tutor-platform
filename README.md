# Tutor Platform

Online tutoring marketplace — booking, payments, and video sessions for tutors and students.

## Overview

_TBD — finalized after T0.10 (branding & positioning)._

Tech stack (planned): Next.js + TypeScript + Tailwind, PostgreSQL, LiveKit (video), TBC + BOG (payments).

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the full 21-week roadmap and phase breakdown.

## Setup

Prerequisites:

- Node.js 20+
- pnpm 10+

```bash
pnpm install
cp .env.example .env.local
# fill in required values
pnpm dev
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Unit + integration tests |
| `pnpm test:e2e` | Playwright end-to-end tests |

_Filled in per phase as the scaffolding lands._

## Deploy

_TBD — target environment and CI/CD pipeline defined in Phase 0._

## Commit Conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` git hook (via husky + commitlint) rejects non-conforming messages.

Examples:

```
feat(booking): add slot availability endpoint
fix(auth): expire session on password reset
chore: bump dependencies
```

## License

UNLICENSED — proprietary. See [LICENSE](./LICENSE).

# CI/CD setup (T0.17)

GitHub Actions workflows live in `.github/workflows/`. This runbook
captures the **manual** steps that can't be checked in — branch
protection and secrets — plus how to verify the pipeline end-to-end.

## Workflows

| File                                | Trigger                                    | What it runs                                                   |
| ----------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `.github/workflows/ci.yml`          | `push` (any branch), `pull_request`        | `lint_type` · `test` (+ Codecov upload) · `audit`              |
| `.github/workflows/e2e-preview.yml` | `deployment_status` (Vercel preview)       | Playwright E2E · a11y scan · Lighthouse CI against preview URL |
| `.github/workflows/nightly.yml`     | cron `0 2 * * *` UTC · `workflow_dispatch` | Full E2E suite · Snyk vulnerability scan                       |

Lighthouse budgets live in `.lighthouserc.json`.

## Required GitHub secrets

Add at **Settings → Secrets and variables → Actions → New repository secret**.

| Secret          | Workflow            | How to obtain                                                                        |
| --------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `CODECOV_TOKEN` | `ci.yml` (test job) | Sign up at <https://codecov.io>, add the repo, copy the **Repository Upload Token**. |
| `SNYK_TOKEN`    | `nightly.yml`       | Sign up at <https://snyk.io> (free tier), then **Account settings → Auth Token**.    |

`GITHUB_TOKEN` is provided automatically — no action needed.

### Optional repository variables

| Variable               | Default                    | Purpose                                                 |
| ---------------------- | -------------------------- | ------------------------------------------------------- |
| `NIGHTLY_E2E_BASE_URL` | `https://tutor.vercel.app` | Override the URL that nightly E2E hits (e.g., staging). |

Set at **Settings → Secrets and variables → Actions → Variables**.

## Vercel deployment_status events

The `e2e-preview.yml` workflow listens to `deployment_status` events that
Vercel posts to GitHub when a preview finishes building. No `VERCEL_*`
secret is needed — GitHub Actions reads `github.event.deployment_status.target_url`
directly.

Requirements:

- Vercel project is connected to this repo (see `vercel-setup.md`).
- Vercel's GitHub integration posts deployment statuses (default).
- The deployment environment is named `Preview` or starts with `preview`
  (the workflow's `if:` filter matches both).

## Branch protection on `master`

Configure at **Settings → Branches → Branch protection rules → Add rule**:

- **Branch name pattern**: `master`
- **Require a pull request before merging**: ✅
  - Require approvals: at least 1 (relax to 0 for solo work; tighten later).
  - Dismiss stale approvals when new commits are pushed.
- **Require status checks to pass before merging**: ✅
  - Required checks (search and pin once they've each run at least once):
    - `Lint & type-check`
    - `Tests (unit + integration + component)`
    - `Security audit`
    - `Playwright E2E + a11y`
    - `Lighthouse CI`
  - **Require branches to be up to date before merging**: ✅
- **Require conversation resolution before merging**: ✅
- **Do not allow bypassing the above settings**: ✅
- **Restrict who can push to matching branches**: leave unchecked for
  solo work; restrict to maintainers in a team setup.
- **Allow force pushes** / **Allow deletions**: ❌

Status-check names only become selectable after each job has completed
once on at least one PR. Open a throwaway PR first to populate the list,
then return to this page and pin the names.

## Verification (T0.17.13)

1. Push a branch and open a PR (`gh pr create --draft` works).
2. Confirm in the PR's **Checks** tab:
   - `CI / Lint & type-check` runs.
   - `CI / Tests (unit + integration + component)` runs.
   - `CI / Security audit` runs.
3. Wait for Vercel to deploy the preview. Confirm:
   - `E2E & a11y (Vercel preview) / Playwright E2E + a11y` runs against the preview URL.
   - `E2E & a11y (Vercel preview) / Lighthouse CI` runs.
4. With branch protection in place, attempt to merge before all checks
   are green — GitHub should block the merge button.
5. Nightly cron: trigger manually once via
   **Actions → Nightly → Run workflow** to confirm the schedule path works.

## Local mirror of CI checks

Run before pushing to avoid red-X feedback loops:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm format:check
pnpm test:coverage
pnpm audit --audit-level=high --prod
```

E2E (against a running `pnpm dev`):

```sh
pnpm test:e2e
pnpm test:a11y
```

## Troubleshooting

- **Codecov upload skipped silently** — `CODECOV_TOKEN` is missing or wrong; the action is non-fatal (`fail_ci_if_error: false`), so the job still passes. Add the secret.
- **Snyk job warns about no token** — `SNYK_TOKEN` not set. The action is `continue-on-error: true`; it surfaces results when present but won't fail the workflow.
- **`pnpm install` fails on integration test runner** — Testcontainers needs Docker; ubuntu-latest runners ship with it. If switching to a custom runner, install Docker first.
- **E2E preview job never starts** — Vercel preview hasn't fired `deployment_status` yet, or the environment isn't named `Preview`. Check **PR → Checks → deployments** and Vercel's logs.

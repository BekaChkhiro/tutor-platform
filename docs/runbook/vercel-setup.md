# Vercel setup (T0.6)

Manual + CLI steps to connect this repo to Vercel for preview + production deploys.

## 1. Create / link the project (dashboard)

1. Sign in to <https://vercel.com> with GitHub.
2. **Add New → Project → Import** `BekaChkhiro/tutor`.
3. Framework preset: **Next.js** (auto-detected).
4. Build settings — leave at defaults; pnpm is picked up from `packageManager`
   in `package.json`. Verify:
   - Install command: `pnpm install`
   - Build command: `pnpm build`
   - Output: `.next` (default)
   - Node.js version: 20.x or 22.x
5. Skip env vars in the import wizard (added in step 2).
6. Click **Deploy** — the first build will fail without env vars; that's fine.

## 2. Environment variables

In **Project → Settings → Environment Variables**, add placeholders for
`Production`, `Preview`, and `Development` scopes. Use real values for
Production once the corresponding service is provisioned.

| Variable          | Source / when to fill                               |
| ----------------- | --------------------------------------------------- |
| `DATABASE_URL`    | Neon **pooled** connection string (T0.5).           |
| `DIRECT_URL`      | Neon **direct** connection string (T0.5).           |
| `NEXTAUTH_URL`    | `https://<vercel-prod-domain>` (Production).        |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` — unique per environment. |
| `RESEND_API_KEY`  | Resend dashboard (added later).                     |

See `.env.example` for shape.

## 3. Git integration

**Settings → Git**:

- **Production Branch**: `master`
- **Preview Deployments**: enabled for all branches + PRs (default).
- **Ignored Build Step**: leave default.

## 4. Local CLI link

```sh
vercel login         # one-time, browser auth
vercel link          # link this checkout to the Vercel project
                     # writes .vercel/project.json (gitignored)
```

After linking, `vercel env pull .env.local` syncs remote env vars to local.

## 5. First deploy

Push to `master`:

```sh
git push origin master
```

Vercel builds and deploys. Verify the deployed URL renders the homepage
(blank Next.js shell is fine at this stage).

## 6. Verify previews

Open a PR from any branch — Vercel comments the preview URL on the PR.
Confirm the preview URL serves the branch's code.

## Acceptance

- First push to `master` triggers a successful Vercel deploy.
- Opening a PR auto-creates a preview URL.
- `.vercel/project.json` exists locally and is gitignored.

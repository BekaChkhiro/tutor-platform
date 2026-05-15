# Sentry setup (T0.12)

Code wiring is in place — these are the manual steps required to make it
actually capture errors. SDK: `@sentry/nextjs` v10.

## 1. Create the Sentry project

1. Sign up / sign in at <https://sentry.io>.
2. **Create Project** → platform **Next.js** → name `tutor`.
3. From the SDK setup screen copy the **DSN** (`https://<key>@oXXXX.ingest.sentry.io/<project-id>`).
4. **Settings → Account → API → Auth Tokens → Create New Token**. Scopes
   needed for source-map upload: `project:read`, `project:releases`,
   `org:read`. Copy the token — it is only shown once.
5. Note the **Organization Slug** and **Project Slug** (URL bar:
   `sentry.io/organizations/<org>/projects/<project>/`).

## 2. Local env vars

Add to `.env.local` (do not commit):

```
SENTRY_DSN="https://<key>@oXXXX.ingest.sentry.io/<project-id>"
NEXT_PUBLIC_SENTRY_DSN="https://<key>@oXXXX.ingest.sentry.io/<project-id>"
SENTRY_AUTH_TOKEN="sntrys_..."
SENTRY_ORG="<org-slug>"
SENTRY_PROJECT="<project-slug>"
```

`NEXT_PUBLIC_SENTRY_DSN` is the same value as `SENTRY_DSN` — the prefix
exposes it to the browser bundle.

## 3. Vercel env vars

In **Project → Settings → Environment Variables**, add the same five
variables across `Production`, `Preview`, and (optionally) `Development`
scopes. `SENTRY_AUTH_TOKEN` is build-time only — leave it out of
`Development` if local builds don't upload source maps.

## 4. Local smoke test

```sh
pnpm dev
curl -i http://localhost:3000/api/sentry-test
```

The route throws `SentryTestError`. Within ~30s the issue appears in
**Issues** in the Sentry dashboard with a source-mapped stack trace
pointing at `src/app/api/sentry-test/route.ts`.

## 5. Production smoke test

After the first Vercel deploy that includes these env vars:

```sh
curl -i https://<your-prod-domain>/api/sentry-test
```

Confirm the issue appears within 1 minute and the stack trace resolves
to original TypeScript (not the minified bundle). If frames are
minified, source-map upload failed — check the Vercel build log for
`Sentry CLI` output.

## 6. Alerts

In **Alerts → Create Alert Rule** set up three rules on the `tutor`
project:

| Name            | Condition                                          | Action        |
| --------------- | -------------------------------------------------- | ------------- |
| New issue       | A new issue is created                             | Email + Slack |
| Error spike     | Number of events in an issue is more than 50 in 1h | Email + Slack |
| Crash rate > 1% | Crash free session rate is less than 99% in 1h     | Email + Slack |

Trigger the test endpoint repeatedly to verify the spike rule fires.

## 7. Remove the test endpoint (optional)

Once the prod smoke test passes, delete `src/app/api/sentry-test/` so
the public route is gone. The plan keeps it for now to make the gate
re-runnable.

## Sampling

- `tracesSampleRate` is `0.1` in production (10% of transactions) and
  `1.0` in development. Tweak in `src/instrumentation-client.ts`,
  `sentry.server.config.ts`, `sentry.edge.config.ts`.
- Session Replay is enabled only on errors (`replaysOnErrorSampleRate:
1.0`, `replaysSessionSampleRate: 0`) to keep volume low.

## File map

- `src/instrumentation-client.ts` — browser SDK init (Sentry v9+ name
  for what used to be `sentry.client.config.ts`; required for Turbopack
  compatibility). Also exports `onRouterTransitionStart` so client-side
  navigations are traced.
- `sentry.server.config.ts` — Node runtime init (loaded by
  `src/instrumentation.ts`).
- `sentry.edge.config.ts` — Edge runtime init (loaded by
  `src/instrumentation.ts`).
- `src/instrumentation.ts` — Next.js entry hook; also re-exports
  `Sentry.captureRequestError` as `onRequestError` so server-component
  and route-handler errors reach Sentry.
- `src/app/global-error.tsx` — captures React render errors at the
  root boundary (App Router requirement for Sentry coverage).
- `next.config.ts` — wrapped with `withSentryConfig` for source-map
  upload at build time. Upload is auto-disabled when
  `SENTRY_AUTH_TOKEN` is unset.

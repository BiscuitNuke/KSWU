# KSW.dev

Kieran Wittstruck’s professional portfolio. Next.js with plain CSS, a static export, and a small set of function components.

## Develop

Use Node 22 or newer.

```sh
npm ci
npm run dev
```

## Content

- `lib/profile.ts`: verified professional facts, experience, skills, and selected case studies. Current source: November 2026 resume.
- `app/resume/page.tsx`: printable resume assembled from the same profile data. Print or save as PDF in the browser. It is a web adaptation, not the original uploaded PDF.
- `config/activity.json`: explicit allowlist of public GitHub repositories. Starts with KSWU only.
- `scripts/refresh-activity.mjs`: verifies public visibility, reads useful commits, and writes `public/activity.json`. It never enumerates your private repositories.

## Build and check

```sh
npm run build
npm run typecheck
```

Build refreshes public activity and exports all pages into `out/`. If repository privacy cannot be verified, the feed omits that repository rather than exposing cached activity. No AI-generated professional claims are published.

## Deployment

See `deploy/README.md`. The Raskal flow follows the separate Raskal-QoL pattern: GitHub Actions builds a static container image, pins an immutable tag, and Dockhand pulls the stack. The public portfolio must stay outside Authentik’s gate.

Preview branches and pull requests build artifacts only. Main-branch builds can publish an image and update the deployment pin. The first deployment and Cloudflare Pages cutover are documented but require host, Dockhand, gateway, and DNS access.

## Scope

KSWU is the professional portfolio. Chipnuke remains a separate future retro blog, linked from the footer and personal section. Existing archived project notes under `content/projects/` are retained as source history and are not routed as public case studies. Only explicitly selected projects in `lib/profile.ts` generate pages.

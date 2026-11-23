# KSWU on Raskal

This package prepares a public, static portfolio for the Raskal stack. It does not create a Dockhand stack, change DNS, alter the gateway, or replace the current site. The initial `unpublished` image is deliberately unusable until main has built successfully.

## Build and review

Use Node 22 and the committed npm lockfile:

```sh
npm ci
npm run build
docker build -t kswu-local .
docker run --rm --read-only --tmpfs /tmp:rw,size=32m,mode=1777 --cap-drop ALL --security-opt no-new-privileges -p 127.0.0.1:8088:8080 kswu-local
```

Open `http://127.0.0.1:8088`. Unknown URLs must return HTTP 404; they must not fall back to the homepage. The runtime is unprivileged nginx on port 8080, with a read-only filesystem and temporary writes limited to `/tmp`. The root Dockerfile builds the site; `deploy/Dockerfile` packages an already validated `out/` export in CI.

Pull requests and `codex/**` branches build an export, package it in a local test container, check real HTTP routes and 404 responses, then upload an artifact. They do not publish images or update deployment pins. The artifact is a downloadable static export, not a hosted preview URL.

## Automatic updates

After merge to `main`, **Build portfolio** installs from `package-lock.json`, refreshes the public activity feed through `npm run build`, builds the export, smoke-tests the hardened container, pushes `ghcr.io/biscuitnuke/kswu:sha-<full-source-commit>-<run-id>-<run-attempt>`, and pins that image in `deploy/compose.yaml`. A daily scheduled run at 13:17 UTC refreshes public activity without requiring a code push. The schedule is a repository workflow and becomes active only when merged to the default branch with Actions enabled.

The feed script controls an explicit public repository allowlist in `config/activity.json`. It does not receive an authenticated GitHub token here. Resume claims and case study text remain edited source content; they are not generated from commits. A failed feed request follows the script's cache behavior. A failed build or container smoke check cannot advance the image pin. Refusing a stale main revision avoids deploying over newer changes.

The workflow commits only refreshed `public/activity.json` and the image pin. GitHub's normal `GITHUB_TOKEN` suppresses recursive push-triggered runs; `[skip ci]` and a Compose path exclusion provide additional loop prevention. Do not replace that token with a PAT. Branch protections may require an adjusted PR-based promotion flow: if direct bot pushes are blocked, the workflow fails without bypassing protection. Image tags include the source commit, workflow run ID, and run attempt. Scheduled rebuilds and retries get distinct tags, even when source is unchanged or a base image has updated; a later build never replaces an earlier release tag. Do not overwrite those tags manually. A failed deployment can be rolled back to an earlier known-good image tag.

## Connect Dockhand after review

This mirrors the **Raskal-QoL (Ops)** pattern: GitHub is authoritative, GHCR stores the image, and Dockhand polls Git from inside the network. No GitHub runner needs inbound SSH access to Raskal.

1. Build main successfully before adding the stack. In Dockhand, add repository read access to KSWU. If the GHCR image is private, add a registry credential with `read:packages` only.
2. Create a **separate** Git stack named `kswu`, repository `BiscuitNuke/KSWU`, branch `main`, Compose path `deploy/compose.yaml`. Enable Git sync with `*/15 * * * *` only when automatic deployment is wanted.
3. Set `KSWU_BIND_IP` to the chosen web host's private address and `KSWU_PORT` to an unused port (default 8088). The safe default binds loopback only and is intentionally unreachable from a different gateway VM.
4. Permit the existing Caddy gateway to reach that one TCP port. Block other clients from the published port. Docker's published ports require host/router firewall enforcement, not an assumption that UFW alone protects them.
5. Prefer a dedicated web VM/network. Reusing RaskalDev is possible with a gateway-only firewall rule, but keep the portfolio separate from the QoL stack, its volumes, credentials, and Docker socket.
6. Check `/healthz`, `/`, a case study, the printable resume page, fonts/assets, and an unknown route over the internal connection. Check `docker compose ps` and logs.

## Public gateway and cutover

Use `Caddyfile.snippet` as a reviewed addition to the live gateway config, after setting `KSWU_UPSTREAM` in the Caddy container environment to the site's private address and port. This site intentionally imports `common` without `gate`: employers must not see Authentik login. Existing SSO-protected applications keep their existing routes.

Before applying, validate the complete Caddy config using the gateway's existing Caddy container, check that `ksw.dev` and `www.ksw.dev` will reach it, and confirm TLS issuance with the current DNS/proxy setup. The current gateway publishes 443 only and disables the HTTP ACME challenge; this package does not change those settings. A temporary test hostname can be used before changing production DNS, but it needs its own DNS/TLS setup.

Keep the current Cloudflare Pages deployment and existing DNS values available during verification. After a successful preview, point the domains at the intended gateway, verify external HTTPS, assets, redirects, correct 404 status, the resume page's print/save-to-PDF flow, and public accessibility without a login. The snippet makes `https://ksw.dev` canonical and redirects `www`; change that explicitly if another canonical name is desired.

**Raskal-Infra is a snapshot record, not deployment source.** Do not edit its GitHub host folders to deploy this. Apply a reviewed config on the VM; its next snapshot records the result.

## Rollback

Disable Dockhand Git auto-update before selecting a previous image, or a later sync can reapply main. Pin a previous successful source-SHA/run image in a reviewed commit and redeploy. If ingress is at fault, restore the gateway config backup. If necessary, restore the previous DNS records to the retained Pages deployment. Verify HTTPS and the resume URL again. Keep previous images until the replacement has been verified.

## Reference behavior

- [Next.js static export](https://nextjs.org/docs/app/guides/static-exports)
- [Unprivileged nginx image](https://github.com/nginx/docker-nginx-unprivileged)
- [GitHub workflow recursion and GITHUB_TOKEN](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)

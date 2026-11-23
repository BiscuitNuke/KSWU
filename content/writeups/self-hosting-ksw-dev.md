---
title: Moving ksw.dev onto my own box
date: 2026-11-22
summary: Off Vercel and Cloudflare Pages, onto a container in my own rack. Push to main and a bot ships it.
tags: Docker, CI/CD, Caddy
---

This site used to live on Vercel and Cloudflare Pages. It worked. It also wasn't mine. Now it runs in a container on the same box as the rest of Raskal, behind the same gateway.

## The pipeline

1. **Push to main.** GitHub Actions builds the Next.js site as a static export and puts it in an nginx container.
2. **Smoke test.** CI starts the container and checks that the pages actually load before anything gets published.
3. **Publish.** The image goes to GitHub's container registry, tagged with the commit.
4. **Pin.** CI commits the new image tag into the compose file. That commit is the deploy record.
5. **Ship.** Dockhand watches the repo and redeploys the stack when the compose file changes.

No SSH keys in CI, and nothing in the lab is reachable from GitHub. The lab pulls. GitHub never pushes in.

## Locking down the container

It's a static site, so it doesn't need much:

- Read-only root filesystem, with a small tmpfs for nginx.
- Runs as an unprivileged user with every capability dropped and `no-new-privileges`.
- Memory and process limits.
- It only listens on the inside network. Caddy at the edge does TLS.

## Keeping it public-safe

The site talks about my network a lot, so before every push I run a scan for private addresses, VLAN numbers, ports, and internal hostnames. If anything shows up, it doesn't ship.

## The cutover

DNS moved to the gateway's address, Caddy got a cert on the first request, and the old host started redirecting. The only real problem was my own browser holding onto a cached redirect from Vercel. Clearing the cache fixed it.

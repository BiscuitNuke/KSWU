---
title: One login for everything I run
date: 2026-11-23
summary: How I put Authentik and a Caddy gateway in front of every app in Raskal, and the twelve things that broke on the way.
tags: Identity, Authentik, Caddy
---

I wanted one door. One login, a YubiKey, and then every app I run: GitLab, a browser VS Code, a remote desktop, the game server panel. No VPN to remember, no per-app passwords.

So Raskal has a gateway at the edge running Caddy, and an identity box running Authentik. Caddy terminates TLS and asks Authentik "is this person allowed?" before it passes anything through. Apps that speak OIDC get real SSO. Apps that don't sit behind forward auth, so they never see an unauthenticated request.

## The shape of it

- **Gateway.** Caddy, in its own DMZ network. It's the only thing the internet can reach.
- **Identity.** Authentik with PostgreSQL. WebAuthn only, so a YubiKey or nothing.
- **Apps.** Each one on the inside network. The gateway can reach them. They can't reach back out to the house.

The whole thing is the practice run for HamLab. Same flows, same gate, just without Active Directory behind it yet.

## What broke

This is the part I actually want to remember.

- **Login loops.** The standalone Authentik outpost sent the wrong Host header, so every login bounced back to the start. The embedded outpost works. Use that.
- **TLS that looked fine.** A self-signed cert with `CA:TRUE` gets rejected by rustls as a CA used as an end entity. Make a tiny CA and sign a real leaf cert.
- **Every OIDC login rejected.** An Authentik provider with no signing key signs with HS256, and apps refuse it. Always set a signing key.
- **Redirect URIs.** They have to match exactly. Strict mode, trailing slash and all.
- **Mangled secrets.** Long secrets got changed when I pasted them into a terminal. Now I enter them with `read -rs` and compare SHA-256 hashes on both ends.
- **Hairpin DNS.** Containers resolved the public name to the WAN IP and tried to go out and back in. Internal DNS records fixed it.
- **Docker ignores ufw.** Docker writes its own iptables rules. Filtering goes in the `DOCKER-USER` chain, matched on the original destination port.
- **A firewall that came back.** The game panel's root service re-added its own ufw rules at every boot. I moved its units aside and masked them.
- **Timers at 3 AM UTC.** New VMs default to UTC, so nightly jobs ran at the wrong hour. Set the time zone on day one.
- **Everything pushing at once.** Several VMs pushing to Git at the same minute collided. A random delay and a retry fixed it.
- **Log filtering.** Caddy's JSON logs put `msg` before the logger name, so filter by name first, then by message.
- **New VLANs.** A new network has to be allowed on every uplink it crosses. I forgot one. Twice.

## Would I do it again

Yes. The first app took a weekend. The last one took twenty minutes, because every one of those problems only had to be solved once.

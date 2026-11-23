"""ksw.dev live feed.

Every couple of minutes, read the lab's Prometheus and the Flight Wall API on the
home network, keep only public-safe numbers, and write /live/live.json. nginx serves
that file at https://ksw.dev/live.json. Nothing in the lab is exposed: this job pulls,
the internet only ever sees the finished file.

Env:
  PROM_URL        Prometheus base URL, e.g. http://host.docker.internal:9090 (empty = off)
  JOB_LABELS      job=Public name pairs, comma separated, e.g. "caddy=Gateway,authentik=SSO"
                  Only jobs listed here are published, under the public name.
  FLIGHTWALL_URL  Flight Wall base URL (empty = off). Uses GET /api/bot/now.
  INTERVAL        seconds between runs (default 120)
  OUT             output file (default /live/live.json)
"""
import json
import os
import time
import urllib.parse
import urllib.request

PROM = os.environ.get("PROM_URL", "").rstrip("/")
FW = os.environ.get("FLIGHTWALL_URL", "").rstrip("/")
OUT = os.environ.get("OUT", "/live/live.json")
INTERVAL = max(30, int(os.environ.get("INTERVAL", "120")))
LABELS = {}
for pair in os.environ.get("JOB_LABELS", "").split(","):
    if "=" in pair:
        job, name = pair.split("=", 1)
        if job.strip() and name.strip():
            LABELS[job.strip()] = name.strip()


def get(url, timeout=5):
    req = urllib.request.Request(url, headers={"User-Agent": "ksw-feed/1"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def prom(query):
    data = get(PROM + "/api/v1/query?" + urllib.parse.urlencode({"query": query}))
    return {r["metric"].get("job", ""): float(r["value"][1]) for r in data["data"]["result"]}


def lab():
    if not PROM or not LABELS:
        return None
    # A job is up only if every target in it is up.
    up = prom("min by (job) (up)")
    day = prom("avg by (job) (avg_over_time(up[24h]))")
    services = [{"name": name, "up": up.get(job) == 1.0, "uptime24": round(day[job] * 100, 2) if job in day else None}
                for job, name in LABELS.items() if job in up]
    return {"services": services, "up": sum(s["up"] for s in services), "total": len(services)}


def alt_band(alt):
    # Rounded so it reads like a fact, not a track.
    try:
        return int(round(float(alt) / 1000.0)) * 1000
    except (TypeError, ValueError):
        return None


def flights():
    if not FW:
        return None
    d = get(FW + "/api/bot/now")
    today = d.get("today") or {}
    sign = d.get("on_sign") or {}
    out = {
        "in_range": int(d.get("aircraft") or 0),
        "heard_today": int(today.get("heard") or 0),
        "farthest_nm": int(today["far_nm"]) if today.get("far_nm") else None,
        "board_on": bool(d.get("active")),
        # Only the type and a rounded altitude. No callsign, position, or distance.
        "on_board": {"type": sign.get("type_name") or sign.get("type"), "alt_ft": alt_band(sign.get("alt"))}
        if sign and (sign.get("type_name") or sign.get("type")) else None,
    }
    return out


def write(doc):
    tmp = OUT + ".tmp"
    with open(tmp, "w") as fh:
        json.dump(doc, fh, separators=(",", ":"))
    os.replace(tmp, OUT)


def main():
    last = {"lab": None, "flights": None}
    while True:
        doc = {"updated": int(time.time())}
        for key, fn in (("lab", lab), ("flights", flights)):
            try:
                last[key] = fn()
                doc[key] = last[key]
            except Exception as e:  # source down: keep the last good value, mark it stale
                print(key, "failed:", type(e).__name__, flush=True)
                doc[key] = dict(last[key], stale=True) if last[key] else None
        try:
            write(doc)
        except OSError as e:
            print("write failed:", e, flush=True)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()

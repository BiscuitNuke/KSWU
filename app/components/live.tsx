"use client";
import { useEffect, useState } from "react";

// Reads /live.json, which a job in the lab rewrites every 2 minutes.
// If the file isn't there (feed off, or local dev), these render nothing.
type Live = {
    updated: number;
    lab?: { services: { name: string; up: boolean; uptime24: number | null }[]; up: number; total: number; stale?: boolean } | null;
    flights?: { in_range: number; heard_today: number; farthest_nm: number | null; board_on: boolean; on_board: { type: string; alt_ft: number | null } | null; stale?: boolean } | null;
};

function useLive() {
    const [live, setLive] = useState<Live | null>(null);
    useEffect(() => {
        let alive = true;
        const load = () => fetch("/live.json", { cache: "no-store" })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (alive && d && typeof d.updated === "number") setLive(d); })
            .catch(() => {});
        load();
        const t = setInterval(load, 60000);
        return () => { alive = false; clearInterval(t); };
    }, []);
    return live;
}

function ago(ts: number) {
    const s = Math.max(0, Math.round(Date.now() / 1000 - ts));
    if (s < 90) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    return Math.round(s / 3600) + " h ago";
}

// Older than 15 minutes means the feed itself stopped. Say so instead of pretending.
const old = (l: Live) => Date.now() / 1000 - l.updated > 900;

export function LabStatus() {
    const live = useLive();
    const lab = live?.lab;
    if (!live || !lab || !lab.total) return null;
    const stale = lab.stale || old(live);
    const all = lab.up === lab.total;
    return <div className={"live-strip" + (stale ? " stale" : "")} aria-live="polite">
        <p className="live-head">
            <span className={"live-dot" + (all && !stale ? "" : " warn")} />
            <span>{stale ? "Feed stale" : "Live"}</span>
            <span className="live-big">{lab.up}/{lab.total} up</span>
            <span className="live-ago">updated {ago(live.updated)}</span>
        </p>
        <ul className="live-list">
            {lab.services.map(s => <li key={s.name} className={s.up ? "" : "down"}>
                <span className="live-dot small" />{s.name}
                {s.uptime24 != null && <em>{s.uptime24.toFixed(s.uptime24 >= 99.95 ? 0 : 1)}% · 24h</em>}
            </li>)}
        </ul>
    </div>;
}

export function FlightsNow() {
    const live = useLive();
    const f = live?.flights;
    if (!live || !f) return null;
    const stale = f.stale || old(live);
    return <div className={"live-strip" + (stale ? " stale" : "")} aria-live="polite">
        <p className="live-head">
            <span className={"live-dot" + (stale ? " warn" : "")} />
            <span>{stale ? "Feed stale" : "Live from my receiver"}</span>
            <span className="live-ago">updated {ago(live.updated)}</span>
        </p>
        <dl className="live-stats">
            <div><dt>In range now</dt><dd>{f.in_range}</dd></div>
            <div><dt>Heard today</dt><dd>{f.heard_today}</dd></div>
            {f.farthest_nm != null && <div><dt>Farthest today</dt><dd>{f.farthest_nm} nm</dd></div>}
            <div><dt>On the board</dt><dd className="live-small">{f.board_on && f.on_board ? f.on_board.type + (f.on_board.alt_ft ? " · " + f.on_board.alt_ft.toLocaleString() + " ft" : "") : "Board is off"}</dd></div>
        </dl>
    </div>;
}

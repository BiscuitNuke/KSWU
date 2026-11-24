"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/* Something interesting on every page. Each piece stops moving for reduced motion. */
const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── /projects: filter by kind, ctOS readout ── */
type P = { slug: string; name: string; kind: string; status: string; dates: string; summary: string };
const groups: { k: string; match: (kind: string) => boolean }[] = [
    { k: "All", match: () => true },
    { k: "Infrastructure", match: k => /identity|infrastructure|automation/i.test(k) },
    { k: "Hardware", match: k => /hardware|garage/i.test(k) },
    { k: "Software", match: k => /ios|app/i.test(k) },
    { k: "Security", match: k => /malware|identity|detection/i.test(k) },
];
export function ProjectFilter({ projects }: { projects: P[] }) {
    const [g, setG] = useState(0);
    const shown = projects.filter(p => groups[g].match(p.kind));
    return <>
        <div className="pf-bar" role="toolbar" aria-label="Filter projects">
            {groups.map((x, i) => <button key={x.k} className={i === g ? "on" : ""} aria-pressed={i === g} onClick={() => setG(i)}>
                {x.k}<em>{projects.filter(p => x.match(p.kind)).length}</em>
            </button>)}
            <span className="pf-read" aria-live="polite">showing {shown.length}/{projects.length}</span>
        </div>
        <ol className="work-list" key={g}>
            {shown.map((p, i) => <li key={p.slug} className="pf-in" style={{ animationDelay: i * 0.05 + "s" }}>
                <Link className="work-row" href={"/projects/" + p.slug + "/"} data-profile={p.name.toUpperCase() + "|TYPE:" + p.kind + "|STATUS:" + p.status + "|SINCE:" + p.dates + "|THREAT:low"}>
                    <span className="work-num">{String(projects.indexOf(p) + 1).padStart(2, "0")}</span>
                    <span className="work-name">{p.name}</span>
                    <span className="work-summary">{p.summary}</span>
                    <span className="work-meta"><span>{p.kind}</span><span className="status">{p.status}</span></span>
                </Link>
            </li>)}
        </ol>
    </>;
}

/* ── /writeups: the list, as a git log that types itself ── */
export function GitLog({ posts }: { posts: { slug: string; title: string; date: string }[] }) {
    const lines = useMemo(() => posts.map((p, i) => ({ h: (0x9e3779b1 * (i + 7) >>> 0).toString(16).slice(0, 7), ...p })), [posts]);
    const [n, setN] = useState(0);
    useEffect(() => {
        if (still()) { setN(lines.length + 1); return; }
        const t = lines.map((_, i) => setTimeout(() => setN(i + 1), 500 + i * 380));
        t.push(setTimeout(() => setN(lines.length + 1), 500 + lines.length * 380));
        return () => t.forEach(clearTimeout);
    }, [lines]);
    return <div className="term gitlog" aria-hidden="true">
        <div className="term-bar"><span /><span /><span /><em>~/ksw.dev/content/writeups</em></div>
        <pre><span className="pr">$</span> git log --oneline{"\n"}
            {lines.slice(0, n).map(l => <span key={l.slug} className="gl-line"><b>{l.h}</b> {l.date} {l.title}{"\n"}</span>)}
            {n > lines.length ? <span className="pr">$ <i className="caret">▌</i></span> : null}</pre>
    </div>;
}

/* ── /writeups/[slug]: reading progress + a contents rail that tracks where you are ── */
export function ReadingAids() {
    const [p, setP] = useState(0);
    const [heads, setHeads] = useState<{ id: string; t: string }[]>([]);
    const [cur, setCur] = useState("");
    useEffect(() => {
        const art = document.querySelector(".prose"); if (!art) return;
        const hs = Array.from(art.querySelectorAll("h2"));
        hs.forEach((h, i) => { if (!h.id) h.id = "s-" + i; });
        setHeads(hs.map(h => ({ id: h.id, t: h.textContent || "" })));
        const onScroll = () => {
            const r = art.getBoundingClientRect();
            setP(Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight * 0.6))));
            let c = ""; hs.forEach(h => { if (h.getBoundingClientRect().top < innerHeight * 0.35) c = h.id; }); setCur(c);
        };
        onScroll(); addEventListener("scroll", onScroll, { passive: true });
        return () => removeEventListener("scroll", onScroll);
    }, []);
    return <>
        <div className="read-bar" style={{ transform: "scaleX(" + p + ")" }} aria-hidden="true" />
        {heads.length > 1 && <nav className="toc" aria-label="On this page">
            <p className="label">On this page · {Math.round(p * 100)}%</p>
            <ol>{heads.map(h => <li key={h.id} className={h.id === cur ? "on" : ""}><a href={"#" + h.id}>{h.t}</a></li>)}</ol>
        </nav>}
    </>;
}

/* ── /now: a live status board ── */
const marks = [
    { k: "B.S.", d: new Date("2027-05-15T12:00:00-04:00") },
    { k: "Co-op", d: new Date("2027-06-01T12:00:00-04:00") },
    { k: "M.S.", d: new Date("2027-12-15T12:00:00-05:00") },
];
export function NowBoard() {
    const [t, setT] = useState<Date | null>(null);
    useEffect(() => { setT(new Date()); const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
    const time = t ? t.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--";
    const hour = t ? parseInt(t.toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }), 10) : 12;
    const state = hour < 7 ? "Asleep. Probably." : hour < 9 ? "Coffee, then class" : hour < 17 ? "Class or NetComm" : hour < 23 ? "In the lab" : "Should be asleep";
    const start = new Date("2026-11-01T12:00:00-04:00").getTime(), end = marks[2].d.getTime();
    const now = t ? t.getTime() : start;
    const pos = (ms: number) => Math.min(100, Math.max(0, ((ms - start) / (end - start)) * 100));
    const days = (d: Date) => Math.max(0, Math.ceil((d.getTime() - now) / 864e5));
    return <div className="sc now-board">
        <div className="sc-head"><span className="sc-dot" />status<span className="sc-meta">Rochester, NY</span></div>
        <div className="nb-top">
            <div><p className="label">Local time</p><p className="nb-clock">{time}</p></div>
            <div><p className="label">Probably doing</p><p className="nb-state">{state}</p></div>
        </div>
        <div className="nb-track">
            <div className="nb-fill" style={{ width: pos(now) + "%" }} />
            <span className="nb-now" style={{ left: pos(now) + "%" }}><b>now</b></span>
            {marks.map((m, mi) => <span key={m.k} className={"nb-mark" + (mi === 1 ? " up" : "")} style={{ left: pos(m.d.getTime()) + "%" }}><i /><b>{m.k}</b><em>{t ? days(m.d) + " days" : ""}</em></span>)}
        </div>
    </div>;
}

/* ── /resume: the path so far, drawn as you scroll ── */
const path = [
    { d: "Apr 2023", t: "iVue", s: "Sysadmin and photographer. Windows Server, AD." },
    { d: "Aug 2023", t: "Vital Air Services", s: "Rebuilt the company site, run their IT." },
    { d: "May 2024", t: "Security+", s: "CompTIA Security+ CE." },
    { d: "2024", t: "HamLab", s: "The rack in the basement starts." },
    { d: "2024", t: "IRSeC, 3rd place", s: "Red vs. blue at RITSEC." },
    { d: "Jan 2026", t: "RIT NetComm", s: "Student employee, then intern for the summer." },
    { d: "2026", t: "Raskal", s: "One login for everything I run." },
    { d: "May 2027", t: "B.S.", s: "Cybersecurity, RIT.", future: true },
    { d: "Summer 2027", t: "Co-op", s: "Lined up.", future: true },
    { d: "Dec 2027", t: "M.S.", s: "Then full time: infrastructure, security engineering, IR.", future: true },
];
export function CareerPath() {
    const ref = useRef<HTMLOListElement>(null);
    const [p, setP] = useState(still() ? 1 : 0);
    useEffect(() => {
        if (still()) return;
        const on = () => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setP(Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height))); };
        on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
    }, []);
    return <section className="career" aria-label="Timeline">
        <p className="label">The path so far</p>
        <ol ref={ref} style={{ ["--p" as string]: p }}>
            {path.map((x, i) => <li key={x.t} className={(i / (path.length - 1) <= p + 0.02 ? "lit " : "") + (x.future ? "future" : "")}>
                <span className="cp-d">{x.d}</span><span className="cp-t">{x.t}</span><span className="cp-s">{x.s}</span>
            </li>)}
        </ol>
    </section>;
}

/* ── /contact: a beacon sending CQ in Morse, decoded underneath ── */
const MORSE: Record<string, string> = { C: "-.-.", Q: "--.-", D: "-..", E: ".", K: "-.-", "2": "..---", S: "...", W: ".--", " ": " " };
export function MorseBeacon({ call, email }: { call: string; email: string }) {
    const msg = "CQ CQ DE " + call + " K";
    const [i, setI] = useState(0);
    const [lit, setLit] = useState(false);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (still()) { setI(msg.length); return; }
        let stop = false; const unit = 70;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        (async () => {
            while (!stop) {
                for (let c = 0; c < msg.length && !stop; c++) {
                    setI(c);
                    const code = MORSE[msg[c]] || "";
                    if (msg[c] === " ") { await wait(unit * 4); continue; }
                    for (const s of code) { if (stop) return; setLit(true); await wait(s === "." ? unit : unit * 3); setLit(false); await wait(unit); }
                    await wait(unit * 2);
                }
                setI(msg.length); await wait(2500);
            }
        })();
        return () => { stop = true; };
    }, [msg]);
    const copy = () => { navigator.clipboard?.writeText(email).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); };
    return <div className="sc beacon">
        <div className="sc-head"><span className="sc-dot" />beacon · {call}<span className="sc-meta">morse, 17 wpm</span></div>
        <div className="bc-body">
            <div className={"bc-lamp" + (lit ? " on" : "")} aria-hidden="true"><i /><i /><i /></div>
            <div className="bc-text">
                <p className="bc-decoded" aria-label={msg}>{msg.split("").map((ch, k) => <span key={k} className={k < i ? "done" : k === i ? "cur" : ""}>{ch === " " ? " " : ch}</span>)}</p>
                <p className="bc-code" aria-hidden="true">{(MORSE[msg[Math.min(i, msg.length - 1)]] || "").split("").map(s => s === "." ? "•" : "—").join(" ")}</p>
            </div>
            <button className="button bc-copy" onClick={copy}>{copied ? "Copied ✓" : "Copy email"}</button>
        </div>
    </div>;
}

/* ── 404: a traceroute that runs out of road ── */
const hops404 = ["edge", "gateway", "ksw.dev", "nginx", "???", "* * *"];
export function Trace404({ path: p }: { path?: string }) {
    const [n, setN] = useState(0);
    const [here, setHere] = useState(p || "");
    useEffect(() => {
        setHere(location.pathname);
        if (still()) { setN(hops404.length); return; }
        const t = hops404.map((_, i) => setTimeout(() => setN(i + 1), 250 + i * 330));
        return () => t.forEach(clearTimeout);
    }, []);
    return <div className="term trace404" aria-hidden="true">
        <div className="term-bar"><span /><span /><span /><em>traceroute</em></div>
        <pre><span className="pr">$</span> traceroute ksw.dev{here}{"\n"}
            {hops404.slice(0, n).map((h, i) => <span key={h} className={i >= 4 ? "bad" : ""}>{String(i + 1).padStart(2, " ")}  {h.padEnd(12, " ")}{i < 4 ? (3 + i * 4) + " ms" : i === 4 ? "no route" : "request timed out"}{"\n"}</span>)}
            {n >= hops404.length && <span className="bad glitch-line">ROUTE NOT FOUND{"\n"}</span>}</pre>
    </div>;
}

"use client";
import { useEffect, useRef, useState } from "react";

/* The surveillance-OS layer. Inspired by the Watch Dogs "ctOS" ads, but my own:
   - Boot: a one-second handshake screen, once per visit.
   - Profiler: hover anything with data-profile and a scan card pops next to the cursor.
   Everything here turns off with reduced motion. */

const bootLines = [
    "ksw.OS 26.11 // secure boot",
    "handshake ........ ok",
    "locating visitor .. you, probably",
    "profile loaded ... K. WITTSTRUCK",
    "access granted",
];

export function Boot() {
    const [show, setShow] = useState(false);
    const [n, setN] = useState(0);
    useEffect(() => {
        try {
            if (sessionStorage.getItem("booted") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            sessionStorage.setItem("booted", "1");
        } catch { return; }
        setShow(true);
        const timers = bootLines.map((_, i) => setTimeout(() => setN(i + 1), 120 + i * 170));
        timers.push(setTimeout(() => setShow(false), 1500));
        return () => timers.forEach(clearTimeout);
    }, []);
    if (!show) return null;
    return <div className={"boot" + (n >= bootLines.length ? " out" : "")} onClick={() => setShow(false)} aria-hidden="true">
        <div className="boot-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" /><circle cx="50" cy="50" r="32" /><path d="M50 2v12M50 86v12M2 50h12M86 50h12" /></svg></div>
        <pre>{bootLines.slice(0, n).map(l => "> " + l).join("\n")}<span className="caret">▌</span></pre>
    </div>;
}

type Card = { x: number; y: number; title: string; rows: [string, string][]; id: number };

export function Profiler() {
    const [card, setCard] = useState<Card | null>(null);
    const seq = useRef(0);
    useEffect(() => {
        if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let current: Element | null = null;
        const over = (e: MouseEvent) => {
            const el = (e.target as Element).closest("[data-profile]");
            if (el === current) return;
            current = el;
            if (!el) { setCard(null); return; }
            const [title, ...rest] = (el.getAttribute("data-profile") || "").split("|");
            const rows = rest.map(r => { const i = r.indexOf(":"); return [r.slice(0, i), r.slice(i + 1)] as [string, string]; });
            setCard({ x: e.clientX, y: e.clientY, title, rows, id: ++seq.current });
        };
        const move = (e: MouseEvent) => { if (current) setCard(c => c && { ...c, x: e.clientX, y: e.clientY }); };
        document.addEventListener("mouseover", over);
        document.addEventListener("mousemove", move, { passive: true });
        return () => { document.removeEventListener("mouseover", over); document.removeEventListener("mousemove", move); };
    }, []);
    if (!card) return null;
    const flip = card.x > window.innerWidth - 320;
    return <div key={card.id} className={"profiler" + (flip ? " flip" : "")} style={{ left: card.x, top: card.y }} aria-hidden="true">
        <span className="pf-scan" />
        <p className="pf-title"><i />PROFILE · {card.title}</p>
        <dl>{card.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className={/low|online|running|done/i.test(v) ? "ok" : ""}>{v}</dd></div>)}</dl>
    </div>;
}

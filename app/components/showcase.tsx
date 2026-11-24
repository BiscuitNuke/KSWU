"use client";
import { useEffect, useRef, useState } from "react";

/* One signature piece per project page. All of them pause off screen and
   fall back to a still frame when the visitor asks for reduced motion. */

function useOnScreen<T extends HTMLElement>(threshold = 0.3) {
    const ref = useRef<T>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
        io.observe(el); return () => io.disconnect();
    }, [threshold]);
    return { ref, on };
}
const still = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Facts that count up (every project page) ── */
export function CountUp({ value }: { value: string }) {
    const m = value.match(/^(~?)(\d+)(.*)$/);
    const { ref, on } = useOnScreen<HTMLElement>(0.6);
    // Server HTML keeps the real number (search engines, no-JS). The facts row is hidden
    // until it scrolls in, so dropping to 0 on mount never shows.
    const [n, setN] = useState(m ? parseInt(m[2], 10) : null);
    useEffect(() => { if (m && !still()) setN(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!m || !on) return;
        const end = parseInt(m[2], 10);
        if (still() || end < 2) { setN(end); return; }
        let raf = 0; const t0 = performance.now();
        const step = (t: number) => { const p = Math.min(1, (t - t0) / 1200); setN(Math.round(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); };
        raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
    }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
    return <strong ref={ref}>{m ? m[1] + (n ?? 0) + m[3] : value}</strong>;
}

/* ── Flight Wall: the LED board, dot for dot ── */
const flights = [
    { top: "DAL1932", rt: "ATL>BOS", mid: "A321neo", bot: "FL350  482KT", c: "#3b82f6" },
    { top: "JBU677", rt: "JFK>ORD", mid: "E190", bot: "FL240  410KT", c: "#38bdf8" },
    { top: "UPS2941", rt: "SDF>YYZ", mid: "B767F", bot: "FL370  505KT", c: "#d97706" },
    { top: "N512KS", rt: "LOCAL", mid: "C172 RARE", bot: "4500FT 108KT", c: "#22c55e" },
    { top: "RCH471", rt: "MIL", mid: "C-17A", bot: "FL290  440KT", c: "#ef4444" },
];
export function LedBoard() {
    const { ref, on } = useOnScreen<HTMLDivElement>(0.2);
    const cv = useRef<HTMLCanvasElement>(null);
    const [k, setK] = useState(0);
    useEffect(() => {
        if (!on || still()) return;
        const t = setInterval(() => setK(v => (v + 1) % flights.length), 3200);
        return () => clearInterval(t);
    }, [on]);
    useEffect(() => {
        const c = cv.current; if (!c) return;
        const W = 128, H = 32, S = 6;
        const off = document.createElement("canvas"); off.width = W; off.height = H;
        const o = off.getContext("2d")!;
        const f = flights[k];
        o.fillStyle = "#000"; o.fillRect(0, 0, W, H);
        o.fillStyle = "#fff"; o.fillRect(1, 1, 3, 30);
        o.textBaseline = "top"; o.font = "bold 10px monospace";
        o.fillText(f.top, 7, 0); o.textAlign = "right"; o.fillText(f.rt, 126, 0); o.textAlign = "left";
        o.font = "bold 9px monospace"; o.fillText(f.mid, 7, 11); o.fillText(f.bot, 7, 22);
        // each band gets one color, so antialiasing can't leave half-lit dots
        const band = (x: number, y: number) => x < 5 ? f.c : y < 11 ? "#ffb347" : y < 21 ? "#ffffff" : "#f2850d";
        const px = o.getImageData(0, 0, W, H).data;
        c.width = W * S; c.height = H * S;
        const g = c.getContext("2d")!;
        g.fillStyle = "#050404"; g.fillRect(0, 0, c.width, c.height);
        let frame = 0, raf = 0;
        const draw = () => {
            // wipe in, column by column, like the board's own transition
            const cols = still() ? W : Math.min(W, frame * 6);
            for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
                const i = (y * W + x) * 4, lit = x < cols && px[i] > 140;
                g.fillStyle = lit ? band(x, y) : "#1a1412";
                g.beginPath(); g.arc(x * S + S / 2, y * S + S / 2, S * 0.36, 0, 6.283); g.fill();
            }
            frame++;
            if (cols < W) raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, [k]);
    return <div className="sc sc-led" ref={ref}>
        <div className="sc-head"><span className="sc-dot" />The board<span className="sc-meta">128 × 32 per panel · example flights</span></div>
        <div className="led-frame"><canvas ref={cv} aria-label={"LED board showing " + flights[k].top + ", " + flights[k].mid} role="img" /></div>
        <div className="led-legend">
            <span><i style={{ background: "#3b82f6" }} />airline color</span><span><i style={{ background: "#22c55e" }} />rare type</span><span><i style={{ background: "#ef4444" }} />military</span>
        </div>
    </div>;
}

/* ── HamBot: a Discord channel that plays itself ── */
type Msg = { who: "you" | "bot"; text?: string; card?: { title: string; lines: string[]; tone?: "warn" | "ok" } };
const chat: Msg[] = [
    { who: "bot", card: { title: "☀️ Morning digest", lines: ["Clear, 28°F → 41°F · no SPC risk", "House used 31 kWh yesterday", "2 chores due · 1 package out for delivery"] } },
    { who: "you", text: "/update raskal" },
    { who: "bot", card: { title: "🛠 Patching 6 VMs", lines: ["snapshot ✓  apt upgrade ✓  reboot ✓", "6/6 healthy · took 4m 12s"], tone: "ok" } },
    { who: "bot", card: { title: "🐈 Litter box", lines: ["Drawer is 90% full. Someone's turn: check /chores"], tone: "warn" } },
    { who: "bot", card: { title: "✈️ Rare aircraft overhead", lines: ["C-17A · 29,000 ft · heading east"], tone: "warn" } },
    { who: "you", text: "/chores done litter" },
    { who: "bot", text: "Logged. Streak: 5 days. 👍" },
];
export function DiscordDemo() {
    const { ref, on } = useOnScreen<HTMLDivElement>(0.3);
    const [n, setN] = useState(still() ? chat.length : 1);
    useEffect(() => {
        if (!on || still()) return;
        const t = setTimeout(() => setN(v => v >= chat.length ? 1 : v + 1), n >= chat.length ? 4000 : 1500);
        return () => clearTimeout(t);
    }, [on, n]);
    return <div className="sc sc-discord" ref={ref}>
        <div className="sc-head"><span className="sc-dot" /># house<span className="sc-meta">what the house sees · sample day</span></div>
        <div className="dc-log" aria-live="off">
            {chat.slice(0, n).map((m, i) => <div key={i} className={"dc-msg " + m.who}>
                <span className="dc-av">{m.who === "bot" ? "HB" : "K"}</span>
                <div>
                    <p className="dc-name">{m.who === "bot" ? "HamBot" : "kieran"}{m.who === "bot" && <em>BOT</em>}</p>
                    {m.text && <p className="dc-text">{m.text}</p>}
                    {m.card && <div className={"dc-card " + (m.card.tone || "")}><strong>{m.card.title}</strong>{m.card.lines.map(l => <span key={l}>{l}</span>)}</div>}
                </div>
            </div>)}
        </div>
    </div>;
}

/* ── WannaCry: the four phases as a debugger session ── */
const phases = [
    { k: "Strings", lines: ["$ strings -n 8 wannacry.exe | grep -i http", "http://www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com", "", "One very long, very fake-looking domain. Hold that thought."], hl: 1 },
    { k: "Imports", lines: ["InternetOpenA          WININET.dll", "InternetOpenUrlA       WININET.dll", "CreateServiceA         ADVAPI32.dll", "CryptAcquireContextA   ADVAPI32.dll"], hl: 1 },
    { k: "IDA", lines: ["call    ds:InternetOpenUrlA", "mov     edi, eax", "test    edi, edi", "jnz     short exit_quietly   ; domain answered → stop"], hl: 3 },
    { k: "x32dbg", lines: ["bp InternetOpenUrlA", "run → break, URL = the kill-switch domain", "set EAX = 1 (pretend it resolved)", "→ process exits. Nothing encrypted. Snapshot restored."], hl: 3 },
];
export function RevTerminal() {
    const { ref, on } = useOnScreen<HTMLDivElement>(0.3);
    const [k, setK] = useState(0);
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (!on || paused || still()) return;
        const t = setTimeout(() => setK(v => (v + 1) % phases.length), 4200);
        return () => clearTimeout(t);
    }, [on, k, paused]);
    const p = phases[k];
    return <div className="sc sc-rev" ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="sc-head"><span className="sc-dot red" />analysis VM · no network<span className="sc-meta">how the kill switch shows up</span></div>
        <div className="rev-tabs" role="tablist">{phases.map((x, i) => <button key={x.k} role="tab" aria-selected={i === k} className={i === k ? "on" : ""} onClick={() => setK(i)}><b>{i + 1}</b>{x.k}</button>)}</div>
        <pre className="rev-out" key={k}>{p.lines.map((l, i) => <span key={i} className={i === p.hl ? "hl" : ""} style={{ animationDelay: i * 0.18 + "s" }}>{l || " "}{"\n"}</span>)}</pre>
    </div>;
}

/* ── Raskal: one request, followed hop by hop ── */
const hops = [
    { k: "DNS", d: "The GitLab name resolves to my one public IP." },
    { k: "Edge", d: "Only HTTPS gets in. The router hands it to the gateway in the DMZ." },
    { k: "Caddy", d: "TLS ends here. HSTS and security headers go on. No session yet, so…" },
    { k: "Authentik", d: "…forward auth bounces me to sign in. YubiKey, nothing else." },
    { k: "OIDC", d: "Authentik signs a token. GitLab checks the signature and the redirect URI, exactly." },
    { k: "GitLab", d: "I'm in. GitLab only ever sees traffic from the gateway." },
];
export function RequestTrace() {
    const { ref, on } = useOnScreen<HTMLDivElement>(0.3);
    const [k, setK] = useState(0);
    useEffect(() => {
        if (!on || still()) return;
        const t = setTimeout(() => setK(v => (v + 1) % hops.length), k === hops.length - 1 ? 3200 : 1900);
        return () => clearTimeout(t);
    }, [on, k]);
    return <div className="sc sc-trace" ref={ref}>
        <div className="sc-head"><span className="sc-dot" />trace · opening GitLab from a coffee shop<span className="sc-meta">hop {k + 1}/{hops.length}</span></div>
        <ol className="tr-line" style={{ ["--p" as string]: k / (hops.length - 1) }}>
            {hops.map((h, i) => <li key={h.k} className={i < k ? "done" : i === k ? "on" : ""}><button onClick={() => setK(i)}><i />{h.k}</button></li>)}
        </ol>
        <p className="tr-detail" key={k}><b>{String(k + 1).padStart(2, "0")}</b>{hops[k].d}</p>
    </div>;
}

/* ── HamLab: the stack, bottom to top. Hover a layer. ── */
const layers = [
    { k: "Monitoring", d: "Prometheus, Loki, Grafana. Wazuh agents on every VM." },
    { k: "Identity", d: "Active Directory, two-tier PKI with an offline root, LDAPS, 802.1X." },
    { k: "Compute", d: "vSphere HA on Dell PowerEdge EPYC hosts. 512 GB RAM." },
    { k: "Storage", d: "TrueNAS on the HL15, iSCSI with MPIO. 100 TB raw." },
    { k: "Network", d: "Juniper EX4400 core, UniFi edge, household Wi-Fi kept apart." },
    { k: "Cable", d: "Every Ethernet run in the house, pulled and terminated by me." },
];
export function StackLayers() {
    const [k, setK] = useState(0);
    return <div className="sc sc-stack">
        <div className="sc-head"><span className="sc-dot" />N1 · what runs on what<span className="sc-meta">hover a layer</span></div>
        <div className="st-wrap">
            <ul className="st-layers">{layers.map((l, i) => <li key={l.k} className={i === k ? "on" : ""} onMouseEnter={() => setK(i)} onFocus={() => setK(i)} tabIndex={0} style={{ ["--i" as string]: i }}>{l.k}</li>)}</ul>
            <p className="st-detail" key={k}><b>{layers[k].k}</b>{layers[k].d}</p>
        </div>
    </div>;
}

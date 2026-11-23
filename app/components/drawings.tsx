import { InView } from "./reveal";

// Line drawings for each project. Same rules as the map:
// "draw" strokes trace on, "fade" bits show up after. --d is the delay.
const at = (s: number) => ({ ["--d" as string]: s + "s" });

function Box({ x, y, w, h, t, s, d, hot }: { x: number; y: number; w: number; h: number; t: string; s?: string; d: number; hot?: boolean }) {
    return <g style={at(d)} className={hot ? "hot" : ""}>
        <rect className="draw" x={x} y={y} width={w} height={h} rx="2" pathLength={1} />
        <text className="fade t" x={x + 12} y={y + (s ? h / 2 - 2 : h / 2 + 5)}>{t}</text>
        {s && <text className="fade s" x={x + 12} y={y + h / 2 + 15}>{s}</text>}
    </g>;
}

function Wire({ d, at: delay, hot }: { d: string; at: number; hot?: boolean }) {
    return <path className={"draw wire" + (hot ? " hot" : "")} d={d} pathLength={1} style={at(delay)} markerEnd="url(#arrow)" />;
}

function Arrowhead() {
    return <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
        </marker>
    </defs>;
}

function Frame({ children, label, view }: { children: React.ReactNode; label: string; view: string }) {
    return <InView className="drawing-wrap">
        <svg className="drawing" viewBox={view} role="img" aria-label={label}>
            <Arrowhead />
            {children}
        </svg>
    </InView>;
}

/* HamLab rack, traced from the build photo. Top to bottom, same order as real life. */
const U = 22;
const top = 60;
const y = (u: number) => top + u * U;

function hexes(cx0: number, cy: number) {
    const out = [];
    for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 11; i++) {
            const cx = cx0 + i * 19 + (row ? 9.5 : 0);
            const yy = cy + row * 15;
            const pts = [0, 60, 120, 180, 240, 300].map(a => {
                const r = (a * Math.PI) / 180;
                return (cx + 6.5 * Math.cos(r)).toFixed(1) + "," + (yy + 6.5 * Math.sin(r)).toFixed(1);
            }).join(" ");
            out.push(<polygon key={row + "-" + i} points={pts} />);
        }
    }
    return out;
}

function ports(x: number, yy: number, n: number, rows = 1) {
    const out = [];
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) out.push(<rect key={r + "-" + i} x={x + i * 9} y={yy + r * 8} width="6" height="5" />);
    return out;
}

const rackLabels = [
    { u: 1.5, text: "Spectrum modem" },
    { u: 3.5, text: "UDM Pro Max · the edge", hot: true },
    { u: 5, text: "Switch + patch panel" },
    { u: 10, text: "Small nodes shelf" },
    { u: 16, text: "4× Dell PowerEdge · vSphere HA", hot: true },
    { u: 25, text: "Room to grow" },
    { u: 34, text: "2× UPS" },
];

export function Rack() {
    const rails = [];
    for (let u = 0; u <= 37; u++) {
        rails.push(<circle key={"l" + u} cx="58" cy={y(u) + 4} r="1.6" />, <circle key={"r" + u} cx="322" cy={y(u) + 4} r="1.6" />);
    }
    return <InView className="drawing-wrap rack-wrap">
        <svg className="drawing rack" viewBox="0 0 640 940" role="img" aria-label="Line drawing of the HamLab rack: modem, UDM Pro Max, switch and patch panel, a shelf of small nodes, four Dell PowerEdge servers, open space, and two UPS units.">
            {/* cabinet */}
            <rect className="draw" x="30" y="20" width="320" height="900" rx="3" pathLength={1} style={at(0)} />
            <path className="draw" d="M30 50 H350 M30 890 H350" pathLength={1} style={at(0.2)} />
            <path className="draw" d="M48 50 V890 M332 50 V890" pathLength={1} style={at(0.3)} />
            <g className="fade dots" style={at(0.6)}>{rails}</g>

            {/* PDU strip */}
            <g style={at(0.4)}>
                <rect className="draw" x="70" y={y(0)} width="240" height={U - 4} pathLength={1} />
                <g className="fade small">{ports(82, y(0) + 6, 18)}</g>
                <circle className="fade led" cx="298" cy={y(0) + 9} r="3" />
            </g>
            {/* modem */}
            <g style={at(0.5)}>
                <rect className="draw" x="70" y={y(1)} width="240" height={2 * U - 4} pathLength={1} />
                <rect className="draw" x="150" y={y(1) + 12} width="90" height="16" pathLength={1} />
            </g>
            {/* UDM Pro Max */}
            <g style={at(0.6)} className="hot">
                <rect className="draw" x="70" y={y(3)} width="240" height={U - 4} pathLength={1} />
                <g className="fade small">{ports(210, y(3) + 5, 8)}</g>
                <rect className="fade" x="84" y={y(3) + 5} width="70" height="8" />
            </g>
            {/* switch + patch panel */}
            <g style={at(0.7)}>
                <rect className="draw" x="70" y={y(4)} width="240" height={U - 4} pathLength={1} />
                <g className="fade small">{ports(96, y(4) + 2, 22, 2)}</g>
                <rect className="draw" x="70" y={y(5)} width="240" height={U - 4} pathLength={1} />
                <g className="fade small">{ports(84, y(5) + 6, 24)}</g>
            </g>
            {/* blanks */}
            <g style={at(0.8)}>
                <rect className="draw" x="70" y={y(6)} width="240" height={U - 4} pathLength={1} />
                <path className="draw" d={"M90 " + (y(6) + 9) + " H290"} pathLength={1} />
                <rect className="draw" x="70" y={y(7)} width="240" height={U - 4} pathLength={1} />
            </g>
            {/* small nodes shelf */}
            <g style={at(0.9)}>
                <rect className="draw" x="70" y={y(8)} width="240" height={4 * U - 4} pathLength={1} />
                <rect className="draw" x="140" y={y(8) + 6} width="100" height="30" pathLength={1} />
                <circle className="fade led" cx="154" cy={y(8) + 21} r="2.5" />
                {[0, 1].map(r => [0, 1].map(c => <rect key={r + "" + c} className="draw" x={84 + c * 112} y={y(10) + 2 + r * 20} width="100" height="15" pathLength={1} />))}
            </g>
            {/* 4x PowerEdge */}
            {[0, 1, 2, 3].map(i => <g key={i} style={at(1.1 + i * 0.15)} className="server">
                <rect className="draw" x="70" y={y(12 + i * 2)} width="240" height={2 * U - 3} pathLength={1} />
                <g className="fade hex">{hexes(90, y(12 + i * 2) + 13)}</g>
                <circle className="fade led" cx="300" cy={y(12 + i * 2) + 10} r="2" />
            </g>)}
            {/* open space */}
            <path className="draw faint" d={"M100 " + y(22) + " C140 " + y(25) + " 220 " + y(23) + " 260 " + y(27)} pathLength={1} style={at(1.8)} />
            {/* blank + UPS */}
            <g style={at(1.9)}>
                <rect className="draw" x="70" y={y(30)} width="240" height={2 * U - 4} pathLength={1} />
            </g>
            {[0, 1].map(i => <g key={i} style={at(2 + i * 0.15)}>
                <rect className="draw" x="70" y={y(32 + i * 2)} width="240" height={2 * U - 4} pathLength={1} />
                <path className="fade" d={Array.from({ length: 12 }, (_, k) => "M" + (84 + k * 10) + " " + (y(32 + i * 2) + 8) + " v24").join(" ")} />
                <rect className="draw" x="240" y={y(32 + i * 2) + 9} width="40" height="22" pathLength={1} />
            </g>)}
            {/* bottom PDU */}
            <g style={at(2.3)}>
                <rect className="draw" x="70" y={y(36)} width="240" height={U - 4} pathLength={1} />
                <g className="fade small">{ports(120, y(36) + 6, 12)}</g>
                <circle className="fade led" cx="298" cy={y(36) + 9} r="3" />
            </g>

            {/* labels */}
            {rackLabels.map((l, i) => <g key={l.text} style={at(2.4 + i * 0.1)} className={l.hot ? "hot" : ""}>
                <path className="draw leader" d={"M312 " + (y(l.u) + 2) + " H380"} pathLength={1} />
                <text className="fade lab" x="390" y={y(l.u) + 6}>{l.text}</text>
            </g>)}
        </svg>
    </InView>;
}

/* Raskal: what happens when you hit a private app */
export function AuthFlow() {
    const lanes = [{ x: 30, t: "Browser" }, { x: 250, t: "Caddy" }, { x: 470, t: "Authentik" }, { x: 690, t: "App" }];
    const mid = (i: number) => lanes[i].x + 90;
    const msgs = [
        { from: 0, to: 1, y: 110, t: "GET the app" },
        { from: 1, to: 2, y: 155, t: "forward auth: who is this?" },
        { from: 2, to: 1, y: 200, t: "no session" },
        { from: 1, to: 0, y: 245, t: "go log in" },
        { from: 0, to: 2, y: 290, t: "password + MFA" },
        { from: 0, to: 1, y: 335, t: "GET again, with a session" },
        { from: 1, to: 2, y: 370, t: "check" },
        { from: 1, to: 3, y: 405, t: "allowed. proxy it", hot: true },
    ];
    return <Frame label="Sequence diagram: a browser asks Caddy for an app, Caddy asks Authentik, the user logs in with MFA, and then Caddy proxies the request to the app." view="0 0 900 440">
        {lanes.map((l, i) => <g key={l.t}>
            <Box x={l.x} y={20} w={180} h={46} t={l.t} d={i * 0.1} hot={i === 2} />
            <path className="draw faint" d={"M" + mid(i) + " 66 V425"} pathLength={1} style={at(0.4)} />
        </g>)}
        {msgs.map((m, i) => <g key={m.t}>
            <Wire d={"M" + (mid(m.from) + (m.to > m.from ? 6 : -6)) + " " + m.y + " H" + (mid(m.to) + (m.to > m.from ? -6 : 6))} at={0.7 + i * 0.22} hot={m.hot} />
            <text className={"fade s" + (m.hot ? " hot-text" : "")} style={at(0.8 + i * 0.22)} x={Math.min(mid(m.from), mid(m.to)) + 14} y={m.y - 8}>{m.t}</text>
        </g>)}
    </Frame>;
}

/* HamBot: push to running in one pipeline */
export function BotPipeline() {
    const steps = [
        { t: "git push", s: "bots/** changed" },
        { t: "GitHub Actions", s: "builds only that bot" },
        { t: "GHCR", s: "private image" },
        { t: "Pin the tag", s: "compose.yaml commit" },
        { t: "Dockhand sync", s: "every 15 min" },
        { t: "Swap one container", s: "the rest keep running", hot: true },
    ];
    const pos = (i: number) => i < 3 ? { x: 30 + i * 290, y: 30 } : { x: 30 + (5 - i) * 290, y: 150 };
    const cmds = ["/update", "/ops status", "/litter status", "/flights now", "/price add", "/digest"];
    return <Frame label="HamBot deploy pipeline: git push, GitHub Actions builds the changed bot, the image goes to GHCR, the tag is pinned in compose.yaml, Dockhand syncs, and only that container is swapped." view="0 0 900 340">
        {steps.map((st, i) => { const p = pos(i); return <Box key={st.t} x={p.x} y={p.y} w={230} h={64} t={st.t} s={st.s} d={i * 0.25} hot={st.hot} />; })}
        <Wire d="M260 62 H320" at={0.2} />
        <Wire d="M550 62 H610" at={0.45} />
        <Wire d="M725 94 V150" at={0.7} />
        <Wire d="M610 182 H550" at={0.95} />
        <Wire d="M320 182 H260" at={1.2} hot />
        <text className="fade lab" x="30" y="265" style={at(1.5)}>Some of the commands</text>
        {cmds.map((c, i) => <g key={c} style={at(1.6 + i * 0.08)}>
            <rect className="draw" x={30 + i * 143} y="280" width="130" height="34" rx="17" pathLength={1} />
            <text className="fade s" x={45 + i * 143} y="302">{c}</text>
        </g>)}
    </Frame>;
}

/* Flight Wall: from the window to the wall */
export function SignalChain() {
    const chain = [
        { t: "1090 filter", s: "SAW" },
        { t: "SDR", s: "USB" },
        { t: "readsb", s: "decodes ADS-B" },
        { t: "live_board.py", s: "picks a plane", hot: true },
    ];
    return <Frame label="Flight Wall signal chain: a window antenna feeds a 1090 MHz filter, a USB SDR, readsb, and the Python board program, which draws on two 128 by 64 LED panels. The Pi pulls new code from GitHub every minute." view="0 0 900 420">
        {/* antenna */}
        <path className="draw hot" d="M50 120 V30 M36 46 H64 M40 62 H60 M44 78 H56" pathLength={1} style={at(0)} />
        <path className="draw faint" d="M74 40 q14 20 0 40 M86 30 q22 30 0 60" pathLength={1} style={at(0.2)} />
        <text className="fade s" x="22" y="145" style={at(0.3)}>window</text>
        {chain.map((c, i) => <Box key={c.t} x={120 + i * 190} y={70} w={160} h={60} t={c.t} s={c.s} d={0.3 + i * 0.2} hot={c.hot} />)}
        <Wire d="M64 100 H120" at={0.25} />
        {[0, 1, 2].map(i => <Wire key={i} d={"M" + (280 + i * 190) + " 100 H" + (310 + i * 190)} at={0.45 + i * 0.2} />)}
        <Wire d="M770 130 V180 H600 V200" at={1.1} hot />
        {/* the panels */}
        <g style={at(1.3)}>
            <rect className="draw hot" x="290" y="200" width="590" height="155" rx="3" pathLength={1} />
            <path className="draw faint" d="M585 205 V350" pathLength={1} />
            <g className="fade led-text">
                <text x="320" y="245">DAL2214</text>
                <text x="320" y="285" className="dim">B739 · DTW → BOS</text>
                <text x="320" y="325" className="dim">34,000 ft · 12 nm NE</text>
                <text x="615" y="245">↗</text>
                <text x="615" y="285" className="dim">OVERHEAD IN 2 MIN</text>
            </g>
        </g>
        <text className="fade lab" x="290" y="385" style={at(1.6)}>2 × 128×64 panels · hardware PWM · off 22:00–07:00</text>
        {/* self deploy */}
        <g style={at(1.7)}>
            <Box x={30} y={230} w={200} h={56} t="GitHub main" s="push = deploy" d={1.7} />
            <Wire d="M130 286 V330 H260" at={1.9} />
            <text className="fade s" x="30" y="350" style={at(2)}>pulls every minute</text>
            <text className="fade s" x="30" y="368" style={at(2)}>bad compile → rolls back</text>
        </g>
    </Frame>;
}

/* RoamArc: roads you've actually driven */
export function PhoneRoads() {
    const grey = [
        "M100 120 H300", "M100 190 H300", "M100 260 H300", "M100 330 H300",
        "M140 80 V400", "M210 80 V400", "M270 80 V400", "M100 380 L300 150",
    ];
    const notes = [
        { y: 120, t: "A road only counts once you move along it" },
        { y: 190, t: "Passing an intersection doesn't" },
        { y: 260, t: "Towns, states, and badges fill in as you go" },
        { y: 330, t: "Private zones hide where you live" },
    ];
    return <Frame label="Phone drawing of RoamArc: a grid of roads, with the driven route traced in orange, and notes on how road credit works." view="0 0 900 470">
        <rect className="draw" x="80" y="20" width="240" height="430" rx="30" pathLength={1} style={at(0)} />
        <path className="draw" d="M170 38 H230" pathLength={1} style={at(0.2)} />
        {grey.map((g, i) => <path key={g} className="draw faint" d={g} pathLength={1} style={at(0.3 + i * 0.05)} />)}
        <path className="draw hot thick" d="M140 400 V260 H210 V190 H270 V120 H300" pathLength={1} style={at(0.9)} />
        {[[140, 260], [210, 190], [270, 120]].map(([cx, cy], i) => <circle key={i} className="fade town" cx={cx} cy={cy} r="5" style={at(1.6 + i * 0.15)} />)}
        <g style={at(2)}>
            <rect className="draw" x="100" y="395" width="200" height="40" rx="8" pathLength={1} />
            <text className="fade s" x="114" y="420">+4 roads · +1 town</text>
        </g>
        {notes.map((n, i) => <g key={n.t} style={at(1.2 + i * 0.2)}>
            <path className="draw leader" d={"M320 " + n.y + " H400"} pathLength={1} />
            <text className="fade t" x="415" y={n.y + 6}>{n.t}</text>
        </g>)}
    </Frame>;
}

/* WannaCry: how I worked it, and the famous kill switch */
export function KillSwitch() {
    const phases = ["Basic static", "Basic dynamic", "Advanced static · IDA", "Advanced dynamic · x32dbg"];
    return <Frame label="Four analysis phases, and a flowchart of WannaCry's kill switch: if the hardcoded domain answers, it exits; if not, it encrypts and spreads over SMB." view="0 0 900 400">
        <text className="fade lab" x="30" y="30" style={at(0)}>How I worked it</text>
        {phases.map((p, i) => <g key={p}>
            <Box x={30} y={50 + i * 82} w={260} h={54} t={p} d={i * 0.2} />
            {i < 3 && <Wire d={"M160 " + (104 + i * 82) + " V" + (132 + i * 82)} at={0.15 + i * 0.2} />}
        </g>)}
        <text className="fade lab" x="400" y="30" style={at(0.8)}>The famous part</text>
        <Box x={400} y={50} w={200} h={50} t="Start" d={0.9} />
        <Wire d="M500 100 V140" at={1.05} />
        <g style={at(1.1)}>
            <polygon className="draw hot" points="500,140 640,200 500,260 360,200" pathLength={1} />
            <text className="fade t" x="430" y="196">Kill-switch domain</text>
            <text className="fade t" x="458" y="216">answers?</text>
        </g>
        <Wire d="M640 200 H700" at={1.4} />
        <text className="fade s" x="650" y="190" style={at(1.5)}>yes</text>
        <Box x={700} y={175} w={180} h={50} t="Exit quietly" d={1.5} />
        <Wire d="M500 260 V300" at={1.4} hot />
        <text className="fade s" x="510" y="285" style={at(1.5)}>no</text>
        <Box x={360} y={300} w={520} h={64} t="Encrypt files · drop the ransom note" s="scan SMB 445 and spread with EternalBlue" d={1.6} hot />
    </Frame>;
}

const drawings: Record<string, () => React.ReactElement> = {
    raskal: AuthFlow,
    hamlab: Rack,
    hambot: BotPipeline,
    "flight-wall": SignalChain,
    roamarc: PhoneRoads,
    wannacry: KillSwitch,
};

export function ProjectDrawing({ slug }: { slug: string }) {
    const Drawing = drawings[slug];
    return Drawing ? <Drawing /> : null;
}

/* Small icons for "Off the clock" */
export function Icon({ name }: { name: string }) {
    const paths: Record<string, string> = {
        Photos: "M6 18 H14 L18 12 H30 L34 18 H42 V40 H6 Z M16 29 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M36 22 h2",
        Subarus: "M4 34 V27 L10 26 L16 18 H30 L36 26 H44 V34 H39 M31 34 H17 M9 34 H4 M9 34 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M31 34 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M18 19 V26 M30 19 V26",
        Radio: "M24 44 V12 M16 18 H32 M18 24 H30 M20 30 H28 M14 44 L24 12 L34 44 M38 10 q6 6 0 12 M10 10 q-6 6 0 12",
        FPV: "M15 15 L33 33 M33 15 L15 33 M4 10 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M32 10 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M4 38 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M32 38 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M20 20 H28 V28 H20 Z",
    };
    return <InView className="icon-wrap">
        <svg className="drawing icon" viewBox="0 0 48 48" aria-hidden="true">
            <path className="draw hot" d={paths[name] || ""} pathLength={1} style={at(0)} />
        </svg>
    </InView>;
}

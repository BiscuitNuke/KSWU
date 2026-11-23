import { Animated } from "./animate";

// Line drawings for the site. animate.tsx explains the markup.
// --d is when a piece starts drawing, in seconds.
const at = (s: number) => ({ ["--d" as string]: s + "s" });
const ring = (cx: number, cy: number, r: number) => "M" + (cx - r) + " " + cy + " a" + r + " " + r + " 0 1 0 " + 2 * r + " 0 a" + r + " " + r + " 0 1 0 " + -2 * r + " 0";

function Box({ x, y, w, h, t, s, d, hot }: { x: number; y: number; w: number; h: number; t: string; s?: string; d: number; hot?: boolean }) {
    return <g style={at(d)} className={hot ? "hot" : ""}>
        <rect className="draw" x={x} y={y} width={w} height={h} rx="2" pathLength={1} />
        <path className="draw corner" d={"M" + x + " " + (y + 8) + " V" + y + " H" + (x + 8)} pathLength={1} />
        <text className="fade t" x={x + 12} y={y + (s ? h / 2 - 2 : h / 2 + 5)}>{t}</text>
        {s && <text className="fade s" x={x + 12} y={y + h / 2 + 15}>{s}</text>}
    </g>;
}

function Wire({ d, at: delay, hot, flow, dur, step }: { d: string; at: number; hot?: boolean; flow?: number; dur?: number; step?: boolean }) {
    return <path className={"draw wire" + (hot ? " hot" : "") + (step ? " step" : "")} d={d} pathLength={1} style={at(delay)}
        markerEnd="url(#arrow)" data-flow={flow} data-dur={dur} />;
}

function Defs() {
    return <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
        </marker>
        <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2850d" stopOpacity="0.45" />
            <stop offset="1" stopColor="#f2850d" stopOpacity="0.08" />
        </linearGradient>
    </defs>;
}

function Frame({ children, label, view, className = "" }: { children: React.ReactNode; label: string; view: string; className?: string }) {
    return <Animated className="drawing-wrap">
        <svg className={"drawing " + className} viewBox={view} role="img" aria-label={label}>
            <Defs />
            {children}
        </svg>
    </Animated>;
}

// A fan: frame ring, hub, and five swept blades. Spins once it's drawn.
function Fan({ cx, cy, r, speed = 1.6 }: { cx: number; cy: number; r: number; speed?: number }) {
    const blades = [0, 72, 144, 216, 288].map(a => {
        const rad = (a * Math.PI) / 180, rad2 = ((a + 50) * Math.PI) / 180;
        const x1 = cx + r * 0.25 * Math.cos(rad), y1 = cy + r * 0.25 * Math.sin(rad);
        const x2 = cx + r * 0.85 * Math.cos(rad2), y2 = cy + r * 0.85 * Math.sin(rad2);
        return "M" + x1.toFixed(1) + " " + y1.toFixed(1) + " Q" + (cx + r * 0.75 * Math.cos(rad)).toFixed(1) + " " + (cy + r * 0.75 * Math.sin(rad)).toFixed(1) + " " + x2.toFixed(1) + " " + y2.toFixed(1);
    }).join(" ");
    return <g>
        <path className="draw" d={ring(cx, cy, r)} pathLength={1} />
        <g data-spin={speed}>
            <path className="fade blades" d={blades + " " + ring(cx, cy, r * 0.22)} />
        </g>
    </g>;
}

/* ───────────── HamLab rack, traced from the photo ───────────── */
const U = 22;
const top = 60;
const y = (u: number) => top + u * U;
const RACK_U = 35;

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

function ports(x: number, yy: number, n: number, rows = 1, gap = 9) {
    const out = [];
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) out.push(<rect key={r + "-" + i} x={x + i * gap} y={yy + r * 8} width={gap - 3} height="5" />);
    return out;
}

// One rack unit block. Hovering it lights it and its label.
function Unit({ k, u, h, d, hot, children }: { k: string; u: number; h: number; d: number; hot?: boolean; children?: React.ReactNode }) {
    return <g className={"unit" + (hot ? " hot" : "")} style={at(d)} data-unit={k}>
        <rect className="hit" x="70" y={y(u)} width="240" height={h * U - 4} />
        <rect className="draw" x="70" y={y(u)} width="240" height={h * U - 4} pathLength={1} />
        {children}
    </g>;
}

const rackLabels = [
    { k: "modem", u: 1.5, text: "Spectrum modem" },
    { k: "udm", u: 3.4, text: "UDM Pro Max · the edge", hot: true },
    { k: "unifi", u: 5.4, text: "UniFi switch" },
    { k: "patch", u: 6.9, text: "Cat6 + Cat6A patch" },
    { k: "core", u: 8.4, text: "Juniper EX4400 · core", hot: true },
    { k: "nodes", u: 11, text: "Small nodes" },
    { k: "dell", u: 16.5, text: "4× PowerEdge · vSphere HA", hot: true },
    { k: "hl15", u: 22.5, text: "HL15 BEAST · TrueNAS", hot: true },
    { k: "ups", u: 31.5, text: "2× CyberPower UPS" },
];

export function Rack() {
    const rails = [];
    for (let u = 0; u <= RACK_U; u++) {
        rails.push(<circle key={"l" + u} cx="58" cy={y(u) + 4} r="1.6" />, <circle key={"r" + u} cx="322" cy={y(u) + 4} r="1.6" />);
    }
    const bottom = y(RACK_U) + 10;
    return <Animated className="drawing-wrap rack-wrap">
        <svg className="drawing rack" viewBox={"-30 -10 700 " + (bottom + 70)} role="img" aria-label="Line drawing of the HamLab rack, top to bottom: PDU, Spectrum modem, UDM Pro Max, UniFi switch, two patch panels, Juniper EX4400 core switch, two shelves of small nodes, four Dell PowerEdge servers, a 45HomeLab HL15 storage server, two CyberPower UPS units, and a PDU.">
            <Defs />
            {/* dimensions, like a real drawing */}
            <g style={at(0.1)}>
                <path className="draw dim" d="M30 2 H350 M30 -4 V8 M350 -4 V8" pathLength={1} />
                <text className="fade s" x="176" y="-1">19&quot;</text>
                <path className="draw dim" d={"M6 " + y(0) + " V" + y(RACK_U) + " M0 " + y(0) + " H12 M0 " + y(RACK_U) + " H12"} pathLength={1} />
                <text className="fade s" x="-14" y={y(17.5)} transform={"rotate(-90 -8 " + y(17.5) + ")"}>35U</text>
            </g>
            {/* cabinet */}
            <rect className="draw" x="30" y="20" width="320" height={bottom + 10} rx="3" pathLength={1} style={at(0)} />
            <path className="draw" d={"M30 50 H350 M30 " + bottom + " H350"} pathLength={1} style={at(0.2)} />
            <path className="draw" d={"M48 50 V" + bottom + " M332 50 V" + bottom} pathLength={1} style={at(0.3)} />
            <g className="fade dots" style={at(0.6)}>{rails}</g>

            <Unit k="pdu" u={0} h={1} d={0.4}><circle className="fade led" data-blink cx="298" cy={y(0) + 9} r="3" /></Unit>
            <Unit k="modem" u={1} h={2} d={0.5}>
                <rect className="draw" x="150" y={y(1) + 10} width="96" height="18" pathLength={1} />
            </Unit>
            <Unit k="udm" u={3} h={1} d={0.6} hot>
                <rect className="fade" x="84" y={y(3) + 5} width="70" height="8" />
                <g className="fade small">{ports(214, y(3) + 3, 4, 2)}</g>
            </Unit>
            <Unit k="cable" u={4} h={1} d={0.7} />
            <Unit k="unifi" u={5} h={1} d={0.7}><g className="fade small">{ports(96, y(5) + 2, 22, 2)}</g></Unit>
            <Unit k="patch" u={6} h={1} d={0.75}><g className="fade small">{ports(84, y(6) + 6, 24)}</g></Unit>
            <Unit k="patch" u={7} h={1} d={0.8}><g className="fade small">{ports(84, y(7) + 6, 24)}</g></Unit>
            <Unit k="core" u={8} h={1} d={0.85} hot><g className="fade small">{ports(80, y(8) + 2, 24, 2, 8.4)}</g></Unit>
            <Unit k="nodes" u={9} h={2} d={0.95}>
                <rect className="draw" x="140" y={y(9) + 8} width="100" height="22" pathLength={1} />
                <circle className="fade led" data-blink cx="190" cy={y(9) + 19} r="2.5" />
            </Unit>
            <Unit k="nodes" u={11} h={2} d={1}>
                <path className="draw" d={"M90 " + (y(13) - 10) + " H290 M200 " + (y(13) - 10) + " l40 -10 h20"} pathLength={1} />
            </Unit>
            {[0, 1, 2, 3].map(i => <Unit key={i} k="dell" u={13 + i * 2} h={2} d={1.1 + i * 0.15}>
                <g className="fade hex">{hexes(90, y(13 + i * 2) + 13)}</g>
                <circle className="fade led" data-blink cx="300" cy={y(13 + i * 2) + 10} r="2" />
                <circle className="fade led green" data-blink cx="300" cy={y(13 + i * 2) + 22} r="1.6" />
            </Unit>)}
            <Unit k="hl15" u={21} h={4} d={1.8} hot>
                {[0, 1, 2].map(i => <Fan key={i} cx={112 + i * 78} cy={y(21) + 38} r={30} speed={0.9 + i * 0.15} />)}
                <path className="draw" d={"M78 " + (y(25) - 12) + " H302"} pathLength={1} />
            </Unit>
            <path className="draw faint" d={"M90 " + (y(26) + 4) + " c30 30 60 -10 90 20 s60 -20 110 10"} pathLength={1} style={at(2)} />
            <Unit k="blank" u={28} h={2} d={2} />
            {[0, 1].map(i => <Unit key={i} k="ups" u={30 + i * 2} h={2} d={2.1 + i * 0.15}>
                <path className="fade" d={Array.from({ length: 12 }, (_, k) => "M" + (84 + k * 10) + " " + (y(30 + i * 2) + 8) + " v24").join(" ")} />
                <rect className="draw" x="240" y={y(30 + i * 2) + 9} width="40" height="22" pathLength={1} />
                <path className="fade ups-bar" d={"M246 " + (y(30 + i * 2) + 24) + " h28"} />
            </Unit>)}
            <Unit k="pdu" u={34} h={1} d={2.4}>
                <g className="fade small">{ports(120, y(34) + 6, 12)}</g>
                <circle className="fade led" data-blink cx="298" cy={y(34) + 9} r="3" />
            </Unit>

            {/* cabling, same runs as the photo */}
            <g className="cables" style={at(2.25)}>
                {/* blue loop: UDM down to the UniFi switch */}
                <path className="draw cable blue" d={"M236 " + (y(3) + 12) + " C210 " + (y(3) + 46) + " 40 " + (y(3) + 10) + " 112 " + (y(5) + 4)} pathLength={1} />
                <path className="stream" d={"M236 " + (y(3) + 12) + " C210 " + (y(3) + 46) + " 40 " + (y(3) + 10) + " 112 " + (y(5) + 4)} data-stream="34" />
                {/* white shorts: UniFi into the Cat6 panel */}
                {[0, 1, 2, 3, 4, 5].map(i => { const x = 100 + i * 9; return <path key={"w" + i} className="draw cable" d={"M" + x + " " + (y(5) + 14) + " c-7 6 -7 12 " + (-3 + i * 0.4) + " " + (y(6) - y(5) - 6)} pathLength={1} />; })}
                {/* white shorts: Cat6A panel into the Juniper */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const x = 176 + i * 11; return <path key={"j" + i} className="draw cable" d={"M" + x + " " + (y(7) + 11) + " c6 8 4 14 " + (2 - i * 0.3) + " " + (y(8) - y(7) - 7)} pathLength={1} />; })}
                {/* the orange run off the Juniper */}
                <path className="draw cable hot" d={"M150 " + (y(8) + 10) + " C118 " + (y(8) - 22) + " 160 " + (y(6) + 2) + " 200 " + (y(7) + 8)} pathLength={1} />
                <path className="stream" d={"M150 " + (y(8) + 10) + " C118 " + (y(8) - 22) + " 160 " + (y(6) + 2) + " 200 " + (y(7) + 8)} data-stream="34" />
                {/* uplinks: core trunk taps into every host */}
                {[0, 1, 2, 3].map(i => <path key={"t" + i} className="draw cable dac" d={"M318 " + (y(13 + i * 2) + 18) + " H302"} pathLength={1} />)}
                <path className="draw cable dac" d={"M318 " + (y(21) + 30) + " H302"} pathLength={1} />
                {/* power: UPS to PDU, and a riser up the left rail */}
                {[0, 1].map(i => <path key={"p" + i} className="draw cable power" d={"M74 " + (y(30 + i * 2) + 20) + " C60 " + (y(30 + i * 2) + 30) + " 60 " + (y(34) + 2) + " 84 " + (y(34) + 9)} pathLength={1} />)}
                <path className="draw cable power" d={"M64 " + (y(34) + 9) + " V" + (y(0) + 9)} pathLength={1} data-flow="2" data-dur="5" />
            </g>

            {/* live links: edge to core, core down to the hosts */}
            <path className="draw link hot" d={"M318 " + (y(3) + 9) + " V" + (y(8) + 9)} pathLength={1} style={at(2.4)} data-flow="2" data-dur="1.4" />
            <path className="draw link" d={"M318 " + (y(8) + 9) + " V" + (y(21) + 30)} pathLength={1} style={at(2.5)} data-flow="3" data-dur="2.2" />

            {rackLabels.map((l, i) => <g key={l.k} style={at(2.5 + i * 0.08)} className={"rack-label" + (l.hot ? " hot" : "")} data-unit-label={l.k}>
                <path className="draw leader" d={"M326 " + (y(l.u) + 2) + " H372"} pathLength={1} />
                <circle className="fade tick" cx="372" cy={y(l.u) + 2} r="2.5" />
                <text className="fade lab big" x="384" y={y(l.u) + 7}>{l.text}</text>
            </g>)}
        </svg>
    </Animated>;
}

/* ───────────── N2: the box Raskal runs on ───────────── */
export function NodeN2() {
    const fibers = ["M486 356 c0 60 -40 80 -60 110", "M498 356 c0 60 -20 80 -30 110", "M546 356 c0 50 40 70 30 110", "M558 356 c0 50 50 70 50 110"];
    const labels = [
        { y: 150, t: "N2 · MS-01 · ESXi", s: "every Raskal VM lives here", hot: true, from: "M592 190 L640 150" },
        { y: 290, t: "8-port switch · 2× SFP+", s: "under the node", from: "M622 320 L640 290" },
        { y: 430, t: "10G fiber", s: "back to the core in the rack", hot: true, from: "M600 440 L640 430" },
    ];
    return <Frame label="Line drawing of N2: a Minisforum MS-01 running ESXi, sitting on a small switch with two fiber uplinks, under a monitor." view="0 0 900 520">
        <path className="draw" d="M20 40 H880 M20 52 H880" pathLength={1} style={at(0)} />
        <path className="draw faint" d="M20 470 H880" pathLength={1} style={at(0.1)} />
        <rect className="draw" x="250" y="70" width="190" height="56" rx="26" pathLength={1} style={at(0.3)} />
        <g style={at(0.5)} className="hot">
            <rect className="draw" x="150" y="130" width="440" height="140" rx="4" pathLength={1} />
            <path className="fade vents" d={Array.from({ length: 14 }, (_, k) => "M" + (340 + k * 16) + " 150 l-34 100").join(" ")} />
            <rect className="draw" x="110" y="150" width="140" height="110" pathLength={1} />
            <text className="fade n2" x="128" y="228">N 2</text>
            <circle className="fade led green" data-blink cx="560" cy="200" r="3" />
            <path className="fade" d="M290 250 h20 M318 250 h20" />
        </g>
        <g style={at(0.8)}>
            <rect className="draw" x="120" y="270" width="500" height="120" rx="6" pathLength={1} />
            <g className="fade small">{Array.from({ length: 8 }, (_, i) => <rect key={i} x={160 + i * 36} y="330" width="28" height="22" />)}</g>
            {[0, 1].map(i => <g key={i}>
                <rect className="draw" x={470 + i * 60} y="330" width="44" height="26" pathLength={1} />
                <circle className="fade led" data-blink cx={492 + i * 60} cy="318" r="2.5" />
            </g>)}
        </g>
        <path className="draw" d="M290 352 c0 60 -60 80 -120 110 M326 352 c0 70 40 90 120 100 M218 352 c-20 60 -120 60 -190 90" pathLength={1} style={at(1.1)} />
        {fibers.map((f, i) => <g key={f}>
            <path className="draw hot" d={f} pathLength={1} style={at(1.3 + i * 0.05)} />
            <path className="stream" d={f} data-stream="30" />
        </g>)}
        {labels.map((l, i) => <g key={l.t} style={at(1.5 + i * 0.15)} className={l.hot ? "hot" : ""}>
            <path className="draw leader" d={l.from} pathLength={1} />
            <circle className="fade tick" cx="640" cy={l.y} r="2.5" />
            <text className="fade t" x="652" y={l.y + 5}>{l.t}</text>
            <text className="fade s" x="652" y={l.y + 25}>{l.s}</text>
        </g>)}
    </Frame>;
}

/* ───────────── Desk PC: two systems, one hardline loop ───────────── */
export function Desktop() {
    const tubes = [
        "M270 112 V82 H480 V120",
        "M310 145 H360 V66 H570 V120",
        "M480 480 V520 H300 V300 H262",
        "M570 480 V532 H220 V470",
    ];
    return <Frame label="Line drawing of a dual-system PC case: two reservoirs and pumps, hardline water-cooling tubes, a radiator, a GPU block, RAM, and a second small system at the bottom." view="0 0 900 600">
        <rect className="draw" x="30" y="20" width="600" height="540" rx="6" pathLength={1} style={at(0)} />
        <rect className="draw faint" x="44" y="34" width="572" height="512" rx="3" pathLength={1} style={at(0.15)} />
        <g style={at(0.3)}>
            <rect className="draw" x="70" y="40" width="520" height="22" pathLength={1} />
            <path className="fade" d={Array.from({ length: 50 }, (_, k) => "M" + (76 + k * 10.3) + " 43 v16").join(" ")} />
        </g>
        <g style={at(0.45)}>
            <rect className="draw" x="90" y="84" width="340" height="300" pathLength={1} />
            {[0, 1, 2, 3].map(i => <rect key={i} className="draw ram" x={380 + i * 12} y="92" width="7" height="88" pathLength={1} data-blink />)}
            <rect className="draw hot" x="230" y="112" width="80" height="66" rx="6" pathLength={1} />
            <path className="fade" d={ring(270, 145, 14)} />
            <rect className="draw" x="110" y="208" width="300" height="76" rx="4" pathLength={1} />
            <path className="fade" d="M126 226 H394 M126 238 H394 M126 250 H394 M126 262 H394" />
            <rect className="draw hot" x="240" y="214" width="60" height="18" rx="3" pathLength={1} />
            <path className="fade" d="M110 300 H200 M110 314 H170 M220 300 H410" />
        </g>
        <g style={at(0.7)}>
            <rect className="draw" x="70" y="420" width="200" height="120" pathLength={1} />
            <rect className="draw" x="90" y="440" width="90" height="70" pathLength={1} />
            <Fan cx={135} cy={475} r={22} speed={1.1} />
            <path className="fade" d="M196 444 v60 M206 444 v60 M216 444 v60" />
        </g>
        {[0, 1].map(i => { const x = 450 + i * 90; return <g key={i} style={at(0.9 + i * 0.15)} className="hot">
            <rect className="liquid" x={x + 3} y="146" width="54" height="244" data-fill />
            <rect className="draw" x={x} y="120" width="60" height="290" rx="8" pathLength={1} />
            <path className="draw" d={"M" + x + " 140 H" + (x + 60) + " M" + x + " 390 H" + (x + 60)} pathLength={1} />
            <rect className="draw" x={x - 6} y="420" width="72" height="60" rx="6" pathLength={1} />
            <g data-spin="0.7"><path className="fade blades" d={ring(x + 30, 450, 14) + " M" + (x + 30) + " 436 V464 M" + (x + 16) + " 450 H" + (x + 44)} /></g>
            <ellipse className="fade glow" cx={x + 30} cy="420" rx="34" ry="6" />
        </g>; })}
        {tubes.map((t, i) => <g key={t}>
            <path className="draw tube" d={t} pathLength={1} style={at(1.3 + i * 0.1)} />
            <path className="stream coolant" d={t} data-stream="40" />
        </g>)}
        <g style={at(1.8)}>
            <rect className="draw" x="330" y="315" width="40" height="56" rx="3" pathLength={1} transform="rotate(-12 350 343)" />
            <text className="fade s" x="338" y="350" transform="rotate(-12 350 343)">8♣</text>
        </g>
        {[
            { y: 150, t: "PC 1", s: "main board + GPU" },
            { y: 260, t: "2 reservoirs", s: "two pumps, one loop", hot: true },
            { y: 380, t: "Hardline", s: "rigid tube, hard bends", hot: true },
            { y: 480, t: "PC 2", s: "second system, same case" },
        ].map((l, i) => <g key={l.t} style={at(1.9 + i * 0.12)} className={l.hot ? "hot" : ""}>
            <path className="draw leader" d={"M630 " + l.y + " H660"} pathLength={1} />
            <circle className="fade tick" cx="660" cy={l.y} r="2.5" />
            <text className="fade t" x="672" y={l.y + 4}>{l.t}</text>
            <text className="fade s" x="672" y={l.y + 24}>{l.s}</text>
        </g>)}
    </Frame>;
}

/* ───────────── Raskal: opening a private app ───────────── */
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
        <g data-seq>
            {msgs.map((m, i) => <g key={m.t}>
                <Wire d={"M" + (mid(m.from) + (m.to > m.from ? 6 : -6)) + " " + m.y + " H" + (mid(m.to) + (m.to > m.from ? -6 : 6))} at={0.7 + i * 0.22} hot={m.hot} step />
                <text className={"fade s" + (m.hot ? " hot-text" : "")} style={at(0.8 + i * 0.22)} x={Math.min(mid(m.from), mid(m.to)) + 14} y={m.y - 8}>{m.t}</text>
            </g>)}
        </g>
    </Frame>;
}

/* ───────────── HamBot: push to running ───────────── */
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
        <g data-seq>
            <Wire d="M260 62 H320" at={0.2} step />
            <Wire d="M550 62 H610" at={0.45} step />
            <Wire d="M725 94 V150" at={0.7} step />
            <Wire d="M610 182 H550" at={0.95} step />
            <Wire d="M320 182 H260" at={1.2} hot step />
        </g>
        <text className="fade lab" x="30" y="265" style={at(1.5)}>Some of the commands</text>
        {cmds.map((c, i) => <g key={c} style={at(1.6 + i * 0.08)}>
            <rect className="draw" x={30 + i * 143} y="280" width="130" height="34" rx="17" pathLength={1} />
            <text className="fade s" x={45 + i * 143} y="302">{c}</text>
        </g>)}
    </Frame>;
}

/* ───────────── Flight Wall: window to wall ───────────── */
// Example frames, the same layout the real board draws.
const planes = [
    ["DAL2214", "B739 · DTW → BOS", "34,000 ft · 12 nm NE", "OVERHEAD IN 2 MIN"],
    ["UPS2981", "B763 · SDF → ROC", "6,200 ft · 4 nm W", "ON APPROACH"],
    ["JBU1105", "A320 · JFK → ROC", "11,500 ft · 9 nm SE", "DESCENDING"],
];

export function SignalChain() {
    const chain = [
        { t: "1090 filter", s: "SAW" },
        { t: "SDR", s: "USB" },
        { t: "readsb", s: "decodes ADS-B" },
        { t: "live_board.py", s: "picks a plane", hot: true },
    ];
    return <Frame label="Flight Wall signal chain: a window antenna feeds a 1090 MHz filter, a USB SDR, readsb, and the Python board program, which draws on two 128 by 64 LED panels. The Pi pulls new code from GitHub every minute." view="0 0 900 420">
        <path className="draw hot" d="M50 120 V30 M36 46 H64 M40 62 H60 M44 78 H56" pathLength={1} style={at(0)} />
        {[0, 1, 2].map(i => <path key={i} className="wave" d={"M" + (72 + i * 12) + " " + (52 - i * 10) + " q" + (14 + i * 8) + " " + (28 + i * 10) + " 0 " + (56 + i * 20)} data-pulse="0% 50%" />)}
        <text className="fade s" x="22" y="145" style={at(0.3)}>window</text>
        {chain.map((c, i) => <Box key={c.t} x={120 + i * 190} y={70} w={160} h={60} t={c.t} s={c.s} d={0.3 + i * 0.2} hot={c.hot} />)}
        <Wire d="M64 100 H120" at={0.25} flow={2} dur={0.9} />
        {[0, 1, 2].map(i => <Wire key={i} d={"M" + (280 + i * 190) + " 100 H" + (310 + i * 190)} at={0.45 + i * 0.2} flow={1} dur={0.7} />)}
        <Wire d="M770 130 V180 H600 V200" at={1.1} hot flow={1} dur={1.2} />
        <g style={at(1.3)}>
            <rect className="draw hot" x="290" y="200" width="590" height="155" rx="3" pathLength={1} />
            <path className="draw faint" d="M585 205 V350" pathLength={1} />
            <g className="fade led-text" data-cycle>
                {planes.map(p => <g key={p[0]} data-frame>
                    <text x="320" y="245">{p[0]}</text>
                    <text x="320" y="285" className="dim">{p[1]}</text>
                    <text x="320" y="325" className="dim">{p[2]}</text>
                    <text x="615" y="245">↗</text>
                    <text x="615" y="285" className="dim">{p[3]}</text>
                </g>)}
            </g>
        </g>
        <text className="fade lab" x="290" y="385" style={at(1.6)}>2 × 128×64 panels · hardware PWM · off 22:00–07:00</text>
        <Box x={30} y={230} w={200} h={56} t="GitHub main" s="push = deploy" d={1.7} />
        <Wire d="M130 286 V330 H260" at={1.9} flow={1} dur={1.6} />
        <text className="fade s" x="30" y="350" style={at(2)}>pulls every minute</text>
        <text className="fade s" x="30" y="368" style={at(2)}>bad compile → rolls back</text>
    </Frame>;
}

/* ───────────── RoamArc: roads you've actually driven ───────────── */
export function PhoneRoads() {
    const grey = ["M100 120 H300", "M100 190 H300", "M100 260 H300", "M100 330 H300", "M140 80 V400", "M210 80 V400", "M270 80 V400", "M100 380 L300 150"];
    const notes = [
        { y: 120, t: "A road only counts once you move along it" },
        { y: 190, t: "Passing an intersection doesn't" },
        { y: 260, t: "Towns, states, and badges fill in as you go" },
        { y: 330, t: "Private zones hide where you live" },
    ];
    const towns = [[140, 260], [210, 190], [270, 120]];
    return <Frame label="Phone drawing of RoamArc: a grid of roads, with the driven route traced in orange, and notes on how road credit works." view="0 0 900 470">
        <rect className="draw" x="80" y="20" width="240" height="430" rx="30" pathLength={1} style={at(0)} />
        <path className="draw" d="M170 38 H230" pathLength={1} style={at(0.2)} />
        {grey.map((g, i) => <path key={g} className="draw faint" d={g} pathLength={1} style={at(0.3 + i * 0.05)} />)}
        <path className="draw hot thick" d="M140 400 V260 H210 V190 H270 V120 H300" pathLength={1} style={at(0.9)} data-flow="1" data-dur="5" />
        {towns.map(([cx, cy], i) => <g key={i}>
            <circle className="fade town" cx={cx} cy={cy} r="5" style={at(1.6 + i * 0.15)} />
            <circle className="town-ring" cx={cx} cy={cy} r="14" data-pulse="50% 50%" />
        </g>)}
        <g style={at(2)}>
            <rect className="draw" x="100" y="395" width="200" height="40" rx="8" pathLength={1} />
            <text className="fade s" x="114" y="420">+4 roads · +1 town</text>
        </g>
        {notes.map((n, i) => <g key={n.t} style={at(1.2 + i * 0.2)}>
            <path className="draw leader" d={"M320 " + n.y + " H400"} pathLength={1} />
            <circle className="fade tick" cx="400" cy={n.y} r="2.5" />
            <text className="fade t" x="415" y={n.y + 6}>{n.t}</text>
        </g>)}
    </Frame>;
}

/* ───────────── WannaCry: how I worked it, and the kill switch ───────────── */
export function KillSwitch() {
    const phases = ["Basic static", "Basic dynamic", "Advanced static · IDA", "Advanced dynamic · x32dbg"];
    return <Frame label="Four analysis phases, and a flowchart of WannaCry's kill switch: if the hardcoded domain answers, it exits; if not, it encrypts and spreads over SMB." view="0 0 900 400">
        <text className="fade lab" x="30" y="30" style={at(0)}>How I worked it</text>
        {phases.map((p, i) => <Box key={p} x={30} y={50 + i * 82} w={260} h={54} t={p} d={i * 0.2} />)}
        <g data-seq>
            {[0, 1, 2].map(i => <Wire key={i} d={"M160 " + (104 + i * 82) + " V" + (132 + i * 82)} at={0.15 + i * 0.2} step />)}
        </g>
        <text className="fade lab" x="400" y="30" style={at(0.8)}>The famous part</text>
        <Box x={400} y={50} w={200} h={50} t="Start" d={0.9} />
        <g style={at(1.1)}>
            <polygon className="draw hot" points="500,140 640,200 500,260 360,200" pathLength={1} />
            <text className="fade t" x="430" y="196">Kill-switch domain</text>
            <text className="fade t" x="458" y="216">answers?</text>
        </g>
        <text className="fade s" x="650" y="190" style={at(1.5)}>yes</text>
        <Box x={700} y={175} w={180} h={50} t="Exit quietly" d={1.5} />
        <text className="fade s" x="510" y="285" style={at(1.5)}>no</text>
        <Box x={360} y={300} w={520} h={64} t="Encrypt files · drop the ransom note" s="scan SMB 445 and spread with EternalBlue" d={1.6} hot />
        <Wire d="M640 200 H700" at={1.4} />
        <g data-seq>
            <Wire d="M500 100 V140" at={1.05} step />
            <Wire d="M500 260 V300" at={1.4} hot step />
        </g>
    </Frame>;
}

// Every drawing sits in a figure with a blueprint-style caption.
export function Fig({ n, title, meta, children, className = "" }: { n: string; title: string; meta?: string; children: React.ReactNode; className?: string }) {
    return <figure className={"fig " + className}>
        <figcaption><span className="fig-n">FIG. {n}</span><span>{title}</span>{meta && <span className="fig-meta">{meta}</span>}</figcaption>
        {children}
    </figure>;
}

type D = { C: () => React.ReactElement; title: string; meta: string };
const drawings: Record<string, D[]> = {
    raskal: [
        { C: NodeN2, title: "N2, the box Raskal runs on", meta: "MS-01 · ESXi · 10G" },
        { C: AuthFlow, title: "Opening a private app", meta: "Caddy forward auth" },
    ],
    hamlab: [{ C: Rack, title: "The HamLab rack", meta: "traced from a photo · hover a unit" }],
    hambot: [{ C: BotPipeline, title: "Push to running", meta: "≤ 15 min" }],
    "flight-wall": [{ C: SignalChain, title: "Window to wall", meta: "1090 MHz" }],
    roamarc: [{ C: PhoneRoads, title: "How road credit works", meta: "SwiftUI" }],
    wannacry: [{ C: KillSwitch, title: "Phases and the kill switch", meta: "CSEC 202" }],
};

export function ProjectDrawing({ slug }: { slug: string }) {
    return <>{(drawings[slug] || []).map((d, i) => <Fig key={d.title} n={String(i + 1).padStart(2, "0")} title={d.title} meta={d.meta} className={d.C === Rack ? "fig-rack" : ""}><d.C /></Fig>)}</>;
}

/* ───────────── Icons for "Off the clock" ───────────── */
const icons: Record<string, string[]> = {
    Photos: ["M8 22 H20 L24 15 H40 L44 22 H56 V50 H8 Z", "M8 28 H15 V50", ring(34, 36, 11), ring(34, 36, 5.5), "M27 15 V12 H37 V15", "M48 27 h4"],
    Subarus: ["M5 43 V37 L13 35 L22 26 H41 L49 34 L59 36 V43", "M52 43 H59 M40 43 H24 M5 43 H11", ring(17.5, 43, 6), ring(46, 43, 6), "M43 33 h6 l1.5 -2", "M55 35 V29 H61", "M25 27 V34 M38 27 V34"],
    Radio: ["M22 24 H40 V58 H22 Z", "M27 24 V5", "M26 29 H36 V37 H26 Z", "M26 42 h2 M31 42 h2 M36 42 h0.5 M26 47 h2 M31 47 h2 M36 47 h0.5 M26 52 h2 M31 52 h2 M36 52 h0.5", "M45 14 q6 6 0 12", "M50 9 q11 11 0 22"],
    FPV: ["M17 17 L47 47 M47 17 L17 47", ring(14, 14, 10), ring(50, 14, 10), ring(14, 50, 10), ring(50, 50, 10), "M25 25 H39 V39 H25 Z", "M29 25 V20 H35 V25"],
};

export function Icon({ name }: { name: string }) {
    return <Animated className="icon-wrap">
        <svg className="drawing icon" viewBox="0 0 64 64" aria-hidden="true">
            {(icons[name] || []).map((d, i) => <path key={i} className={"draw" + (i === 0 ? " hot" : "")} d={d} pathLength={1} style={at(i * 0.18)} />)}
        </svg>
    </Animated>;
}

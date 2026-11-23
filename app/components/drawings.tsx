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

/* ───────────── Simple hardware drawings ─────────────
   Clean front views, not traces. Proportions come from the real specs. */

// A label: dot on the part, straight leader out to the side, title + subtitle.
type Callout = { tx: number; ty: number; x: number; y?: number; elbow?: number; t: string; s?: string; hot?: boolean };
function Callouts({ items, d }: { items: Callout[]; d: number }) {
    return <>{items.map((c, i) => {
        const left = c.x < c.tx, ly = c.y ?? c.ty;
        // Straight across if it can be. Otherwise out to the elbow, down or up, then across.
        const path = ly === c.ty ? "M" + c.tx + " " + c.ty + " H" + c.x
            : c.elbow ? "M" + c.tx + " " + c.ty + " H" + c.elbow + " V" + ly + " H" + c.x
            : "M" + c.tx + " " + c.ty + " V" + ly + " H" + c.x;
        return <g key={c.t} style={at(d + i * 0.08)} className={c.hot ? "hot" : ""}>
            <circle className="fade tick" cx={c.tx} cy={c.ty} r="3.5" />
            <path className="draw leader" d={path} pathLength={1} />
            <text className="fade t" x={left ? c.x - 10 : c.x + 10} y={ly + (c.s ? 0 : 6)} textAnchor={left ? "end" : "start"}>{c.t}</text>
            {c.s && <text className="fade s" x={left ? c.x - 10 : c.x + 10} y={ly + 22} textAnchor={left ? "end" : "start"}>{c.s}</text>}
        </g>;
    })}</>;
}

function hex(cx: number, cy: number, r: number) {
    return [30, 90, 150, 210, 270, 330].map(a => {
        const t = (a * Math.PI) / 180;
        return (cx + r * Math.cos(t)).toFixed(1) + "," + (cy + r * Math.sin(t)).toFixed(1);
    }).join(" ");
}

function portRow(x: number, yy: number, n: number, step: number, w: number, h: number) {
    return Array.from({ length: n }, (_, i) => <rect key={x + "-" + yy + "-" + i} x={x + i * step} y={yy} width={w} height={h} />);
}

/* ───────────── HamLab rack: 48U, front view ───────────── */
const RU = 18;
const RTOP = 110;
const ru = (n: number) => RTOP + (n - 1) * RU;   // top edge of rack unit n (1-48)
const RX = 345, RW = 310;                          // equipment face

function Unit({ k, n, size, d, hot, children }: { k: string; n: number; size: number; d: number; hot?: boolean; children?: React.ReactNode }) {
    return <g className={"unit" + (hot ? " hot" : "")} style={at(d)} data-unit={k}>
        <rect className="hit" x={RX} y={ru(n)} width={RW} height={size * RU - 2} />
        <rect className="draw" x={RX} y={ru(n)} width={RW} height={size * RU - 2} rx="2" pathLength={1} />
        {children}
    </g>;
}

function Dell({ n, d }: { n: number; d: number }) {
    const y0 = ru(n), mid = y0 + RU - 1;
    return <Unit k="dell" n={n} size={2} d={d} hot>
        <g className="fade hex">{Array.from({ length: 9 }, (_, i) => <polygon key={i} points={hex(386 + i * 27, mid, 12)} />)}</g>
        <path className="fade" d={"M" + (RX + 10) + " " + (y0 + 5) + " v24 M" + (RX + RW - 10) + " " + (y0 + 5) + " v24"} />
        <circle className="fade led green" data-blink cx={RX + RW - 22} cy={y0 + 10} r="2.2" />
    </Unit>;
}

function Ups({ n, d }: { n: number; d: number }) {
    const y0 = ru(n);
    return <Unit k="ups" n={n} size={2} d={d}>
        <path className="fade" d={Array.from({ length: 16 }, (_, i) => "M" + (RX + 18 + i * 12) + " " + (y0 + 8) + " v18").join(" ")} />
        <rect className="draw" x={RX + 226} y={y0 + 7} width="40" height="20" pathLength={1} />
        <circle className="fade led blue" data-blink cx={RX + 286} cy={y0 + 12} r="2.5" />
    </Unit>;
}

export function Rack() {
    const holes = [];
    for (let n = 1; n <= 48; n++) holes.push(<circle key={"l" + n} cx="333" cy={ru(n) + RU / 2} r="1.6" />, <circle key={"r" + n} cx="667" cy={ru(n) + RU / 2} r="1.6" />);
    const c = (n: number, size: number) => ru(n) + (size * RU) / 2 - 1;
    return <Frame label="Front view of the HamLab rack, 48U: PDU, modem, UDM Pro Max, UniFi switch, patch panels, Juniper EX4400, a mini PC shelf, an empty shelf, four Dell PowerEdge servers, an HL15 BEAST storage server, open space, a blank panel, two UPS units, and a PDU." view="0 0 1000 1080" className="simple rack">
        {/* cabinet */}
        <g style={at(0)}>
            <rect className="draw" x="300" y="52" width="400" height="22" rx="6" pathLength={1} />
            <rect className="draw" x="300" y="74" width="400" height="940" pathLength={1} />
            <path className="draw" d={"M325 " + (RTOP - 10) + " V" + (ru(49) + 8) + " M675 " + (RTOP - 10) + " V" + (ru(49) + 8)} pathLength={1} />
            <rect className="draw" x="306" y="1014" width="388" height="26" rx="3" pathLength={1} />
        </g>
        <g className="fade dots" style={at(0.4)}>{holes}</g>
        <text className="fade lab" x="500" y="40" textAnchor="middle" style={at(0.2)}>48U · 19 in</text>

        <Unit k="pdu" n={1} size={1} d={0.3}>
            <g className="fade small">{portRow(RX + 90, ru(1) + 4, 6, 22, 12, 9)}</g>
            <circle className="fade led red" data-blink cx={RX + RW - 18} cy={ru(1) + 8} r="3" />
        </Unit>
        <Unit k="modem" n={2} size={2} d={0.4}>
            <rect className="draw" x={RX + 100} y={ru(2) + 9} width="110" height="16" rx="2" pathLength={1} />
        </Unit>
        <Unit k="udm" n={4} size={1} d={0.5} hot>
            <rect className="fade" x={RX + 10} y={ru(4) + 4} width="9" height="9" />
            <rect className="draw" x={RX + 30} y={ru(4) + 4} width="130" height="9" pathLength={1} />
            <g className="fade small">{portRow(RX + 220, ru(4) + 3, 8, 10, 7, 5)}</g>
        </Unit>
        <Unit k="cable" n={5} size={1} d={0.55}>
            <path className="draw" d={"M" + (RX + 30) + " " + (ru(5) + 8) + " H" + (RX + RW - 30)} pathLength={1} />
        </Unit>
        <Unit k="unifi" n={6} size={1} d={0.6}>
            <rect className="fade" x={RX + 10} y={ru(6) + 4} width="9" height="9" />
            <g className="fade small">{portRow(RX + 40, ru(6) + 2, 24, 10.5, 8, 5)}{portRow(RX + 40, ru(6) + 9, 24, 10.5, 8, 5)}</g>
        </Unit>
        <Unit k="patch" n={7} size={1} d={0.65}><g className="fade small">{portRow(RX + 22, ru(7) + 5, 24, 11, 8, 7)}</g></Unit>
        <Unit k="brush" n={8} size={1} d={0.68}>
            <path className="draw" d={"M" + (RX + 20) + " " + (ru(8) + 8) + " H" + (RX + RW - 20)} pathLength={1} />
        </Unit>
        <Unit k="patch" n={9} size={1} d={0.7}><g className="fade small">{portRow(RX + 22, ru(9) + 5, 24, 11, 8, 7)}</g></Unit>
        <Unit k="core" n={10} size={1} d={0.75} hot>
            <g className="fade small">{portRow(RX + 14, ru(10) + 2, 24, 10.5, 8, 5)}{portRow(RX + 14, ru(10) + 9, 24, 10.5, 8, 5)}</g>
            <rect className="draw" x={RX + 272} y={ru(10) + 3} width="28" height="11" pathLength={1} />
        </Unit>
        <Unit k="mini" n={11} size={2} d={0.8}>
            <rect className="draw" x={RX + 110} y={ru(11) + 8} width="90" height="18" rx="2" pathLength={1} />
            <circle className="fade led blue" data-blink cx={RX + 122} cy={ru(11) + 17} r="2" />
        </Unit>
        {/* the empty shelf: just the tray */}
        <g style={at(0.85)}><path className="draw" d={"M" + RX + " " + (ru(15) - 5) + " H" + (RX + RW)} pathLength={1} /></g>
        {[15, 17, 19, 21].map((n, i) => <Dell key={n} n={n} d={0.95 + i * 0.1} />)}
        {/* HL15 BEAST: 5U, three fans behind guards (they don't move) */}
        <Unit k="hl15" n={24} size={5} d={1.4} hot>
            {[RX + 70, RX + 155, RX + 240].map(cx => <g key={cx} className="fade guard">
                <circle cx={cx} cy={c(24, 5) - 6} r="34" />
                <circle cx={cx} cy={c(24, 5) - 6} r="23" />
                <circle cx={cx} cy={c(24, 5) - 6} r="11" />
            </g>)}
            <path className="draw" d={"M" + (RX + 12) + " " + (ru(29) - 14) + " H" + (RX + RW - 12)} pathLength={1} />
        </Unit>
        <text className="fade lab dim-text" x="500" y={c(30, 9) + 4} textAnchor="middle" style={at(1.6)}>room to grow</text>
        <Unit k="blank" n={39} size={4} d={1.7} />
        <Ups n={43} d={1.8} />
        <Ups n={45} d={1.9} />
        <Unit k="pdu" n={47} size={1} d={2}>
            <g className="fade small">{portRow(RX + 90, ru(47) + 4, 6, 22, 12, 9)}</g>
            <circle className="fade led red" data-blink cx={RX + RW - 18} cy={ru(47) + 8} r="3" />
        </Unit>

        <Callouts d={2.1} items={[
            { tx: 675, ty: c(2, 2), x: 760, t: "Spectrum modem" },
            { tx: 675, ty: c(4, 1), x: 760, y: c(4, 1) + 18, elbow: 735, t: "UDM Pro Max", s: "the edge", hot: true },
            { tx: 675, ty: c(6, 1), x: 760, y: c(6, 1) + 42, elbow: 720, t: "UniFi switch" },
            { tx: 675, ty: c(8, 1), x: 760, y: c(8, 1) + 60, elbow: 705, t: "Patch panels", s: "Cat6 + Cat6A" },
            { tx: 675, ty: c(10, 1), x: 760, y: c(10, 1) + 92, elbow: 690, t: "Juniper EX4400", s: "the core", hot: true },
            { tx: 325, ty: c(11, 2), x: 240, t: "Mini PC" },
            { tx: 325, ty: c(17, 8), x: 240, t: "4× PowerEdge", s: "vSphere HA", hot: true },
            { tx: 325, ty: c(24, 5), x: 240, t: "HL15 BEAST", s: "5U · TrueNAS", hot: true },
            { tx: 325, ty: c(43, 4), x: 240, t: "2× UPS", s: "CyberPower" },
            { tx: 675, ty: c(47, 1), x: 760, t: "PDU" },
        ]} />
    </Frame>;
}

/* ───────────── N2: GL.iNet Comet KVM on an MS-01 on a switch ─────────────
   3 px per mm. MS-01 front is 189 × 48 mm, the Comet is 80 × 17.5 mm. */
export function NodeN2() {
    return <Frame label="Front view of N2: a GL.iNet Comet KVM sitting on a Minisforum MS-01, which sits on an 8-port switch with two SFP+ ports and fiber uplinks." view="0 0 1000 560" className="simple">
        <path className="draw faint" d="M120 520 H880" pathLength={1} style={at(0)} />
        {/* GL.iNet Comet */}
        <g style={at(0.2)}>
            <rect className="draw" x="380" y="96" width="240" height="52" rx="10" pathLength={1} />
            <rect className="draw" x="412" y="114" width="44" height="16" rx="2" pathLength={1} />
            <rect className="draw" x="472" y="116" width="30" height="12" rx="6" pathLength={1} />
            <rect className="draw" x="518" y="114" width="34" height="16" rx="1" pathLength={1} />
            <circle className="fade led" data-blink cx="594" cy="122" r="3.5" />
        </g>
        {/* MS-01: twill grille, power, audio, USB */}
        <g style={at(0.4)} className="hot">
            <rect className="draw" x="216" y="150" width="568" height="144" rx="6" pathLength={1} />
            <path className="fade vents" d={Array.from({ length: 22 }, (_, k) => "M" + (452 + k * 14) + " 280 L" + (480 + k * 14) + " 164").join(" ")} />
            <rect className="draw" x="236" y="166" width="120" height="86" pathLength={1} />
            <text className="fade n2" x="296" y="226" textAnchor="middle">N2</text>
            <circle className="draw" cx="390" cy="190" r="10" pathLength={1} />
            <circle className="draw" cx="390" cy="222" r="5" pathLength={1} />
            {[0, 1, 2].map(i => <rect key={i} className="draw" x={240 + i * 48} y="264" width="36" height="14" rx="1" pathLength={1} />)}
            <circle className="fade led green" data-blink cx="760" cy="170" r="3" />
        </g>
        {/* switch */}
        <g style={at(0.6)}>
            <rect className="draw" x="200" y="300" width="600" height="104" rx="10" pathLength={1} />
            <g className="fade small big">{portRow(240, 344, 8, 46, 36, 30)}</g>
            {[630, 702].map(x => <rect key={x} className="draw" x={x} y="344" width="54" height="30" pathLength={1} />)}
            {[657, 729].map(x => <circle key={x} className="fade led" data-blink cx={x} cy="330" r="3" />)}
        </g>
        {/* cables */}
        <path className="draw cable blue" d="M258 374 C258 430 230 470 200 512 M304 374 C304 440 330 480 380 512" pathLength={1} style={at(0.9)} />
        {["M650 374 C650 430 630 470 610 512", "M666 374 C666 430 652 470 640 512", "M722 374 C722 430 742 470 760 512", "M738 374 C738 430 764 470 790 512"].map((f, i) => <g key={f}>
            <path className="draw cable hot" d={f} pathLength={1} style={at(1 + i * 0.05)} />
            <path className="stream" d={f} data-stream="30" />
        </g>)}
        <Callouts d={1.3} items={[
            { tx: 620, ty: 122, x: 830, t: "GL.iNet Comet", s: "KVM over IP" },
            { tx: 216, ty: 222, x: 150, t: "N2 · MS-01", s: "ESXi host", hot: true },
            { tx: 200, ty: 352, x: 150, t: "8-port switch", s: "2× SFP+" },
            { tx: 800, ty: 359, x: 830, t: "10G fiber", s: "back to the core", hot: true },
        ]} />
    </Frame>;
}

/* ───────────── Desk PC: two systems, one hardline loop ───────────── */
export function Desktop() {
    const tubes = ["M430 180 H585 V120", "M670 120 V98 H395 V150", "M520 285 H545 V462 H560", "M382 486 H520 V500 H640 V480"];
    return <Frame label="Front view of the desk PC: one case with two systems, a top radiator, a CPU block, four RAM sticks, a GPU with a water block, two reservoirs with pumps, and a hardline loop." view="0 0 1000 640" className="simple">
        <defs>
            <linearGradient id="res" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f2850d" stopOpacity="0.5" />
                <stop offset="1" stopColor="#f2850d" stopOpacity="0.1" />
            </linearGradient>
        </defs>
        <rect className="draw" x="260" y="40" width="480" height="560" rx="8" pathLength={1} style={at(0)} />
        <g style={at(0.15)}>
            <rect className="draw" x="280" y="56" width="440" height="32" rx="3" pathLength={1} />
            {[360, 500, 640].map(cx => <g key={cx} className="fade guard"><circle cx={cx} cy="72" r="12" /><circle cx={cx} cy="72" r="5" /></g>)}
        </g>
        {/* PC 1 */}
        <g style={at(0.3)}>
            <rect className="draw" x="285" y="110" width="235" height="250" pathLength={1} />
            <rect className="draw hot" x="360" y="150" width="70" height="60" rx="8" pathLength={1} />
            {[0, 1, 2, 3].map(i => <rect key={i} className="draw ram" x={452 + i * 11} y="130" width="6" height="100" pathLength={1} data-blink />)}
            <rect className="draw" x="290" y="262" width="230" height="48" pathLength={1} />
            <rect className="draw hot" x="330" y="268" width="140" height="36" rx="4" pathLength={1} />
        </g>
        {/* PC 2 */}
        <g style={at(0.5)}>
            <rect className="draw" x="290" y="430" width="150" height="140" pathLength={1} />
            <rect className="draw hot" x="330" y="462" width="52" height="48" rx="6" pathLength={1} />
            <path className="fade" d="M300 540 H430 M300 552 H430" />
        </g>
        {/* reservoirs, pumps */}
        {[{ x: 560, w: 50 }, { x: 640, w: 60 }].map((r, i) => <g key={i} style={at(0.7 + i * 0.12)} className="hot">
            <rect className="liquid res" x={r.x + 3} y="138" width={r.w - 6} height="290" data-fill />
            <rect className="draw" x={r.x} y="120" width={r.w} height="310" rx="12" pathLength={1} />
            <rect className="draw" x={r.x - 6} y="440" width={r.w + 12} height="40" rx="6" pathLength={1} />
        </g>)}
        {tubes.map((t, i) => <g key={t}>
            <path className="draw tube" d={t} pathLength={1} style={at(1.1 + i * 0.08)} />
            <path className="stream coolant" d={t} data-stream="40" />
        </g>)}
        <g style={at(1.5)}>
            <rect className="draw" x="486" y="330" width="32" height="44" rx="3" pathLength={1} transform="rotate(-10 502 352)" />
            <text className="fade card" x="490" y="358" transform="rotate(-10 502 352)">8♣</text>
        </g>
        <Callouts d={1.6} items={[
            { tx: 285, ty: 180, x: 200, t: "PC 1", s: "main board" },
            { tx: 290, ty: 286, x: 200, t: "RTX GPU", s: "water block", hot: true },
            { tx: 290, ty: 500, x: 200, t: "PC 2", s: "same case" },
            { tx: 740, ty: 72, x: 800, t: "Radiator" },
            { tx: 700, ty: 275, x: 800, t: "2 reservoirs", s: "+ pumps", hot: true },
            { tx: 740, ty: 470, x: 800, t: "Hardline", s: "one loop", hot: true },
        ]} />
    </Frame>;
}

/* ───────────── Baja: front three-quarter, like my photo of it ─────────────
   Matte olive, black hood with the scoop, amber pods in the grille and the bumper,
   C3 roof platform, all-terrains on black wheels. */
function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
    return "M" + (cx - rx) + " " + cy + " a" + rx + " " + ry + " 0 1 0 " + 2 * rx + " 0 a" + rx + " " + ry + " 0 1 0 " + -2 * rx + " 0";
}

function BajaWheel({ cx, cy, rx, ry, rimX, rimRx, rimRy, d }: { cx: number; cy: number; rx: number; ry: number; rimX: number; rimRx: number; rimRy: number; d: number }) {
    const spokes = [0, 60, 120, 180, 240, 300].map(a => {
        const t = (a * Math.PI) / 180;
        return "M" + (rimX + 6 * Math.cos(t)).toFixed(1) + " " + (cy + 10 * Math.sin(t)).toFixed(1) + " L" + (rimX + rimRx * 0.9 * Math.cos(t)).toFixed(1) + " " + (cy + rimRy * 0.9 * Math.sin(t)).toFixed(1);
    }).join(" ");
    // tread blocks around the outer edge
    const tread = Array.from({ length: 22 }, (_, i) => {
        const t = (i / 22) * Math.PI * 2;
        const x1 = cx + rx * Math.cos(t), y1 = cy + ry * Math.sin(t);
        const x2 = cx + (rx - 7) * Math.cos(t), y2 = cy + (ry - 9) * Math.sin(t);
        return "M" + x1.toFixed(1) + " " + y1.toFixed(1) + " L" + x2.toFixed(1) + " " + y2.toFixed(1);
    }).join(" ");
    return <g style={at(d)}>
        <path className="draw ink" d={ellipsePath(cx, cy, rx, ry)} pathLength={1} />
        <path className="fade tread" d={tread} />
        <path className="draw" d={ellipsePath(rimX, cy, rimRx, rimRy)} pathLength={1} />
        <path className="fade spokes" d={spokes} />
        <path className="fade" d={ellipsePath(rimX, cy, rimRx * 0.25, rimRy * 0.25)} />
    </g>;
}

export function Baja() {
    return <Frame label="Front three-quarter drawing of my 2005 Subaru Baja Turbo: black hood with the scoop, mesh grille with amber pods, projector headlights, amber pods and fogs in the bumper, a C3 roof platform with amber pods, and all-terrain tires on black wheels." view="-300 250 1320 470" className="simple baja">
        {/* ground */}
        <path className="draw faint" d="M-20 668 L430 700 L760 612" pathLength={1} style={at(0)} />

        {/* C3 roof platform */}
        <g style={at(0.2)}>
            <path className="draw ink" d="M280 284 L540 280 L545 314 L282 318 Z" pathLength={1} />
            <path className="draw ink" d="M540 280 L688 300 L690 312 L545 314" pathLength={1} />
            <path className="draw" d="M560 284 L566 312 M590 288 L594 312 M620 292 L623 312 M650 296 L652 312" pathLength={1} />
            <path className="draw" d="M302 318 L306 330 M520 316 L516 326" pathLength={1} />
            <rect className="draw" x="630" y="318" width="52" height="58" rx="3" pathLength={1} />
            <path className="fade" d="M638 326 H674 M638 336 H674 M638 346 H674 M638 356 H674 M638 366 H674" />
            <text className="fade c3" x="400" y="306" textAnchor="middle">C3</text>
        </g>
        {[[300, 286], [316, 286], [484, 283], [500, 283]].map(([x, yy], i) => <rect key={i} className="pod" x={x} y={yy} width="13" height="12" rx="1.5" data-blink />)}

        {/* glass, pillars, mirrors, wipers */}
        <g style={at(0.4)}>
            <path className="draw ink" d="M296 330 L512 322 L506 420 L202 408 Z" pathLength={1} />
            <path className="draw ink" d="M512 322 L560 318 L625 335 L690 396" pathLength={1} />
            <path className="draw" d="M518 332 L573 330 L575 410 L520 416 Z" pathLength={1} />
            <path className="draw" d="M580 330 L622 338 L632 402 L580 408 Z" pathLength={1} />
            <path className="draw ink" d="M525 388 L578 383 L582 412 L528 416 Z" pathLength={1} />
            <path className="draw ink" d="M195 380 L222 378 L222 400 L197 402 Z" pathLength={1} />
            <path className="fade" d="M240 404 L300 398 M330 410 L420 405" />
        </g>

        {/* body side, doors, handles, bed */}
        <g style={at(0.6)}>
            <path className="draw ink" d="M506 422 L695 408 L700 470 L690 500" pathLength={1} />
            <path className="draw ink" d="M515 548 L512 568 L610 548 L620 540" pathLength={1} />
            <path className="draw" d="M598 412 L604 552 M650 405 L652 540" pathLength={1} />
            <path className="draw" d="M520 470 L690 452" pathLength={1} />
            <rect className="fade" x="582" y="445" width="13" height="6" rx="2" />
            <rect className="fade" x="642" y="432" width="10" height="6" rx="2" />
            <rect className="draw hot" x="690" y="410" width="7" height="22" pathLength={1} />
            <path className="draw ink" d="M612 545 C620 482 676 470 692 500" pathLength={1} />
        </g>

        {/* hood, black wrap, scoop, fender */}
        <g style={at(0.8)}>
            <path className="wrap" d="M100 466 C140 440 190 434 260 436 L392 452 L340 474 L250 480 L160 478 Z" />
            <path className="draw ink" d="M202 408 L45 457 C80 470 160 478 255 478 L392 470 C420 445 470 430 506 422" pathLength={1} />
            <path className="draw hot" d="M197 424 C200 417 305 417 312 426 C305 434 200 434 197 424 Z" pathLength={1} />
            <path className="draw ink" d="M392 540 C400 488 440 470 470 474 C495 478 512 505 515 548" pathLength={1} />
        </g>

        {/* headlights, grille, pods */}
        <g style={at(1)}>
            <path className="draw ink" d="M45 458 L66 460 L68 506 L27 500 L30 472 Z" pathLength={1} />
            <path className="draw ink" d="M258 480 L378 468 L392 478 L388 522 L262 524 L256 510 Z" pathLength={1} />
            <path className="draw" d={ellipsePath(318, 500, 15, 14)} pathLength={1} />
            <path className="draw" d={ellipsePath(366, 495, 10, 11)} pathLength={1} />
            <path className="draw ink" d="M75 482 L245 490 L247 526 L82 516 Z" pathLength={1} />
            <path className="draw" d="M160 486 L162 521" pathLength={1} />
            <path className="fade mesh" d={Array.from({ length: 12 }, (_, i) => "M" + (86 + i * 13.5) + " 486 l-4 30").join(" ") + " M80 499 H243 M81 509 H244"} />
        </g>
        <circle className="lamp" cx="318" cy="500" r="7" data-blink />
        <circle className="lamp" cx="46" cy="482" r="6" data-blink />
        {[[137, 500], [181, 501]].map(([x, yy], i) => <rect key={i} className="pod" x={x} y={yy} width="13" height="11" rx="1.5" data-blink />)}

        {/* bumper, intake, fogs */}
        <g style={at(1.2)}>
            <path className="draw ink" d="M18 520 C120 532 260 540 400 540" pathLength={1} />
            <path className="draw ink" d="M10 528 C0 580 20 600 60 607 L260 618 L405 628 L470 625" pathLength={1} />
            <path className="draw" d="M58 566 L250 572 L262 612 L65 604 Z" pathLength={1} />
            <path className="draw" d={ellipsePath(323, 599, 21, 21)} pathLength={1} />
            <path className="draw" d={ellipsePath(323, 599, 12, 12)} pathLength={1} />
            <path className="draw" d={ellipsePath(28, 572, 10, 11)} pathLength={1} />
        </g>
        {[[85, 580], [187, 590]].map(([x, yy], i) => <rect key={i} className="pod" x={x} y={yy} width="15" height="15" rx="2" data-blink />)}
        <circle className="lamp" cx="323" cy="599" r="8" data-blink />

        {/* wheels */}
        <BajaWheel cx={448} cy={607} rx={61} ry={87} rimX={470} rimRx={30} rimRy={57} d={1.4} />
        <BajaWheel cx={648} cy={545} rx={34} ry={60} rimX={661} rimRx={16} rimRy={36} d={1.5} />
        <path className="draw ink" d="M65 606 C72 652 168 662 180 614" pathLength={1} style={at(1.5)} />

        <Callouts d={1.8} items={[
            { tx: 200, ty: 425, x: -40, t: "Hood scoop", s: "IAG 750 closed deck under it", hot: true },
            { tx: 12, ty: 520, x: -40, t: "FP Red turbo", s: "ETS front mount · ID1300s" },
            { tx: 58, ty: 600, x: -40, t: "Amber pods", s: "grille, bumper, and roof" },
            { tx: 688, ty: 304, x: 740, t: "C3 roof platform", s: "antennas go here next" },
            { tx: 695, ty: 440, x: 740, t: "Wardriving rig", s: "planned for the bed" },
            { tx: 509, ty: 612, x: 740, y: 640, elbow: 600, t: "All-terrains", s: "control arms + CVs done first" },
        ]} />
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
    hamlab: [{ C: Rack, title: "The HamLab rack", meta: "48U · hover a unit" }],
    baja: [{ C: Baja, title: "2005 Baja Turbo", meta: "front three-quarter" }],
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

import { Animated } from "./animate";
import { Compare } from "./compare";

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

/* ───────────── HamLab rack, traced over the photo ─────────────
   Coordinates are pixels in public/images/hamlab/rack-front.jpg (placed at x 30).
   The trace lines up with the photo, so the slider on the HamLab page can show both. */

function hex(cx: number, cy: number, r: number) {
    return [30, 90, 150, 210, 270, 330].map(a => {
        const t = (a * Math.PI) / 180;
        return (cx + r * Math.cos(t)).toFixed(1) + "," + (cy + r * Math.sin(t)).toFixed(1);
    }).join(" ");
}

function portRow(x: number, yy: number, n: number, step: number, w: number, h: number) {
    return Array.from({ length: n }, (_, i) => <rect key={x + "-" + yy + "-" + i} x={x + i * step} y={yy} width={w} height={h} />);
}

function Unit({ k, top, h, d, hot, children }: { k: string; top: number; h: number; d: number; hot?: boolean; children?: React.ReactNode }) {
    return <g className={"unit" + (hot ? " hot" : "")} style={at(d)} data-unit={k}>
        <rect className="hit" x="98" y={top} width="394" height={h} />
        <rect className="draw" x="98" y={top} width="394" height={h} rx="2" pathLength={1} />
        {children}
    </g>;
}

// Dell 2U bezel: two honeycomb rows, logo plate, ears.
function Dell({ top, d }: { top: number; d: number }) {
    const cells = [];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
        cells.push(<polygon key={row + "-" + i} points={hex(142 + i * 37 + (row ? 18.5 : 0), top + 22 + row * 30, 17)} />);
    }
    return <Unit k="dell" top={top} h={72} d={d}>
        <g className="fade hex">{cells}</g>
        <rect className="draw" x="104" y={top + 6} width="16" height="60" pathLength={1} />
        <rect className="draw" x="468" y={top + 6} width="20" height="60" pathLength={1} />
        <circle className="fade led green" data-blink cx="478" cy={top + 16} r="2.6" />
        <circle className="fade led" data-blink cx="478" cy={top + 28} r="2.2" />
    </Unit>;
}

// A front fan with guard rings. The blades spin.
function GuardFan({ cx, cy, r, speed }: { cx: number; cy: number; r: number; speed: number }) {
    const blades = [0, 72, 144, 216, 288].map(a => {
        const t = (a * Math.PI) / 180, t2 = ((a + 55) * Math.PI) / 180;
        return "M" + (cx + r * 0.2 * Math.cos(t)).toFixed(1) + " " + (cy + r * 0.2 * Math.sin(t)).toFixed(1) +
            " Q" + (cx + r * 0.7 * Math.cos(t)).toFixed(1) + " " + (cy + r * 0.7 * Math.sin(t)).toFixed(1) +
            " " + (cx + r * 0.88 * Math.cos(t2)).toFixed(1) + " " + (cy + r * 0.88 * Math.sin(t2)).toFixed(1);
    }).join(" ");
    return <g>
        <path className="draw" d={ring(cx, cy, r)} pathLength={1} />
        <path className="fade guard" d={ring(cx, cy, r * 0.75) + " " + ring(cx, cy, r * 0.5)} />
        <g data-spin={speed}><path className="fade blades" d={blades + " " + ring(cx, cy, r * 0.18)} /></g>
    </g>;
}

type RackLabel = { k: string; y: number; ly?: number; t: string; s: string; side: "l" | "r"; hot?: boolean };
const rackLabels: RackLabel[] = [
    { k: "modem", y: 246, ly: 170, t: "Spectrum", s: "modem", side: "r" },
    { k: "udm", y: 301, ly: 270, t: "UDM Pro Max", s: "the edge", side: "r", hot: true },
    { k: "unifi", y: 371, ly: 370, t: "UniFi switch", s: "48 ports", side: "r" },
    { k: "patch", y: 440, ly: 470, t: "Patch panels", s: "Cat6 + Cat6A", side: "r" },
    { k: "core", y: 523, ly: 570, t: "EX4400", s: "the core", side: "r", hot: true },
    { k: "pdu", y: 1688, t: "PDU", s: "Tripp Lite", side: "r" },
    { k: "mini", y: 580, t: "Mini PC", s: "on a shelf", side: "l" },
    { k: "dell", y: 850, t: "4× PowerEdge", s: "vSphere HA", side: "l", hot: true },
    { k: "hl15", y: 1137, t: "HL15 BEAST", s: "TrueNAS", side: "l", hot: true },
    { k: "ups", y: 1590, t: "2× UPS", s: "CyberPower", side: "l" },
];

export function Rack({ photo = false }: { photo?: boolean }) {
    const holes = [];
    for (let yy = 140; yy <= 1700; yy += 12.5) holes.push(<circle key={"l" + yy} cx="102" cy={yy} r="1.8" />, <circle key={"r" + yy} cx="488" cy={yy} r="1.8" />);
    const ups = (top: number, d: number) => <Unit k="ups" top={top} h={84} d={d}>
        <g className="fade small">{[0, 1, 2].flatMap(r => [...portRow(112, top + 18 + r * 18, 9, 14, 9, 5), ...portRow(250, top + 18 + r * 18, 7, 14, 9, 5)])}</g>
        <rect className="draw" x="373" y={top + 14} width="60" height="56" pathLength={1} />
        <circle className="fade led blue" data-blink cx="452" cy={top + 22} r="3" />
    </Unit>;
    return <Animated className="drawing-wrap rack-wrap">
        <svg className="drawing rack" viewBox="-320 -10 1230 1920" role="img" aria-label="Line drawing of the HamLab rack, traced over a photo. Top to bottom: PDU, Spectrum modem, UDM Pro Max, cable manager, UniFi 48-port switch, Cat6 and Cat6A patch panels, Juniper EX4400 core switch, a mini PC shelf, an empty shelf, four Dell PowerEdge servers, a 45HomeLab HL15 BEAST running TrueNAS, a cable bay, a blank panel, two CyberPower UPS units, and a Tripp Lite PDU.">
            <Defs />
            {photo && <image className="rack-photo" href="/images/hamlab/rack-front.jpg" x="30" y="0" width="540" height="1880" preserveAspectRatio="none" />}

            {/* dimensions */}
            <g style={at(0.1)}>
                <path className="draw dim" d="M40 1858 H528 M40 1850 V1866 M528 1850 V1866" pathLength={1} />
                <text className="fade dimtext" x="284" y="1898" textAnchor="middle">19&quot; rack</text>
                <path className="draw dim" d="M16 140 V1705 M8 140 H24 M8 1705 H24" pathLength={1} />
                <text className="fade dimtext" x="0" y="922" textAnchor="middle" transform="rotate(-90 0 922)">48U</text>
            </g>

            {/* cabinet */}
            <g style={at(0)}>
                <rect className="draw" x="38" y="50" width="490" height="52" rx="10" pathLength={1} />
                <rect className="draw" x="40" y="102" width="488" height="1603" pathLength={1} />
                <path className="draw" d="M95 102 V1705 M495 102 V1705" pathLength={1} />
                <rect className="draw" x="40" y="1705" width="488" height="55" pathLength={1} />
                <rect className="draw" x="30" y="1760" width="520" height="70" rx="3" pathLength={1} />
            </g>
            <g className="fade dots" style={at(0.5)}>{holes}</g>

            {/* top PDU */}
            <Unit k="pdu" top={140} h={56} d={0.35}>
                <rect className="draw" x="444" y="150" width="16" height="22" pathLength={1} />
                <circle className="fade led red" data-blink cx="452" cy="161" r="3.5" />
            </Unit>
            {/* modem */}
            <Unit k="modem" top={210} h={72} d={0.45}>
                <rect className="draw" x="207" y="226" width="173" height="50" rx="3" pathLength={1} />
                <circle className="fade" cx="356" cy="252" r="7" />
            </Unit>
            {/* UDM Pro Max */}
            <Unit k="udm" top={285} h={33} d={0.55} hot>
                <rect className="fade" x="110" y="294" width="15" height="15" />
                <rect className="draw" x="132" y="292" width="200" height="20" pathLength={1} />
                <g className="fade small">{portRow(366, 293, 4, 12, 9, 7)}{portRow(366, 303, 4, 12, 9, 7)}</g>
            </Unit>
            {/* cable manager */}
            <Unit k="cable" top={320} h={26} d={0.6}>
                <rect className="draw" x="125" y="328" width="315" height="10" pathLength={1} />
            </Unit>
            {/* UniFi 48-port */}
            <Unit k="unifi" top={350} h={42} d={0.65}>
                <rect className="fade" x="110" y="362" width="15" height="15" />
                <g className="fade small">{portRow(140, 359, 24, 12.6, 9.5, 8)}{portRow(140, 374, 24, 12.6, 9.5, 8)}</g>
            </Unit>
            {/* Cat6 patch: four groups of six */}
            <Unit k="patch" top={398} h={47} d={0.7}>
                <g className="fade small">{[110, 205, 300, 395].flatMap(gx => portRow(gx, 414, 6, 13.5, 10, 10))}</g>
            </Unit>
            <Unit k="brush" top={450} h={20} d={0.72}>
                <path className="draw" d="M120 460 H470" pathLength={1} />
            </Unit>
            {/* Cat6A patch */}
            <Unit k="patch" top={474} h={27} d={0.75}>
                <g className="fade small">{portRow(104, 480, 24, 14.6, 11, 11)}</g>
            </Unit>
            {/* Juniper EX4400 */}
            <Unit k="core" top={502} h={44} d={0.8} hot>
                <g className="fade small">{portRow(104, 506, 24, 13.9, 10.5, 9)}{portRow(104, 525, 24, 13.9, 10.5, 9)}</g>
                <rect className="draw" x="444" y="508" width="40" height="30" pathLength={1} />
            </Unit>
            {/* mini PC shelf */}
            <Unit k="mini" top={550} h={60} d={0.9}>
                <rect className="draw" x="218" y="562" width="154" height="36" rx="3" pathLength={1} />
                <path className="fade vents" d={Array.from({ length: 9 }, (_, i) => "M" + (300 + i * 8) + " 566 l-10 28").join(" ")} />
                <g className="fade small">{portRow(240, 584, 3, 12, 8, 5)}</g>
                <circle className="fade led blue" data-blink cx="232" cy="586" r="2.2" />
            </Unit>
            {/* empty shelf: just the tray */}
            <g style={at(0.95)}>
                <path className="draw" d="M98 686 H492 M98 698 H492" pathLength={1} />
            </g>
            {/* 4x PowerEdge */}
            {[700, 777, 852, 927].map((t, i) => <Dell key={t} top={t} d={1.05 + i * 0.12} />)}
            {/* HL15 BEAST */}
            <Unit k="hl15" top={1048} h={197} d={1.6} hot>
                {[157, 280, 403].map((cx, i) => <GuardFan key={cx} cx={cx} cy={1137} r={60} speed={1 + i * 0.12} />)}
                <path className="draw" d="M98 1196 H250 l12 -10 H470" pathLength={1} />
                <path className="draw" d="M215 1244 L232 1226 H492" pathLength={1} />
                <g className="fade chevrons">{Array.from({ length: 10 }, (_, i) => <path key={i} d={"M" + (250 + i * 22) + " 1240 l8 -10 h10 l-8 10 z"} />)}</g>
            </Unit>
            {/* cable bay */}
            <g style={at(1.9)}>
                <path className="draw cable dark" d="M240 1250 c-20 40 30 80 80 60 s40 -60 90 -20 M300 1252 c30 60 110 70 140 20 M270 1260 c-10 50 60 60 70 80 M380 1250 c-40 30 -20 80 40 85" pathLength={1} />
            </g>
            <Unit k="blank" top={1350} h={150} d={2} />
            {ups(1505, 2.1)}
            {ups(1592, 2.2)}
            {/* bottom PDU */}
            <Unit k="pdu" top={1672} h={33} d={2.3}>
                <g className="fade small">{portRow(188, 1677, 6, 44, 24, 22)}</g>
                <rect className="draw" x="458" y="1676" width="16" height="24" pathLength={1} />
                <circle className="fade led red" data-blink cx="466" cy="1688" r="3.5" />
            </Unit>

            {/* the cables you can actually see in the photo */}
            <g style={at(2.4)}>
                <path className="draw cable blue" d="M300 318 C300 284 175 282 158 330 C148 362 188 398 212 432 C228 452 262 446 268 420 C276 392 300 362 300 332" pathLength={1} />
                <path className="stream" d="M300 318 C300 284 175 282 158 330 C148 362 188 398 212 432 C228 452 262 446 268 420" data-stream="34" />
                {[112, 126, 140, 154, 168].map(x => <path key={x} className="draw cable" d={"M" + x + " 388 c-6 14 -4 28 3 40"} pathLength={1} />)}
                <path className="draw cable" d="M205 432 c8 18 18 30 32 38" pathLength={1} />
                <path className="draw cable hot" d="M224 522 C210 494 236 468 268 480" pathLength={1} />
                <path className="stream" d="M224 522 C210 494 236 468 268 480" data-stream="34" />
                {Array.from({ length: 12 }, (_, i) => <path key={i} className="draw cable" d={"M" + (278 + i * 12) + " 486 c6 -12 16 -6 12 22"} pathLength={1} />)}
                <path className="draw cable dark" d="M428 440 C432 480 426 510 432 546" pathLength={1} />
                <path className="draw cable" d="M398 292 C398 270 400 254 408 240" pathLength={1} />
            </g>

            {/* labels: left and right, so the rack stays centered */}
            {rackLabels.map((l, i) => {
                const left = l.side === "l";
                const x0 = left ? 98 : 492, x1 = left ? -24 : 614, ly = l.ly ?? l.y;
                const elbow = left ? x0 - 60 : x0 + 70;
                return <g key={l.k + l.y} style={at(2.5 + i * 0.07)} className={"rack-label" + (l.hot ? " hot" : "")} data-unit-label={l.k}>
                    <path className="draw leader" d={"M" + x0 + " " + l.y + " H" + elbow + " L" + x1 + " " + ly} pathLength={1} />
                    <circle className="fade tick" cx={x1} cy={ly} r="4" />
                    <text className="fade rl-t" x={left ? x1 - 14 : x1 + 14} y={ly + 2} textAnchor={left ? "end" : "start"}>{l.t}</text>
                    <text className="fade rl-s" x={left ? x1 - 14 : x1 + 14} y={ly + 30} textAnchor={left ? "end" : "start"}>{l.s}</text>
                </g>;
            })}
        </svg>
    </Animated>;
}

// Shared label style for the photo traces: leader from the part, elbow, then two lines of text.
type Callout = { tx: number; ty: number; ly: number; t: string; s: string; side: "l" | "r"; hot?: boolean };
function Callouts({ items, lx, rx, d }: { items: Callout[]; lx: number; rx: number; d: number }) {
    return <>{items.map((c, i) => {
        const left = c.side === "l", x1 = left ? lx : rx;
        const elbow = left ? Math.max(c.tx - 50, x1 + 40) : Math.min(c.tx + 50, x1 - 40);
        return <g key={c.t} style={at(d + i * 0.1)} className={c.hot ? "hot" : ""}>
            <circle className="fade tick" cx={c.tx} cy={c.ty} r="6" />
            <path className="draw leader" d={"M" + c.tx + " " + c.ty + " H" + elbow + " L" + x1 + " " + c.ly} pathLength={1} />
            <circle className="fade tick" cx={x1} cy={c.ly} r="5" />
            <text className="fade rl-t" x={left ? x1 - 16 : x1 + 16} y={c.ly + 4} textAnchor={left ? "end" : "start"}>{c.t}</text>
            <text className="fade rl-s" x={left ? x1 - 16 : x1 + 16} y={c.ly + 38} textAnchor={left ? "end" : "start"}>{c.s}</text>
        </g>;
    })}</>;
}

/* ───────────── N2, traced over the photo (pixels of public/images/raskal/n2.jpg × 1.5, placed at x 100) ───────────── */
export function NodeN2({ photo = false }: { photo?: boolean }) {
    const fibers = [
        "M1040 995 C1040 1150 1000 1300 900 1490",
        "M1072 995 C1080 1150 1060 1300 980 1490",
        "M1150 995 C1160 1200 1250 1350 1350 1490",
        "M1185 995 C1200 1200 1300 1350 1430 1460",
    ];
    const copper = [
        "M585 955 C590 1080 640 1300 900 1330 C1200 1350 1440 1180 1450 900",
        "M680 955 C700 1060 800 1100 1000 1080 C1250 1060 1430 900 1440 700",
        "M860 955 C870 1100 1000 1150 1150 1100",
    ];
    return <Animated className="drawing-wrap">
        <svg className="drawing ptrace n2-trace" viewBox="-560 0 2580 1500" role="img" aria-label="N2, traced over a photo: a Minisforum MS-01 with a red N2 tag, sitting on a white 8-port switch with two SFP+ cages. Blue patch cables and yellow fiber run off the switch.">
            <Defs />
            {photo && <image className="trace-photo" href="/images/raskal/n2.jpg" x="100" y="0" width="1350" height="1500" preserveAspectRatio="none" />}
            {/* monitor edge */}
            <path className="draw" d="M100 40 H1450 M100 72 H1450" pathLength={1} style={at(0)} />
            {/* the puck on top */}
            <rect className="draw" x="515" y="200" width="505" height="240" rx="100" pathLength={1} style={at(0.2)} />
            {/* MS-01 */}
            <g style={at(0.4)} className="hot">
                <path className="draw" d="M175 495 L212 430 H1298 L1330 495" pathLength={1} />
                <rect className="draw" x="175" y="495" width="1155" height="300" rx="8" pathLength={1} />
                <path className="fade vents" d={Array.from({ length: 25 }, (_, k) => "M" + (650 + k * 26) + " 765 L" + (690 + k * 26) + " 525").join(" ")} />
                <rect className="draw" x="625" y="695" width="25" height="25" pathLength={1} />
                <rect className="draw" x="665" y="695" width="90" height="25" pathLength={1} />
                {[[1160, 575], [1190, 600], [1215, 625]].map(([cx, cy]) => <circle key={cx} className="fade led green" data-blink cx={cx} cy={cy} r="7" />)}
            </g>
            {/* the N2 tag */}
            <g style={at(0.6)} className="hot">
                <rect className="draw" x="170" y="505" width="445" height="300" pathLength={1} />
                <text className="fade n2" x="282" y="740" textAnchor="middle">N</text>
                <text className="fade n2" x="512" y="740" textAnchor="middle">2</text>
            </g>
            {/* switch */}
            <g style={at(0.8)}>
                <path className="draw" d="M155 830 L192 755 H1318 L1350 830" pathLength={1} />
                <rect className="draw" x="155" y="830" width="1195" height="215" rx="14" pathLength={1} />
                <path className="draw" d="M610 815 H1220" pathLength={1} />
                <g className="fade small big">{Array.from({ length: 8 }, (_, i) => <rect key={i} x={215 + i * 83} y="895" width="58" height="55" />)}</g>
                {[1005, 1125].map(x => <rect key={x} className="draw" x={x} y="935" width="95" height="60" pathLength={1} />)}
                {[1062, 1172].map(x => <circle key={x} className="fade led red" data-blink cx={x} cy="922" r="7" />)}
            </g>
            {/* cables */}
            <path className="draw cable dark" d="M270 880 C250 1000 210 1100 150 1490" pathLength={1} style={at(1.1)} />
            {copper.map((c, i) => <path key={c} className="draw cable blue" d={c} pathLength={1} style={at(1.15 + i * 0.05)} />)}
            <path className="draw cable" d="M770 960 C780 1100 600 1300 300 1480" pathLength={1} style={at(1.25)} />
            {fibers.map((f, i) => <g key={f}>
                <path className="draw cable hot" d={f} pathLength={1} style={at(1.3 + i * 0.05)} />
                <path className="stream" d={f} data-stream="40" />
            </g>)}
            <Callouts lx={-40} rx={1540} d={1.6} items={[
                { tx: 300, ty: 600, ly: 480, t: "N2 · MS-01", s: "ESXi", side: "l", hot: true },
                { tx: 160, ty: 940, ly: 960, t: "8-port switch", s: "2× SFP+", side: "l" },
                { tx: 1300, ty: 640, ly: 560, t: "Every Raskal VM", s: "six of them", side: "r", hot: true },
                { tx: 1150, ty: 1010, ly: 1060, t: "10G fiber", s: "back to the core", side: "r", hot: true },
            ]} />
        </svg>
    </Animated>;
}

/* ───────────── Desk PC, traced over the photo (pixels of public/images/desk/desk.jpg) ───────────── */
export function Desktop({ photo = false }: { photo?: boolean }) {
    const tubes = [
        "M150 284 H690",
        "M160 292 V345 H312",
        "M440 300 V578",
        "M300 562 C450 566 540 576 570 592 C596 608 600 632 600 652",
        "M398 650 V752 M420 650 V752",
        "M530 284 V262 M730 284 V255",
    ];
    return <Animated className="drawing-wrap">
        <svg className="drawing ptrace desk-trace" viewBox="-380 110 1570 740" role="img" aria-label="The desk PC, traced over a photo: two PCs in one case, a hardline water loop with two reservoirs and pumps, an RTX GPU with a water block, four RGB RAM sticks, and a playing card wedged in the loop.">
            <Defs />
            <defs>
                <linearGradient id="res" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f2850d" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#f2850d" stopOpacity="0.12" />
                </linearGradient>
            </defs>
            {photo && <image className="trace-photo" href="/images/desk/desk.jpg" x="0" y="0" width="810" height="844" preserveAspectRatio="none" />}
            {/* case frame */}
            <g style={at(0)}>
                <path className="draw" d="M62 176 L810 136 M128 242 L810 190" pathLength={1} />
                <path className="draw" d="M80 200 V690 L810 760" pathLength={1} />
                <path className="draw faint" d="M100 700 L810 830" pathLength={1} />
            </g>
            {/* top radiator bar */}
            <g style={at(0.2)}><path className="draw" d="M120 178 L440 162 V226 L124 240 Z" pathLength={1} /></g>
            {/* PC 1: board, emblem, RAM, GPU + block */}
            <g style={at(0.4)}>
                <rect className="draw" x="110" y="252" width="360" height="330" pathLength={1} />
                <path className="draw" d="M222 262 H282 V372 H222 Z" pathLength={1} />
                {[0, 1, 2, 3].map(i => <rect key={i} className="draw ram" x={394 + i * 9} y="252" width="6" height="156" pathLength={1} data-blink />)}
                <rect className="draw" x="130" y="440" width="300" height="60" pathLength={1} />
                <rect className="draw hot" x="232" y="418" width="200" height="78" rx="4" pathLength={1} />
                <rect className="fade" x="166" y="470" width="74" height="20" />
            </g>
            {/* pumps on the left, PC 2 low */}
            <g style={at(0.6)}>
                <Fan cx={240} cy={552} r={30} speed={0.6} />
                <Fan cx={232} cy={612} r={34} speed={0.7} />
                <rect className="draw" x="120" y="632" width="118" height="68" pathLength={1} />
                <path className="fade" d="M130 646 H228 M130 658 H228 M130 670 H228 M130 682 H228" />
            </g>
            {/* reservoirs + pumps + glow */}
            {[{ x: 476, w: 90, top: 316, bot: 582, cy: 612, rx: 48 }, { x: 670, w: 120, top: 306, bot: 612, cy: 642, rx: 62 }].map((r, i) => <g key={i} style={at(0.8 + i * 0.15)} className="hot">
                <rect className="liquid res" x={r.x + 4} y={r.top + 20} width={r.w - 8} height={r.bot - r.top - 20} data-fill />
                <rect className="draw" x={r.x} y={r.top} width={r.w} height={r.bot - r.top} rx="10" pathLength={1} />
                <path className="draw" d={"M" + r.x + " " + (r.top + 22) + " H" + (r.x + r.w)} pathLength={1} />
                <ellipse className="draw" cx={r.x + r.w / 2} cy={r.cy} rx={r.rx} ry={14} pathLength={1} />
                <ellipse className="fade glow" cx={r.x + r.w / 2} cy={r.cy} rx={r.rx} ry={14} />
                <rect className="draw" x={r.x - 8} y={r.cy + 14} width={r.w + 16} height="48" rx="8" pathLength={1} />
            </g>)}
            {tubes.map((t, i) => <g key={t}>
                <path className="draw tube" d={t} pathLength={1} style={at(1.2 + i * 0.08)} />
                <path className="stream coolant" d={t} data-stream="40" />
            </g>)}
            {/* the card */}
            <g style={at(1.7)}>
                <path className="draw" d="M410 506 L468 498 L486 610 L424 620 Z" pathLength={1} />
                <text className="fade card" x="430" y="556" transform="rotate(-8 448 560)">8♣</text>
            </g>
            <Callouts lx={-40} rx={850} d={1.9} items={[
                { tx: 260, ty: 320, ly: 300, t: "PC 1", s: "main board", side: "l" },
                { tx: 180, ty: 470, ly: 440, t: "RTX GPU", s: "water block", side: "l", hot: true },
                { tx: 160, ty: 666, ly: 640, t: "PC 2", s: "same case", side: "l" },
                { tx: 410, ty: 330, ly: 220, t: "RAM", s: "4 sticks", side: "r" },
                { tx: 790, ty: 460, ly: 420, t: "2 reservoirs", s: "+ pumps", side: "r", hot: true },
                { tx: 600, ty: 640, ly: 600, t: "Hardline", s: "one loop", side: "r", hot: true },
            ]} />
        </svg>
    </Animated>;
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

// N2 photo spans x 100..1450 of a 2580-wide viewBox starting at -560.
function N2Compare() {
    return <Compare box={{ left: (660 / 2580) * 100, width: (1350 / 2580) * 100 }} label="Slide to compare the photo and the trace"><NodeN2 photo /></Compare>;
}

// The rack with its photo underneath and a slider. Photo spans x 30..570 of a 1230-wide viewBox starting at -320.
function RackCompare() {
    return <Compare box={{ left: (350 / 1230) * 100, width: (540 / 1230) * 100 }} label="Slide to compare the photo and the trace"><Rack photo /></Compare>;
}

type D = { C: () => React.ReactElement; title: string; meta: string };
const drawings: Record<string, D[]> = {
    raskal: [
        { C: N2Compare, title: "N2, the box Raskal runs on", meta: "drag to compare" },
        { C: AuthFlow, title: "Opening a private app", meta: "Caddy forward auth" },
    ],
    hamlab: [{ C: RackCompare, title: "The HamLab rack", meta: "drag to compare · hover a unit" }],
    hambot: [{ C: BotPipeline, title: "Push to running", meta: "≤ 15 min" }],
    "flight-wall": [{ C: SignalChain, title: "Window to wall", meta: "1090 MHz" }],
    roamarc: [{ C: PhoneRoads, title: "How road credit works", meta: "SwiftUI" }],
    wannacry: [{ C: KillSwitch, title: "Phases and the kill switch", meta: "CSEC 202" }],
};

export function ProjectDrawing({ slug }: { slug: string }) {
    return <>{(drawings[slug] || []).map((d, i) => <Fig key={d.title} n={String(i + 1).padStart(2, "0")} title={d.title} meta={d.meta} className={d.C === RackCompare ? "fig-rack" : ""}><d.C /></Fig>)}</>;
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

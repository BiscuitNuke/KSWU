import { Animated } from "./animate";

/* Private by default: a shared drive with its start and end hidden, and a private zone
   that scrubs the route even mid-drive. Drawn, not screenshotted: no real places. */
const ROUTE = "M70 300 C 140 300, 150 220, 230 210 S 330 260, 380 200 S 470 90, 560 120 S 690 230, 760 170 S 860 80, 930 110";

export function RoamPrivacy() {
    return <section className="ra-privacy">
        <div className="ra-privacy-copy">
            <p className="label">Private by default</p>
            <h3>Share the drive.<br />Not your driveway.</h3>
            <p>Recaps can hide where a drive starts and ends. Private zones cut the route anywhere you set one, even if you drive straight through. The original stays on your phone, untouched. Only the preview goes in the share sheet.</p>
        </div>
        <Animated className="ra-privacy-art">
            <svg viewBox="0 30 1000 380" role="img" aria-label="A shared route with its start, its end, and one private zone blanked out.">
                <defs>
                    <pattern id="ra-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" /></pattern>
                </defs>
                <path className="ra-p-base" d={ROUTE} />
                <path className="draw ra-p-line" d={ROUTE} pathLength={1} style={{ ["--d" as string]: "0.2s" }} />
                {[{ x: 70, y: 300, t: "START HIDDEN" }, { x: 930, y: 110, t: "END HIDDEN" }, { x: 560, y: 120, t: "PRIVATE ZONE" }].map((z, k) => <g key={z.t} className="fade ra-zone" style={{ ["--d" as string]: 1.4 + k * 0.25 + "s" }}>
                    <circle cx={z.x} cy={z.y} r={k === 2 ? 58 : 46} className="ra-z-fill" />
                    <circle cx={z.x} cy={z.y} r={k === 2 ? 58 : 46} className="ra-z-ring" />
                    <circle cx={z.x} cy={z.y} r={k === 2 ? 58 : 46} className="ra-z-scan" data-spin="6" />
                    <text x={z.x} y={z.y + (k === 2 ? 82 : 70)} textAnchor="middle">{z.t}</text>
                </g>)}
                <g className="fade ra-p-chip" style={{ ["--d" as string]: "2.2s" }}>
                    <rect x="660" y="262" width="300" height="64" rx="10" />
                    <text x="680" y="290">SHARE PREVIEW</text>
                    <text x="680" y="312" className="dim">route clipped · stats kept</text>
                </g>
            </svg>
        </Animated>
    </section>;
}

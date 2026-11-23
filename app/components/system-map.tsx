import { InView } from "./reveal";

// The real layout of what I run, simplified for the public.
// No IPs, VLANs, or ports on purpose. Boxes draw in when you scroll to them.
type Node = { x: number; y: number; w: number; h: number; title: string; sub?: string; d: number; hot?: boolean };

const zones = [
    { x: 450, y: 30, w: 720, h: 330, label: "Raskal / my stuff", d: 0.1 },
    { x: 450, y: 400, w: 470, h: 230, label: "HamLab / the house", d: 0.2 },
];

const nodes: Node[] = [
    { x: 30, y: 250, w: 150, h: 64, title: "Internet", sub: "you, probably", d: 0 },
    { x: 240, y: 250, w: 160, h: 64, title: "Edge", sub: "UDM Pro Max", d: 0.3 },
    { x: 480, y: 250, w: 170, h: 64, title: "Gateway", sub: "Caddy · TLS · auth", d: 0.6 },
    { x: 480, y: 80, w: 170, h: 64, title: "Authentik", sub: "SSO · MFA", d: 0.8 },
    { x: 700, y: 70, w: 200, h: 50, title: "GitLab", d: 1 },
    { x: 700, y: 135, w: 200, h: 50, title: "Guacamole", d: 1.05 },
    { x: 700, y: 200, w: 200, h: 50, title: "Game server", d: 1.1 },
    { x: 480, y: 450, w: 190, h: 64, title: "vSphere HA", sub: "EPYC · 512 GB", d: 0.9 },
    { x: 480, y: 540, w: 190, h: 64, title: "TrueNAS", sub: "iSCSI · MPIO", d: 1 },
    { x: 700, y: 450, w: 190, h: 64, title: "AD + PKI", sub: "LDAPS · 802.1X", d: 1.1 },
    { x: 700, y: 540, w: 190, h: 64, title: "Wazuh", sub: "SIEM · Grafana", d: 1.2 },
    { x: 960, y: 450, w: 190, h: 64, title: "Flight Wall", sub: "Pi 4 · 1090 MHz", d: 1.5 },
    { x: 30, y: 560, w: 150, h: 64, title: "GitHub", sub: "Actions → GHCR", d: 0.4 },
];

// RaskalDev is drawn on its own so it can list its containers.
const containers = ["ksw.dev", "HamBot", "pricewatch", "Grafana", "Jellyfin"];

const wires = [
    { path: "M180 282 H240", d: 0.2, main: true },
    { path: "M400 282 H480", d: 0.5, main: true },
    { path: "M650 282 H920 V147 H940", d: 0.9, main: true },
    { path: "M565 250 V144", d: 0.7 },
    { path: "M650 112 H675 V95 H700 M675 112 V160 H700 M675 160 V225 H700", d: 0.9 },
    { path: "M320 314 V482 H480", d: 0.6 },
    { path: "M575 514 V540", d: 1 },
    { path: "M670 482 H700", d: 1.1 },
    { path: "M180 592 H420 V380 H1000 V330", d: 1.2 },
    { path: "M1060 330 V450", d: 1.6 },
];

// Phones get the same path, stacked. The big map is too wide to read.
const trace = [
    { title: "Internet", sub: "you, probably" },
    { title: "Edge", sub: "UDM Pro Max" },
    { title: "Gateway", sub: "Caddy · TLS · forward auth" },
    { title: "ksw.dev", sub: "RaskalDev · Docker", here: true },
];
const branches = [
    { label: "Behind Authentik (SSO + MFA)", items: "GitLab · Guacamole · Game server" },
    { label: "Also on RaskalDev", items: "HamBot · pricewatch · Grafana · Jellyfin" },
    { label: "In the house", items: "vSphere HA · TrueNAS · AD + PKI · Wazuh · Flight Wall" },
    { label: "Deploys", items: "GitHub Actions → GHCR → Dockhand" },
];

function MobileTrace() {
    return <InView className="trace">
        <ol>
            {trace.map((step, i) => <li key={step.title} className={step.here ? "here" : ""} style={{ ["--d" as string]: i * 0.18 + "s" }}>
                <strong>{step.title}</strong><span>{step.sub}</span>
                {step.here && <em>you are here</em>}
            </li>)}
        </ol>
        <dl>
            {branches.map(branch => <div key={branch.label}><dt className="label">{branch.label}</dt><dd>{branch.items}</dd></div>)}
        </dl>
    </InView>;
}

export default function SystemMap() {
    return <>
    <MobileTrace />
    <InView className="map-wrap">
        <svg className="map" viewBox="0 0 1200 660" role="img" aria-labelledby="map-title map-desc">
            <title id="map-title">What I run</title>
            <desc id="map-desc">Traffic from the internet hits my edge router, then a Caddy gateway that checks every request against Authentik. Behind it are GitLab, Guacamole, a game server, and a Docker host that runs this site and HamBot. The house's HamLab cluster has vSphere, TrueNAS, Active Directory with a PKI, and Wazuh. A Raspberry Pi runs Flight Wall. GitHub Actions builds the containers and the Docker host deploys them.</desc>

            {zones.map(zone => <g key={zone.label} className="zone" style={{ ["--d" as string]: zone.d + "s" }}>
                <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="2" pathLength={1} />
                <text x={zone.x + 16} y={zone.y + 24} className="map-label">{zone.label}</text>
            </g>)}

            {wires.map(wire => <path key={wire.path} d={wire.path} pathLength={1}
                className={"wire" + (wire.main ? " main" : "")} style={{ ["--d" as string]: wire.d + "s" }} />)}

            {nodes.map(node => <g key={node.title} className="node" style={{ ["--d" as string]: node.d + "s" }}>
                <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="2" pathLength={1} />
                <text x={node.x + 14} y={node.y + (node.sub ? 28 : 31)} className="node-title">{node.title}</text>
                {node.sub && <text x={node.x + 14} y={node.y + 48} className="node-sub">{node.sub}</text>}
            </g>)}

            <g className="node" style={{ ["--d" as string]: "1.2s" }}>
                <rect x="940" y="70" width="210" height="260" rx="2" pathLength={1} />
                <text x="954" y="98" className="node-title">RaskalDev</text>
                <text x="954" y="116" className="node-sub">Docker · Dockhand</text>
                {containers.map((name, i) => <g key={name} className={i === 0 ? "here" : ""}>
                    <rect x="954" y={132 + i * 38} width="182" height="30" rx="1" />
                    <text x="966" y={151 + i * 38} className="node-sub">{name}</text>
                </g>)}
                <text x="1126" y="151" textAnchor="end" className="map-label here-label">you are here</text>
            </g>

            <path className="antenna" d="M1130 450 V404 M1121 414 H1139 M1124 424 H1136 M1127 434 H1133" pathLength={1} style={{ ["--d" as string]: "1.8s" }} />

            <circle className="packet" r="4">
                <animateMotion dur="3.2s" repeatCount="indefinite" path="M180 282 H920 V147 H940" />
            </circle>
        </svg>
    </InView>
    </>;
}

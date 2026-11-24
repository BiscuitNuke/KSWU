"use client";
import { useEffect, useRef, useState } from "react";

const img = (n: string) => ({ src: "/images/roamarc/" + n + "-800.webp", srcSet: "/images/roamarc/" + n + "-420.webp 420w, /images/roamarc/" + n + "-800.webp 800w" });

/* ── Four tabs, Apple-style: a progress bar runs, the screen changes, you can tap ahead. ── */
const tabs = [
    { k: "Drive", img: "drivecard", lead: "Hit start and drive.", pts: ["Exploration mode collects roads as you go.", "Speedrun mode times a free drive or a saved route.", "Live Activity on the lock screen and in CarPlay."] },
    { k: "Explore", img: "passport", lead: "Your map fills in.", pts: ["Real towns and townships from Census boundaries.", "A town's percentage only shows once every road in it is loaded.", "A passport for towns, counties, states, parks, and byways."] },
    { k: "Roadbook", img: "roadbook", lead: "Every drive, kept.", pts: ["Name, search, and favorite your drives.", "Replay a trip at up to 64× with speed and distance.", "39 badges, weekly challenges, and yearly recaps."] },
    { k: "Garage", img: "skins", lead: "Make it yours.", pts: ["Add your cars. Each drive counts toward its mileage.", "System, light, dark, OLED, and six skins.", "Game Center leaderboards for unique roads."] },
];

export function RoamTabs() {
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    const root = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = root.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
        io.observe(el); return () => io.disconnect();
    }, []);
    useEffect(() => {
        if (paused || !visible || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const t = setTimeout(() => setI(v => (v + 1) % tabs.length), 5200);
        return () => clearTimeout(t);
    }, [i, paused, visible]);
    const t = tabs[i];
    return <section className="ra-tabs" ref={root} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label="RoamArc's four tabs">
        <div className="ra-tabs-copy">
            <p className="label">Four tabs</p>
            <div className="ra-tablist" role="tablist">
                {tabs.map((x, k) => <button key={x.k} role="tab" aria-selected={k === i} className={k === i ? "on" : ""} onClick={() => setI(k)}>
                    {x.k}<span className="ra-bar"><i key={i + "-" + k} className={k === i && !paused && visible ? "run" : ""} /></span>
                </button>)}
            </div>
            <div className="ra-tabpanel" role="tabpanel" key={t.k}>
                <h3>{t.lead}</h3>
                <ul>{t.pts.map(p => <li key={p}>{p}</li>)}</ul>
            </div>
        </div>
        <div className="ra-tabs-phone">
            <div className="ra-phone small">
                <div className="ra-island" />
                {tabs.map((x, k) => <img key={x.k} {...img(x.img)} sizes="(max-width: 600px) 56vw, 280px" width={800} height={1739} alt={"RoamArc " + x.k + " tab"} className={"ra-shot" + (k === i ? " on" : "")} loading="lazy" decoding="async" />)}
            </div>
        </div>
    </section>;
}

/* ── Gallery: a slow marquee of more screens. Hover to pause. ── */
const gallery = ["replay", "parks", "annual", "heatmap", "badges", "regions", "garage", "drive"];
export function RoamGallery() {
    const row = [...gallery, ...gallery];
    return <section className="ra-gallery" aria-label="More RoamArc screens">
        <div className="ra-track">
            {row.map((g, k) => <div className="ra-tile" key={k} aria-hidden={k >= gallery.length}>
                <img {...img(g)} sizes="200px" width={800} height={1739} alt={k < gallery.length ? "RoamArc screen: " + g : ""} loading="lazy" decoding="async" />
            </div>)}
        </div>
    </section>;
}

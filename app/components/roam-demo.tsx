"use client";
import { useEffect, useRef } from "react";

// RoamArc, told like a product film. The section pins, and scrolling plays it:
// a road draws itself behind the phone, the screen changes, the copy swaps, stat chips pop.
// Real screenshots from the app's preview set (demo data only).
const scenes = [
    { img: "welcome", kicker: "RoamArc", title: ["Discover", "the drive."], sub: "An iPhone app that turns the roads you already drive into something you collect.", chip: "iOS · SwiftUI" },
    { img: "drive", kicker: "Drive", title: ["Every road", "counts."], sub: "Start a drive and forget about it. New roads light up as you go.", chip: "+1 new road" },
    { img: "heatmap", kicker: "Recap", title: ["Watch it", "draw."], sub: "Every drive comes back as a map you can replay, colored by speed.", chip: "14.8 mph avg" },
    { img: "regions", kicker: "Regions", title: ["Fill in", "the map."], sub: "Towns, counties, states. See how much of each one you've actually driven.", chip: "50 roads" },
    { img: "badges", kicker: "Roadbook", title: ["Earn the", "long way."], sub: "Badges and quests for taking the road you haven't.", chip: "8 / 39 badges" },
    { img: "garage", kicker: "Garage", title: ["Bring", "your ride."], sub: "Your cars, your stats, your skin. Drives are private until you share them.", chip: "2 in garage" },
];

const ROAD = "M-40 620 C 120 560, 160 420, 300 400 S 520 470, 600 330 S 760 120, 920 180 S 1120 360, 1240 240";

export function RoamDemo() {
    const root = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = root.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el?.classList.add("static"); return; }
        let kill = () => {};
        Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/MotionPathPlugin")]).then(([{ gsap }, { ScrollTrigger }, { MotionPathPlugin }]) => {
            gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
            const ctx = gsap.context(() => {
                const shots = gsap.utils.toArray<HTMLElement>(".ra-shot");
                const copies = gsap.utils.toArray<HTMLElement>(".ra-copy-item");
                const chips = gsap.utils.toArray<HTMLElement>(".ra-chip");
                const dots = gsap.utils.toArray<HTMLElement>(".ra-dots i");
                gsap.set(shots.slice(1), { autoAlpha: 0, yPercent: 6, scale: 0.97 });
                gsap.set(copies.slice(1), { autoAlpha: 0, y: 40 });
                gsap.set(chips, { autoAlpha: 0, scale: 0.6 });
                gsap.set(".ra-road-line", { strokeDashoffset: 1 });

                const tl = gsap.timeline({
                    defaults: { ease: "power2.inOut" },
                    scrollTrigger: { trigger: el, start: "top top", end: "+=" + scenes.length * 90 + "%", pin: ".ra-stage", scrub: 0.8, anticipatePin: 1 },
                });
                tl.to(".ra-road-line", { strokeDashoffset: 0, ease: "none", duration: scenes.length }, 0);
                tl.to(".ra-car", { motionPath: { path: ".ra-road-line", align: ".ra-road-line", alignOrigin: [0.5, 0.5], autoRotate: true }, ease: "none", duration: scenes.length }, 0);
                tl.to(".ra-phone", { rotateY: -8, rotateX: 4, duration: scenes.length / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
                tl.to(chips[0], { autoAlpha: 1, scale: 1, duration: 0.25 }, 0.05);
                dots[0]?.classList.add("on");
                scenes.forEach((_, i) => {
                    if (!i) return;
                    const t = i - 0.35;
                    tl.to(shots[i - 1], { autoAlpha: 0, yPercent: -6, scale: 0.97, duration: 0.35 }, t)
                        .to(shots[i], { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.35 }, t + 0.05)
                        .to(copies[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, t)
                        .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.3 }, t + 0.1)
                        .to(chips[i - 1], { autoAlpha: 0, scale: 0.6, duration: 0.2 }, t)
                        .to(chips[i], { autoAlpha: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, t + 0.15);
                });
                tl.to({}, { duration: 0.4 });
                let cur = 0;
                tl.eventCallback("onUpdate", () => {
                    const i = Math.min(scenes.length - 1, Math.max(0, Math.floor(tl.time() + 0.15)));
                    if (i !== cur) { cur = i; dots.forEach((d, k) => d.classList.toggle("on", k === i)); }
                });
            }, el);
            kill = () => ctx.revert();
        });
        return () => kill();
    }, []);

    return <section className="ra-demo" ref={root} aria-label="RoamArc product demo">
        <div className="ra-stage">
            <svg className="ra-road" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <path className="ra-road-base" d={ROAD} />
                <path className="ra-road-line" d={ROAD} pathLength={1} />
                <g className="ra-car"><rect x="-14" y="-8" width="28" height="16" rx="5" /><circle cx="9" cy="0" r="2.4" /></g>
            </svg>
            <div className="ra-copy">
                {scenes.map(s => <div className="ra-copy-item" key={s.img}>
                    <p className="ra-kicker">{s.kicker}</p>
                    <h2>{s.title[0]}<br /><span>{s.title[1]}</span></h2>
                    <p className="ra-sub">{s.sub}</p>
                </div>)}
                <div className="ra-dots" aria-hidden="true">{scenes.map(s => <i key={s.img} />)}</div>
            </div>
            <div className="ra-device">
                <div className="ra-phone">
                    <div className="ra-island" />
                    {scenes.map((s, i) => <img key={s.img} className="ra-shot" src={"/images/roamarc/" + s.img + "-800.webp"}
                        srcSet={"/images/roamarc/" + s.img + "-420.webp 420w, /images/roamarc/" + s.img + "-800.webp 800w"} sizes="(max-width: 600px) 60vw, 320px"
                        width={800} height={1739} alt={"RoamArc " + s.kicker.toLowerCase() + " screen"} loading={i ? "lazy" : "eager"} decoding="async" />)}
                </div>
                {scenes.map(s => <span className="ra-chip" key={s.img}>{s.chip}</span>)}
            </div>
        </div>
    </section>;
}

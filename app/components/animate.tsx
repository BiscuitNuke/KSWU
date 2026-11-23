"use client";
import { useEffect, useRef } from "react";

// GSAP runs every drawing. Mark up the SVG, this does the rest:
//   .draw          strokes trace on (pathLength=1, offset 1 → 0), timed by --d
//   .fade          fades up after its stroke
//   data-flow="n"  n dots ride the path forever (data-dur = seconds per lap)
//   data-seq       one dot walks the child .step paths in order, then repeats
//   data-blink     LED blink at random intervals
//   data-spin="s"  spins forever, s seconds per turn
//   data-stream    dashes run along the path (coolant, fiber light)
//   data-cycle     shows its [data-frame] children one at a time
//   data-pulse     ripples out and fades, over and over
//   data-unit="k"  hover lights up itself and every [data-unit-label="k"]
// Loops pause when the drawing is off screen. Reduced motion gets the static drawing.

type GSAP = typeof import("gsap").gsap;

const SVGNS = "http://www.w3.org/2000/svg";

function delayOf(el: Element) {
    return parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
}

function dot(path: SVGPathElement, hot: boolean, r = 3.5) {
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("r", String(r));
    c.setAttribute("class", "flow-dot" + (hot ? " hot" : ""));
    path.parentNode?.insertBefore(c, path.nextSibling);
    return c;
}

function build(root: HTMLElement, gsap: GSAP, ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger) {
    const intro = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
    const loops: gsap.core.Animation[] = [];

    root.querySelectorAll<SVGElement>(".draw").forEach(el => {
        intro.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.25 }, delayOf(el) * 0.85);
    });
    root.querySelectorAll<SVGElement>(".fade").forEach(el => {
        intro.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.out" }, delayOf(el) * 0.85 + 0.45);
    });
    root.querySelectorAll<SVGElement>("[data-fill]").forEach(el => {
        intro.fromTo(el, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.6, ease: "power2.out" }, delayOf(el) * 0.85 + 0.6);
    });

    const start = intro.duration() * 0.7;

    root.querySelectorAll<SVGPathElement>("[data-flow]").forEach(path => {
        const n = parseInt(path.dataset.flow || "1") || 1;
        const dur = parseFloat(path.dataset.dur || "2.4");
        const hot = path.classList.contains("hot") || !!path.closest(".hot");
        for (let i = 0; i < n; i++) {
            const c = dot(path, hot, hot ? 4 : 2.6);
            gsap.set(c, { opacity: 0 });
            loops.push(gsap.timeline({ repeat: -1, delay: start + (i * dur) / n })
                .set(c, { opacity: 1 })
                .to(c, { duration: dur, ease: "none", motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } })
                .set(c, { opacity: 0 }));
        }
    });

    root.querySelectorAll<SVGGElement>("[data-seq]").forEach(group => {
        const steps = Array.from(group.querySelectorAll<SVGPathElement>(".step"));
        if (!steps.length) return;
        const c = dot(steps[0], true, 5);
        gsap.set(c, { opacity: 0 });
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, delay: start + 0.4 });
        tl.set(c, { opacity: 1 });
        steps.forEach(step => {
            tl.to(c, { duration: 0.75, ease: "power1.inOut", motionPath: { path: step, align: step, alignOrigin: [0.5, 0.5] } });
            tl.to(c, { duration: 0.15 });
        });
        tl.to(c, { opacity: 0, duration: 0.3 });
        loops.push(tl);
    });

    // A few blinks at random gaps, looped, so no two LEDs match.
    root.querySelectorAll<SVGElement>("[data-blink]").forEach(el => {
        const tl = gsap.timeline({ repeat: -1, delay: start + Math.random() });
        for (let i = 0; i < 4; i++) tl.to(el, { opacity: 0.15, duration: 0.07, yoyo: true, repeat: 1 }, "+=" + gsap.utils.random(0.3, 3.2).toFixed(2));
        loops.push(tl);
    });

    root.querySelectorAll<SVGElement>("[data-spin]").forEach(el => {
        loops.push(gsap.to(el, { rotation: 360, transformOrigin: "50% 50%", duration: parseFloat(el.dataset.spin || "3"), ease: "none", repeat: -1 }));
    });

    root.querySelectorAll<SVGPathElement>("[data-stream]").forEach(el => {
        loops.push(gsap.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -parseFloat(el.dataset.stream || "40"), duration: 1, ease: "none", repeat: -1 }));
        intro.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8 }, start);
    });

    root.querySelectorAll<SVGElement>("[data-pulse]").forEach((el, i) => {
        loops.push(gsap.fromTo(el, { opacity: 0, scale: 0.6, transformOrigin: el.dataset.pulse || "0% 50%" },
            { opacity: 1, scale: 1.15, duration: 1.4, ease: "power1.out", repeat: -1, delay: start + i * 0.35, repeatDelay: 0.4, yoyo: false }));
    });

    root.querySelectorAll<SVGGElement>("[data-cycle]").forEach(group => {
        const frames = Array.from(group.querySelectorAll<SVGGElement>("[data-frame]"));
        if (frames.length < 2) return;
        gsap.set(frames, { opacity: 0 });
        gsap.set(frames[0], { opacity: 1 });
        const tl = gsap.timeline({ repeat: -1, delay: start });
        frames.forEach((frame, i) => {
            const next = frames[(i + 1) % frames.length];
            tl.to(frame, { opacity: 0, duration: 0.25, ease: "steps(3)" }, "+=2.6")
                .fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "steps(3)" });
        });
        loops.push(tl);
    });

    // Hover: light up a unit and its label together.
    root.querySelectorAll<SVGElement>("[data-unit]").forEach(unit => {
        const k = unit.dataset.unit;
        const mates = root.querySelectorAll(`[data-unit-label="${k}"]`);
        unit.addEventListener("pointerenter", () => { unit.classList.add("lit"); mates.forEach(m => m.classList.add("lit")); });
        unit.addEventListener("pointerleave", () => { unit.classList.remove("lit"); mates.forEach(m => m.classList.remove("lit")); });
    });

    loops.forEach(l => l.pause());
    ScrollTrigger.create({ trigger: root, start: "top 82%", once: true, onEnter: () => intro.play() });
    ScrollTrigger.create({
        trigger: root, start: "top bottom", end: "bottom top",
        onToggle: self => loops.forEach(l => (self.isActive ? l.resume() : l.pause())),
    });
}

export function Animated({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.classList.add("is-in");
            return;
        }
        let dead = false;
        let revert = () => {};
        Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/MotionPathPlugin")]).then(([{ gsap }, { ScrollTrigger }, { MotionPathPlugin }]) => {
            if (dead) return;
            gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
            el.classList.add("gsap");
            const ctx = gsap.context(() => build(el, gsap, ScrollTrigger), el);
            revert = () => {
                ctx.revert();
                el.querySelectorAll(".flow-dot").forEach(d => d.remove());
            };
        });
        return () => { dead = true; revert(); };
    }, []);

    return <div ref={ref} className={className}>{children}</div>;
}

// Smooth scroll, same feel as Nullify. Keeps ScrollTrigger in sync.
export function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let stop = () => {};
        Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
            gsap.registerPlugin(ScrollTrigger);
            const lenis = new Lenis({ lerp: 0.1, anchors: true });
            lenis.on("scroll", ScrollTrigger.update);
            const tick = (t: number) => lenis.raf(t * 1000);
            gsap.ticker.add(tick);
            gsap.ticker.lagSmoothing(0);
            stop = () => { gsap.ticker.remove(tick); lenis.destroy(); };
        });
        return () => stop();
    }, []);
    return null;
}

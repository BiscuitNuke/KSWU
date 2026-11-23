"use client";
import { useEffect, useRef, useState } from "react";

// Phones: tap a drawing to open it full screen. Pan by dragging, pinch or use +/- to zoom.
export function ZoomButton({ title }: { title: string }) {
    const btn = useRef<HTMLButtonElement>(null);
    const [svg, setSvg] = useState<string | null>(null);
    const [z, setZ] = useState(2);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svg) return;
        document.documentElement.classList.add("zoom-open");
        const esc = (e: KeyboardEvent) => e.key === "Escape" && setSvg(null);
        window.addEventListener("keydown", esc);
        // start centered
        requestAnimationFrame(() => { const b = box.current; if (b) { b.scrollLeft = (b.scrollWidth - b.clientWidth) / 2; b.scrollTop = (b.scrollHeight - b.clientHeight) / 2; } });
        return () => { document.documentElement.classList.remove("zoom-open"); window.removeEventListener("keydown", esc); };
    }, [svg]);

    const open = () => {
        const fig = btn.current?.closest("figure");
        const s = fig && Array.from(fig.querySelectorAll("svg")).find(el => !el.closest("button"));
        if (s) setSvg(s.outerHTML);
    };

    return <>
        <button ref={btn} type="button" className="zoom-btn" onClick={open} aria-label={"Open " + title + " full screen"}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" /></svg>
        </button>
        {svg && <div className="zoom-view" role="dialog" aria-modal="true" aria-label={title}>
            <div className="zoom-bar">
                <span>{title}</span>
                <button type="button" onClick={() => setZ(v => Math.max(1, v - 0.5))} aria-label="Zoom out">−</button>
                <button type="button" onClick={() => setZ(v => Math.min(4, v + 0.5))} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => setSvg(null)} aria-label="Close">✕</button>
            </div>
            <div className="zoom-pane" ref={box} data-lenis-prevent>
                <div className="zoom-inner" style={{ width: z * 100 + "%" }} dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
        </div>}
    </>;
}

"use client";
import { useState } from "react";

// Drag across to reveal the real photo under the trace.
// box = where the photo sits inside the drawing, in % of its width.
export function Compare({ box, label, children }: { box: { left: number; width: number }; label: string; children: React.ReactNode }) {
    const [v, setV] = useState(55);
    return <div className="compare" style={{ ["--hide" as string]: 100 - v + "%" }}>
        {children}
        <div className="compare-track" style={{ left: box.left + "%", width: box.width + "%" }}>
            <div className="compare-handle" style={{ left: v + "%" }}><span>photo · trace</span></div>
            <input type="range" min={0} max={100} value={v} aria-label={label} onChange={e => setV(Number(e.target.value))} />
        </div>
    </div>;
}

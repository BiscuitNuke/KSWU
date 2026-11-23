"use client";
import { createElement, useEffect, useRef, useState } from "react";

// Same idea as MaskText on Nullify, minus framer-motion.
// Adds "is-in" once the element scrolls into view. CSS does the rest.
function useInView<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.2 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, inView };
}

export function MaskText({ lines, as = "h2", id, className = "" }: { lines: string[]; as?: "h1" | "h2" | "p"; id?: string; className?: string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    return <div ref={ref} className={"mask " + (inView ? "is-in " : "") + className}>
        {createElement(as, { id }, lines.map((line, i) =>
            <span className="mask-line" key={line}>
                <span style={{ transitionDelay: i * 0.1 + "s" }}>{line}</span>
            </span>
        ))}
    </div>;
}

export function InView({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    return <div ref={ref} className={(inView ? "is-in " : "") + className}>{children}</div>;
}

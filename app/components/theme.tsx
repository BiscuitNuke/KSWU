"use client";
import { useEffect, useState } from "react";

// Runs before paint (inlined in <head>) so the page never flashes the wrong theme.
export const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

export function ThemeToggle() {
    const [theme, setTheme] = useState<string | null>(null);
    useEffect(() => { setTheme(document.documentElement.dataset.theme || "dark"); }, []);
    const flip = () => {
        const next = theme === "light" ? "dark" : "light";
        const apply = () => {
            document.documentElement.dataset.theme = next;
            try { localStorage.setItem("theme", next); } catch { /* private mode */ }
            setTheme(next);
            document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f3efe8" : "#070606");
        };
        const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
        if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
        else apply();
    };
    const light = theme === "light";
    return <button type="button" className="theme-btn" onClick={flip} aria-label={light ? "Switch to dark mode" : "Switch to light mode"} title={light ? "Dark mode" : "Light mode"}>
        {light
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>}
    </button>;
}

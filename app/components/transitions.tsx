"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Page-to-page fade using the browser's View Transitions API.
// Browsers without it (Firefox today) just navigate like normal.
export function PageTransitions() {
    const router = useRouter();
    const path = usePathname();
    const done = useRef<(() => void) | null>(null);

    useEffect(() => { done.current?.(); done.current = null; }, [path]);

    useEffect(() => {
        const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
        if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const click = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = (e.target as Element).closest("a");
            if (!a || a.target || a.hasAttribute("download")) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin || url.pathname === location.pathname) return;
            e.preventDefault();
            doc.startViewTransition!(() => new Promise<void>(res => {
                done.current = res;
                setTimeout(res, 1500);
                router.push(url.pathname + url.search + url.hash);
            }));
        };
        document.addEventListener("click", click, true);
        return () => document.removeEventListener("click", click, true);
    }, [router]);

    return null;
}

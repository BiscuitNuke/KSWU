"use client";

import React from "react";
import { gsap } from "gsap";

interface CornerBadgeProps {
  label?: string;
  popupTitle?: string;
  popupText?: string;
}

export default function CornerBadge({
  label = "NEW",
  popupTitle = "What's New",
  popupText = "This is a new feature.",
}: CornerBadgeProps) {
  const [open, setOpen] = React.useState(false);
  const popupRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep ribbon static: no entrance or hover movement animations

  // Animate popup when it opens
  React.useEffect(() => {
    if (open && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { autoAlpha: 0, y: -8, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
      );
    }
  }, [open]);

  return (
    <div className="fixed top-0 right-0 z-50 select-none">
      {/* Diagonal corner ribbon */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="corner-badge-popup"
        onClick={() => setOpen((v) => !v)}
        title="View what's new"
        className="relative block w-44 h-44 text-white pointer-events-auto"
      >
        <span
          className="absolute top-6 -right-14 rotate-45 w-[220px] h-8 bg-red-600 text-white text-xs font-bold uppercase tracking-wide shadow-xl flex items-center justify-center"
          style={{ transformOrigin: "center" }}
        >
          {label}
        </span>
      </button>

      {open ? (
        <div
          id="corner-badge-popup"
          role="dialog"
          aria-modal="true"
          className="fixed top-16 right-16 z-50 w-72 rounded-lg border border-red-600 bg-zinc-900/95 text-zinc-100 shadow-2xl backdrop-blur-sm"
          ref={popupRef}
        >
          <div className="flex items-start justify-between gap-3 px-3 py-2 border-b border-zinc-800">
            <h2 className="text-sm font-semibold">{popupTitle}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="px-3 py-3 text-sm leading-6">
            {popupText}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";
export default function PrintResume() {
    return <button className="button print-button" onClick={() => window.print()}>Print / save as PDF</button>;
}

import "../global.css";
import type { Metadata } from "next";
import LocalFont from "next/font/local";
import { profile } from "../lib/profile";

export const metadata: Metadata = {
    metadataBase: new URL("https://ksw.dev"),
    title: { default: "ksw.dev — Kieran Wittstruck", template: "%s | ksw.dev" },
    description: "I build networks, run too many servers, and work on keeping them secure. Cybersecurity BS/MS at RIT. Infrastructure, security engineering, and incident response.",
    openGraph: { title: "Kieran Wittstruck", description: profile.focus, url: "https://ksw.dev", siteName: "ksw.dev", type: "website" },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
};

// Same two fonts the old ksw.dev used. Naut for labels, Bee for the wordmark.
const naut = LocalFont({ src: "../public/fonts/naut.ttf", variable: "--font-naut", display: "swap" });
const bee = LocalFont({ src: "../public/fonts/bee.ttf", variable: "--font-bee", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <html lang="en" className={naut.variable + " " + bee.variable}>
        <body>
            <a className="skip-link" href="#main">Skip to content</a>
            {children}
        </body>
    </html>;
}

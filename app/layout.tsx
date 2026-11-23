import "../global.css";
import type { Metadata, Viewport } from "next";
import LocalFont from "next/font/local";
import { profile } from "../lib/profile";
import { SmoothScroll } from "./components/animate";
import { PageTransitions } from "./components/transitions";

const description = "Cybersecurity BS/MS at RIT. I build networks, run a homelab with my own SSO, and work on keeping it all secure. Looking for infrastructure, security engineering, and IR work.";

export const metadata: Metadata = {
    metadataBase: new URL("https://ksw.dev"),
    title: { default: "Kieran Wittstruck — ksw.dev", template: "%s | ksw.dev" },
    description,
    // The link preview. Discord, iMessage, Slack, and LinkedIn all read these.
    openGraph: {
        title: "Kieran Wittstruck",
        description,
        url: "https://ksw.dev",
        siteName: "ksw.dev",
        type: "website",
        images: [{ url: "/og.png", width: 1200, height: 630, alt: "ksw.dev: I build networks. Then I figure out how they break." }],
    },
    twitter: { card: "summary_large_image", title: "Kieran Wittstruck", description, images: ["/og.png"] },
    robots: { index: true, follow: true },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/icon.png", type: "image/png", sizes: "512x512" },
        ],
        apple: "/apple-icon.png",
    },
};

// Discord uses this for the color bar on the embed.
export const viewport: Viewport = { themeColor: "#f2850d" };

// Same two fonts the old ksw.dev used. Naut for labels, Bee for the wordmark.
const naut = LocalFont({ src: "../public/fonts/naut.ttf", variable: "--font-naut", display: "swap" });
const bee = LocalFont({ src: "../public/fonts/bee.ttf", variable: "--font-bee", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <html lang="en" className={naut.variable + " " + bee.variable}>
        <body>
            <SmoothScroll />
            <PageTransitions />
            <a className="skip-link" href="#main">Skip to content</a>
            {children}
        </body>
    </html>;
}

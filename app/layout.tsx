import "../global.css";
import type { Metadata } from "next";
import { profile } from "../lib/profile";

export const metadata: Metadata = {
    metadataBase: new URL("https://ksw.dev"),
    title: { default: "Kieran Wittstruck — Infrastructure & Security", template: "%s | Kieran Wittstruck" },
    description: "Infrastructure, security engineering, and incident response. Selected work and experience from Kieran Wittstruck, a cybersecurity B.S./M.S. student at RIT.",
    openGraph: { title: "Kieran Wittstruck", description: profile.focus, url: "https://ksw.dev", siteName: "ksw.dev", type: "website" },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}

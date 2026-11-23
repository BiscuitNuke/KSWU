import Link from "next/link";
import { profile } from "../../lib/profile";

export default function Footer() {
    return <footer className="site-footer">
        <div className="wrap footer-row">
            <p>Kieran Wittstruck · {profile.location} · {profile.callsign}</p>
            <div className="footer-links">
                <a href={profile.github}>GitHub</a>
                <a href={profile.linkedin}>LinkedIn</a>
                <a href={profile.chipnuke}>Chipnuke</a>
                <a href={"mailto:" + profile.email}>Email</a>
            </div>
        </div>
        {/* The old homepage title, back as an outline. */}
        <Link href="/" className="footer-mark" aria-label="ksw.dev home">KSW.dev</Link>
        <p className="wrap footer-note">Self-hosted on Raskal. Pushed to GitHub, deployed by a bot.</p>
    </footer>;
}

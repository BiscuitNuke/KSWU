import Link from "next/link";
import { profile } from "../../lib/profile";

export default function Footer() {
    return <footer className="site-footer wrap">
        <div><Link className="wordmark" href="/">ksw<span>.</span>dev</Link><p>Kieran Wittstruck · {profile.location}</p></div>
        <div className="footer-links">
            <a href={profile.github}>GitHub</a><a href={profile.linkedin}>LinkedIn</a>
            <a href={profile.chipnuke}>Chipnuke</a>
            <a href={"mailto:" + profile.email}>Email</a>
        </div>
    </footer>;
}

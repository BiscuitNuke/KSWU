import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { profile } from "../../lib/profile";

export const metadata = { title: "Contact" };

const socials = [
    { label: "Email", handle: profile.email, href: "mailto:" + profile.email },
    { label: "LinkedIn", handle: "Kieran Wittstruck", href: profile.linkedin },
    { label: "GitHub", handle: "@BiscuitNuke", href: profile.github },
    { label: "Radio", handle: profile.callsign, href: "https://www.qrz.com/db/" + profile.callsign },
];

export default function Contact() {
    return <>
        <Navigation />
        <main className="wrap inner-page" id="main">
            <p className="label">Contact</p>
            <MaskText as="h1" lines={["Say hi."]} />
            <p className="page-lead">
                I'm looking for infrastructure, security engineering, or incident response work after December 2027.
                Also happy to just talk about any of the projects here. Email's the fastest way to reach me.
            </p>
            <ul className="social-list">
                {socials.map(s => <li key={s.label}>
                    <a href={s.href}><span className="label">{s.label}</span><span className="social-handle">{s.handle}</span></a>
                </li>)}
            </ul>
            <p className="muted">RIT Cybersecurity BS May 2027, MS December 2027. Based in {profile.location}. <Link className="text-link" href="/resume/">Resume</Link></p>
            <p className="pgp-line">PGP · <a className="text-link" href="/pgp.asc">pgp.asc</a> · E31A 2EAC 2821 6EF1 71E6 3534 C64E D3AA 54AD 6937</p>
        </main>
        <Footer />
    </>;
}

import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { profile } from "../../lib/profile";
export const metadata = { title: "Contact" };
export default function Contact() {
    return <><Navigation /><main className="wrap inner-page contact-page" id="main"><p className="eyebrow">Contact</p><h1>Let’s put<br /><span>something to work.</span></h1><p className="page-lead">I’m looking for opportunities in infrastructure, security engineering, and incident response. I’m also happy to talk about the projects here.</p><a className="contact-email" href={"mailto:" + profile.email}>{profile.email}</a><div className="contact-links"><a href={profile.linkedin}>LinkedIn</a><a href={profile.github}>GitHub</a><Link href="/resume/">Resume</Link></div><div className="availability"><h2>RIT · Cybersecurity B.S./M.S.</h2><p>B.S. expected May 2027. M.S. expected December 2027.</p><p>Based in {profile.location}.</p></div></main><Footer /></>;
}

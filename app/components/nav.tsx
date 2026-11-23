import Link from "next/link";

export function Navigation() {
    return <header className="site-header wrap">
        <Link className="wordmark" href="/" aria-label="Kieran Wittstruck home">ksw<span>.</span>dev</Link>
        <nav aria-label="Main navigation">
            <Link href="/#work">Work</Link>
            <Link href="/#experience">Experience</Link>
            <Link href="/resume/">Resume</Link>
            <Link href="/contact/" className="nav-contact">Get in touch</Link>
        </nav>
    </header>;
}

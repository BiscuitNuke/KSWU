import Link from "next/link";

// Old site had "Projects | Contact". Kept the pipe.
const navigation = [
    { name: "Work", href: "/#work", wide: true },
    { name: "Lab", href: "/#lab", wide: true },
    { name: "Writeups", href: "/writeups/" },
    { name: "Now", href: "/now/" },
    { name: "Resume", href: "/resume/", wide: true },
];

export function Navigation() {
    return <header className="site-header wrap">
        <Link className="wordmark" href="/" aria-label="ksw.dev home">ksw<span>.</span>dev</Link>
        <nav aria-label="Main">
            {navigation.map(item => <Link key={item.href} href={item.href} className={item.wide ? "nav-wide" : undefined}>{item.name}</Link>)}
            <span className="pipe" aria-hidden="true">|</span>
            <Link href="/contact/" className="nav-contact">Contact</Link>
        </nav>
    </header>;
}

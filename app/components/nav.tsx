import Link from "next/link";

// Old site had "Projects | Contact". Kept the pipe.
const navigation = [
    { name: "Work", href: "/#work" },
    { name: "Lab", href: "/#lab" },
    { name: "Resume", href: "/resume/" },
];

export function Navigation() {
    return <header className="site-header wrap">
        <Link className="wordmark" href="/" aria-label="ksw.dev home">ksw<span>.</span>dev</Link>
        <nav aria-label="Main">
            {navigation.map(item => <Link key={item.href} href={item.href}>{item.name}</Link>)}
            <span className="pipe" aria-hidden="true">|</span>
            <Link href="/contact/" className="nav-contact">Contact</Link>
        </nav>
    </header>;
}

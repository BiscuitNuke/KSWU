import Link from "next/link";
import { ThemeToggle } from "./theme";

// Old site had "Projects | Contact". Kept the pipe.
const navigation = [
    { name: "Projects", href: "/projects/" },
    { name: "Lab", href: "/#lab", wide: true },
    { name: "Writeups", href: "/writeups/", wide: true },
    { name: "Now", href: "/now/", wide: true },
    { name: "Resume", href: "/resume/" },
];

export function Navigation() {
    return <header className="site-header wrap">
        <Link className="wordmark" href="/" aria-label="ksw.dev home">ksw<span>.</span>dev</Link>
        <nav aria-label="Main">
            {navigation.map(item => <Link key={item.href} href={item.href} className={item.wide ? "nav-wide" : undefined}>{item.name}</Link>)}
            <span className="pipe" aria-hidden="true">|</span>
            <Link href="/contact/" className="nav-contact">Contact</Link>
            <ThemeToggle />
        </nav>
    </header>;
}

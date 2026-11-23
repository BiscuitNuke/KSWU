import Link from "next/link";
import { Navigation } from "./components/nav";
import Footer from "./components/footer";
export default function NotFound() {
    return <><Navigation /><main id="main" className="wrap inner-page"><p className="eyebrow">404 / Page not found</p><h1>This page<br /><span>isn’t here.</span></h1><p className="page-lead">The portfolio has changed. You can find the current projects on the homepage.</p><Link className="button" href="/#work">View selected work</Link></main><Footer /></>;
}

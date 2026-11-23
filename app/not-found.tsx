import Link from "next/link";
import { Navigation } from "./components/nav";
import Footer from "./components/footer";

export default function NotFound() {
    return <>
        <Navigation />
        <main id="main" className="wrap inner-page">
            <p className="label">404</p>
            <h1 className="big">Nothing here.</h1>
            <p className="page-lead">Either I moved it or it never existed. The gateway let you in, though, so that part works.</p>
            <Link className="button" href="/">Back home</Link>
        </main>
        <Footer />
    </>;
}

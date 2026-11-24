import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { getNow, niceDate } from "../../lib/content";
import { NowBoard } from "../components/pages";

export const metadata = { title: "Now", description: "What I'm working on right now." };

export default function NowPage() {
    const now = getNow();
    return <>
        <Navigation />
        <main id="main" className="wrap case">
            <p className="label">/now · updated {niceDate(now.updated)}</p>
            <MaskText as="h1" lines={["Right now."]} className="case-title" />
            <div className="glow-line" aria-hidden="true" />
            <NowBoard />
            <article className="prose" dangerouslySetInnerHTML={{ __html: now.html }} />
            <p className="muted small-note">This is a <a className="text-link" href="https://nownownow.com/about">now page</a>. If you haven't talked to me in a while, this is what I'd tell you.</p>
        </main>
        <Footer />
    </>;
}

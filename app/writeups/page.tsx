import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { getWriteups, niceDate } from "../../lib/content";
import { GitLog } from "../components/pages";

export const metadata = { title: "Writeups", description: "Build logs and the stuff that broke along the way." };

export default function WriteupsPage() {
    const posts = getWriteups();
    return <>
        <Navigation />
        <main id="main" className="wrap case">
            <p className="label">Writeups</p>
            <MaskText as="h1" lines={["Notes from", "the lab."]} className="case-title" />
            <div className="glow-line" aria-hidden="true" />
            <GitLog posts={posts.map(p => ({ slug: p.slug, title: p.title, date: p.date }))} />
            <ol className="post-list">
                {posts.map(p => <li key={p.slug}>
                    <Link className="post-row" href={"/writeups/" + p.slug + "/"}>
                        <span className="post-date">{niceDate(p.date)}</span>
                        <span className="post-title">{p.title}</span>
                        <span className="post-summary">{p.summary}</span>
                        <span className="post-tags">{p.tags.join(" · ")} · {p.minutes} min read</span>
                    </Link>
                </li>)}
            </ol>
        </main>
        <Footer />
    </>;
}

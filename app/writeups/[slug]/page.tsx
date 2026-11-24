import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "../../components/nav";
import Footer from "../../components/footer";
import { getWriteup, getWriteups, niceDate } from "../../../lib/content";
import { ReadingAids } from "../../components/pages";

export const dynamicParams = false;

export function generateStaticParams() {
    return getWriteups().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const post = getWriteup((await params).slug);
    return { title: post?.title || "Not found", description: post?.summary, openGraph: { title: post?.title, description: post?.summary, type: "article" } };
}

export default async function WriteupPage({ params }: { params: Promise<{ slug: string }> }) {
    const post = getWriteup((await params).slug);
    if (!post) notFound();
    return <>
        <Navigation />
        <main id="main" className="wrap case">
            <Link className="text-link back" href="/writeups/">All writeups</Link>
            <p className="label">{niceDate(post.date)} · {post.minutes} min read · {post.tags.join(" · ")}</p>
            <h1 className="post-h1">{post.title}</h1>
            <p className="case-summary">{post.summary}</p>
            <div className="glow-line" aria-hidden="true" />
            <div className="post-grid">
                <article className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
                <ReadingAids />
            </div>
        </main>
        <Footer />
    </>;
}

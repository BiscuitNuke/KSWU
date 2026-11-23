import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "../../components/nav";
import Footer from "../../components/footer";
import { MaskText, InView } from "../../components/reveal";
import { ProjectDrawing } from "../../components/drawings";
import { getProject, projects } from "../../../lib/profile";

export const dynamicParams = false;

export function generateStaticParams() {
    return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const project = getProject((await params).slug);
    return { title: project?.name || "Not found", description: project?.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const project = getProject((await params).slug);
    if (!project) notFound();

    const i = projects.findIndex(p => p.slug === project.slug);
    const next = projects[(i + 1) % projects.length];

    return <>
        <Navigation />
        <main id="main" className="wrap case">
            <Link className="text-link back" href="/#work">All work</Link>
            <p className="label">{String(i + 1).padStart(2, "0")} / {project.kind} / {project.dates}</p>
            <MaskText as="h1" lines={[project.name + "."]} className="case-title" />
            <div className="glow-line" aria-hidden="true" />
            <div className="case-intro">
                <p className="case-summary">{project.summary}</p>
                <div>
                    <p className="label">Status</p>
                    <p className="status">{project.status}</p>
                    <p className="label">Stack</p>
                    <p className="muted">{project.stack}</p>
                </div>
            </div>

            <InView className="facts">
                {project.facts.map(fact => <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}
            </InView>

            <div className="case-drawing"><ProjectDrawing slug={project.slug} /></div>

            <div className="case-body">
                <section>
                    <p className="label">What it is</p>
                    {project.story.map(p => <p key={p}>{p}</p>)}
                </section>
                <section>
                    <p className="label">What I did</p>
                    <ul className="did">{project.did.map(item => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                    <p className="label">What broke</p>
                    <ul className="did broke">{project.broke.map(item => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                    <p className="label">Where it's at</p>
                    <p>{project.now}</p>
                </section>
            </div>

            {project.photos && <div className="case-photos">
                {project.photos.map(photo => <figure key={photo.src}>
                    <img src={photo.src} srcSet={photo.src.replace("-1200", "-720") + " 720w, " + photo.src + " 1200w"} sizes="(max-width: 600px) 100vw, 33vw" width={photo.w} height={photo.h} alt={photo.alt} loading="lazy" decoding="async" />
                    <figcaption>{photo.alt}</figcaption>
                </figure>)}
            </div>}

            <Link className="next-project" href={"/projects/" + next.slug + "/"}>
                <span className="label">Next</span>
                <span className="next-name">{next.name}</span>
            </Link>
        </main>
        <Footer />
    </>;
}

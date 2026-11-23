import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation } from "../../components/nav";
import Footer from "../../components/footer";
import ProjectVisual from "../../components/project-visual";
import { getProject, projects } from "../../../lib/profile";
export const dynamicParams = false;
export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const project = getProject((await params).slug);
    return { title: project?.name || "Project not found", description: project?.summary };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const project = getProject((await params).slug);
    if (!project) notFound();
    return <><Navigation /><main id="main" className="wrap case-study">
        <Link className="text-link" href="/#work">Selected work</Link>
        <div className="case-heading"><p className="eyebrow">{project.category} / {project.dates}</p><h1>{project.name}<span>.</span></h1><p className="case-summary">{project.summary}</p><p className="project-tools">{project.tools}</p></div>
        {project.slug === "hamlab" ? <figure className="case-photo"><img src="/images/hamlab/Hamlab2.jpg" alt="The HamLab equipment rack, including four Dell PowerEdge servers." width="1414" height="2501" /><figcaption>HamLab / an existing build photograph.</figcaption></figure> : <div className={"case-visual project-" + project.slug}><ProjectVisual slug={project.slug} /></div>}
        <div className="case-body"><section><p className="eyebrow">Context</p><h2>What I worked on.</h2><p>{project.context}</p></section>
        <section><p className="eyebrow">My contribution</p><h2>The decisions behind it.</h2>{project.decisions.map(decision => <div className="case-decision" key={decision.title}><h3>{decision.title}</h3><p>{decision.text}</p></div>)}</section>
        <section><p className="eyebrow">Result & current scope</p><h2>Where it stands.</h2><p>{project.result}</p><p className="scope-note">{project.limits}</p></section>
        <div className="case-end"><Link className="text-link" href="/#work">More selected work</Link><Link className="text-link" href="/contact/">Get in touch</Link></div></div>
    </main><Footer /></>;
}

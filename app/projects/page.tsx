import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { projects } from "../../lib/profile";
export const metadata = { title: "Selected work" };
export default function Projects() {
    return <><Navigation /><main className="wrap inner-page" id="main"><p className="eyebrow">Selected work</p><h1>Infrastructure.<br /><span>With security built in.</span></h1><div className="index-projects">{projects.map(project => <article key={project.slug}><p className="eyebrow">{project.category} · {project.dates}</p><h2><Link href={"/projects/" + project.slug + "/"}>{project.name}</Link></h2><p>{project.summary}</p><Link className="text-link" href={"/projects/" + project.slug + "/"}>Read the project</Link></article>)}</div></main><Footer /></>;
}

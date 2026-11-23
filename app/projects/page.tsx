import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { work } from "../../lib/profile";

export const metadata = { title: "Work" };

export default function Projects() {
    return <>
        <Navigation />
        <main className="wrap inner-page" id="main">
            <p className="label">Work</p>
            <MaskText as="h1" lines={["Stuff I've built."]} />
            <p className="page-lead">Some for school, most because I wanted it to exist.</p>
            <ol className="work-list">
                {work.map((project, i) => <li key={project.slug}>
                    <Link className="work-row" href={"/projects/" + project.slug + "/"}>
                        <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="work-name">{project.name}</span>
                        <span className="work-summary">{project.summary}</span>
                        <span className="work-meta"><span>{project.kind}</span><span className="status">{project.status}</span></span>
                    </Link>
                </li>)}
            </ol>
        </main>
        <Footer />
    </>;
}

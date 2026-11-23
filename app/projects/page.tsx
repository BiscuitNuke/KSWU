import Link from "next/link";
import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { projects } from "../../lib/profile";

export const metadata = { title: "Projects", description: "Everything I've built: the lab, the bots, the apps, and the truck." };

export default function Projects() {
    return <>
        <Navigation />
        <main className="wrap inner-page" id="main">
            <p className="label">Projects · {projects.length}</p>
            <MaskText as="h1" lines={["Everything", "I've built."]} />
            <p className="page-lead">The lab, the bots, the apps, and the truck. Some for school, most because I wanted it to exist.</p>
            <ol className="work-list">
                {projects.map((project, i) => <li key={project.slug}>
                    <Link className="work-row" href={"/projects/" + project.slug + "/"} data-profile={project.name.toUpperCase() + "|TYPE:" + project.kind + "|STATUS:" + project.status + "|SINCE:" + project.dates + "|THREAT:low"}>
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

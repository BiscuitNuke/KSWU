import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { MaskText } from "../components/reveal";
import { projects } from "../../lib/profile";
import { ProjectFilter } from "../components/pages";

export const metadata = { title: "Projects", description: "Everything I've built: the lab, the bots, the apps, and the truck." };

export default function Projects() {
    return <>
        <Navigation />
        <main className="wrap inner-page" id="main">
            <p className="label">Projects · {projects.length}</p>
            <MaskText as="h1" lines={["Everything", "I've built."]} />
            <p className="page-lead">The lab, the bots, the apps, and the truck. Some for school, most because I wanted it to exist.</p>
            <ProjectFilter projects={projects.map(({ slug, name, kind, status, dates, summary }) => ({ slug, name, kind, status, dates, summary }))} />
        </main>
        <Footer />
    </>;
}

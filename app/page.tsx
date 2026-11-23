import Link from "next/link";
import { Navigation } from "./components/nav";
import Footer from "./components/footer";
import Activity from "./components/activity";
import ProjectVisual from "./components/project-visual";
import { experience, profile, projects, skills } from "../lib/profile";

export default function Home() {
    return <>
        <Navigation />
        <main id="main">
            <section className="hero wrap" aria-labelledby="intro-title">
                <div className="hero-copy">
                    <p className="eyebrow">Infrastructure / Security / Response</p>
                    <h1 id="intro-title">Kieran<br /><span>Wittstruck.</span></h1>
                    <p className="hero-lead">I build the systems.<br />Then work on keeping them secure.</p>
                    <p className="hero-intro">I’m a cybersecurity B.S./M.S. student at RIT, working on production networks and running a lab of my own. My work connects infrastructure, identity, and detection.</p>
                    <div className="hero-links"><Link className="button" href="/#work">Explore my work</Link><Link className="text-link" href="/resume/">Read my resume</Link></div>
                </div>
                <figure className="hero-photo">
                    <img src="/images/hamlab/Hamlab2.jpg" alt="My HamLab rack with network equipment, four Dell PowerEdge servers, and UPS units." width="1414" height="2501" fetchPriority="high" />
                    <figcaption><span>Built at home. Operated by me.</span><span>HamLab / build record</span></figcaption>
                </figure>
                <div className="hero-context"><span>Currently at RIT ITS Network Communications</span><span>B.S. May 2027 · M.S. Dec. 2027</span></div>
            </section>

            <section className="work-section wrap" id="work" aria-labelledby="work-title">
                <div className="section-heading"><div><p className="eyebrow">Selected work</p><h2 id="work-title">From the network<br />to the access boundary.</h2></div><p>Systems I operate, controls I’ve implemented, and analysis I’ve worked through.</p></div>
                <div className="project-list">
                    {projects.map(project => <article className={"project-row project-" + project.slug} key={project.slug}>
                        <div className="project-copy">
                            <div className="project-meta"><span>{project.category}</span><span>{project.dates}</span></div>
                            <h3><Link href={"/projects/" + project.slug + "/"}>{project.name}</Link></h3>
                            <p>{project.summary}</p><p className="project-tools">{project.tools}</p>
                            <Link className="text-link" href={"/projects/" + project.slug + "/"}>Read the project</Link>
                        </div>
                        <ProjectVisual slug={project.slug} />
                    </article>)}
                </div>
            </section>

            <section className="experience-section wrap" id="experience" aria-labelledby="experience-title">
                <div className="section-heading"><div><p className="eyebrow">Professional experience</p><h2 id="experience-title">Work beyond the lab.</h2></div><Link className="text-link" href="/resume/">Full resume</Link></div>
                {experience.map(job => <article className="experience-row" key={job.company}>
                    <div><p className="experience-date">{job.dates}</p><h3>{job.company}</h3><p className="muted">{job.team}</p></div>
                    <div><h4>{job.role}</h4>{job.note && <p className="job-note">{job.note}</p>}<ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul></div>
                </article>)}
            </section>

            <section className="practice-section wrap" aria-labelledby="practice-title">
                <div><p className="eyebrow">How the work connects</p><h2 id="practice-title">Infrastructure.<br />Identity.<br /><span>Visibility.</span></h2><p className="practice-intro">These are the areas I’m building experience in—and the work I want to do next.</p></div>
                <div className="skills-list">{skills.map(skill => <div key={skill.name}><h3>{skill.name}</h3><p>{skill.tools}</p></div>)}<div><h3>Education & credentials</h3><p>RIT · Cybersecurity B.S./M.S.<br />B.S. May 2027 · M.S. December 2027 expected.<br />CompTIA Security+ CE · Active through May 2027.<br />FCC General Class · K2KSW.</p></div></div>
            </section>

            <section className="activity-section wrap" aria-labelledby="activity-title">
                <div className="section-heading"><div><p className="eyebrow">Public project activity</p><h2 id="activity-title">Still building.</h2></div><p>Recent commits from selected public repositories. For the full picture, read the case studies above.</p></div><Activity />
            </section>

            <section className="personal-section wrap"><p className="eyebrow">Outside the day job</p><p>I also shoot photographs, work on engines, and track aircraft over the radio. Experiments and less formal project notes have a home at <a className="text-link" href={profile.chipnuke}>Chipnuke</a>.</p></section>

            <section className="contact-section wrap" aria-labelledby="contact-title"><p className="eyebrow">Let’s talk</p><h2 id="contact-title">Have a system<br />I should work on?</h2><p>I’m interested in infrastructure, security engineering, and incident response roles—co-ops and full-time opportunities as I finish my degrees.</p><a className="contact-email" href={"mailto:" + profile.email}>{profile.email}</a><div className="contact-links"><a href={profile.linkedin}>LinkedIn</a><a href={profile.github}>GitHub</a><Link href="/resume/">Resume</Link></div></section>
        </main><Footer />
    </>;
}

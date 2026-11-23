import Link from "next/link";
import { Navigation } from "./components/nav";
import Footer from "./components/footer";
import Activity from "./components/activity";
import SystemMap from "./components/system-map";
import { MaskText, InView } from "./components/reveal";
import { experience, offClock, profile, projects, skills } from "../lib/profile";

export default function Home() {
    return <>
        <Navigation />
        <main id="main">
            <section className="hero wrap" aria-labelledby="hero-title">
                <p className="label hero-label">Kieran Wittstruck — Rochester, NY</p>
                <MaskText as="h1" id="hero-title" className="hero-title" lines={["I build networks.", "Then I figure out", "how they break."]} />
                <div className="glow-line" aria-hidden="true" />
                <div className="hero-grid">
                    <p className="hero-lead">
                        I'm a cybersecurity BS/MS student at RIT and a network tech on RIT's NetComm team.
                        At home I run a vSphere cluster, my own SSO, and a Discord bot that patches my servers.
                        This site runs on that stuff too.
                    </p>
                    <div className="hero-side">
                        <p className="label">Looking for</p>
                        <p>Infrastructure, security engineering, or incident response. Full-time after I finish my MS in December 2027.</p>
                        <div className="hero-links">
                            <Link className="button" href="/#work">See the work</Link>
                            <Link className="text-link" href="/resume/">Resume</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lab-section" id="lab" aria-labelledby="lab-title">
                <div className="wrap section-head">
                    <p className="label">01 / The lab</p>
                    <MaskText id="lab-title" lines={["What's running", "right now."]} />
                    <p className="section-note">All of this is real and in my house. This page is one of the boxes.</p>
                </div>
                <div className="wrap"><SystemMap /></div>
            </section>

            <section className="work-section wrap" id="work" aria-labelledby="work-title">
                <div className="section-head">
                    <p className="label">02 / Work</p>
                    <MaskText id="work-title" lines={["Stuff I've built."]} />
                    <p className="section-note">Some for school, most because I wanted it to exist.</p>
                </div>
                <ol className="work-list">
                    {projects.map((project, i) => <li key={project.slug}>
                        <Link className="work-row" href={"/projects/" + project.slug + "/"}>
                            <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
                            <span className="work-name">{project.name}</span>
                            <span className="work-summary">{project.summary}</span>
                            <span className="work-meta"><span>{project.kind}</span><span className="status">{project.status}</span></span>
                        </Link>
                    </li>)}
                </ol>
            </section>

            <section className="exp-section wrap" id="experience" aria-labelledby="exp-title">
                <div className="section-head">
                    <p className="label">03 / Experience</p>
                    <MaskText id="exp-title" lines={["Where I work."]} />
                </div>
                {experience.map(job => <InView className="exp-row" key={job.company}>
                    <div>
                        <p className="label">{job.dates}</p>
                        <h3>{job.company}</h3>
                        <p className="muted">{job.team}</p>
                    </div>
                    <div>
                        <h4>{job.role}</h4>
                        {job.note && <p className="muted">{job.note}</p>}
                        <ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul>
                    </div>
                </InView>)}
                <div className="skills">
                    {skills.map(skill => <div key={skill.name}><p className="label">{skill.name}</p><p>{skill.tools}</p></div>)}
                    <div><p className="label">School & certs</p><p>RIT Cybersecurity BS (May 2027) / MS (Dec 2027). Security+ CE. FCC General, {profile.callsign}. 3rd at IRSeC 2024.</p></div>
                </div>
            </section>

            <section className="off-section wrap" aria-labelledby="off-title">
                <div className="section-head">
                    <p className="label">04 / Off the clock</p>
                    <MaskText id="off-title" lines={["The rest of me."]} />
                </div>
                <dl className="off-list">
                    {offClock.map(item => <div key={item.label}><dt className="label">{item.label}</dt><dd>{item.text}</dd></div>)}
                </dl>
                <p className="section-note">The less serious stuff goes on <a className="text-link" href={profile.chipnuke}>Chipnuke</a>.</p>
            </section>

            <section className="activity-section wrap" aria-labelledby="activity-title">
                <div className="section-head">
                    <p className="label">05 / Commits</p>
                    <h2 id="activity-title" className="small-title">Still building.</h2>
                </div>
                <Activity />
            </section>

            <section className="contact-section wrap" aria-labelledby="contact-title">
                <p className="label">06 / Contact</p>
                <MaskText id="contact-title" lines={["Got a system", "I should work on?"]} />
                <a className="contact-email" href={"mailto:" + profile.email}>{profile.email}</a>
                <div className="contact-links">
                    <a href={profile.linkedin}>LinkedIn</a>
                    <a href={profile.github}>GitHub</a>
                    <Link href="/resume/">Resume</Link>
                </div>
            </section>
        </main>
        <Footer />
    </>;
}

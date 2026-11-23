import Link from "next/link";
import { Navigation } from "./components/nav";
import Footer from "./components/footer";
import SystemMap from "./components/system-map";
import { Rack, NodeN2, Desktop, Icon, Fig } from "./components/drawings";
import { MaskText, InView } from "./components/reveal";
import { experience, offClock, profile, skills, work } from "../lib/profile";

const build = {
    sha: (process.env.GITHUB_SHA || "local").slice(0, 7),
    date: new Date().toISOString().slice(0, 10),
};

const terminal = [
    { cmd: "whoami", out: "kieran wittstruck · K2KSW" },
    { cmd: "cat roles", out: "infrastructure · security engineering · IR" },
    { cmd: "ls ~/builds", out: "hamlab/  raskal/  hambot/  flightwall/  roamarc/" },
    { cmd: "git log -1 --oneline", out: build.sha + " · built " + build.date },
];

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
                    <div className="term" aria-label="Terminal readout">
                        <div className="term-bar"><span /><span /><span /><em>kieran@ksw.dev: ~</em></div>
                        <div className="term-body">
                            {terminal.map((line, i) => <div className="term-line" key={line.cmd} style={{ ["--i" as string]: i }}>
                                <p><b>$</b> {line.cmd}</p>
                                <p className="term-out">{line.out}</p>
                            </div>)}
                            <p className="term-line" style={{ ["--i" as string]: terminal.length }}><b>$</b> <i className="cursor" /></p>
                        </div>
                    </div>
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
                <div className="wrap"><Fig n="01" title="Everything I run, one page" meta="live layout · no IPs"><SystemMap /></Fig></div>
            </section>

            <section className="metal-section wrap" id="metal" aria-labelledby="metal-title">
                <div className="section-head">
                    <p className="label">02 / The metal</p>
                    <MaskText id="metal-title" lines={["Three boxes", "I actually run."]} />
                    <p className="section-note">The real hardware behind the map. Built, racked, and wired by me. Drawn simple on purpose.</p>
                </div>
                <div className="metal-grid">
                    <div className="metal-rack">
                        <Fig n="02" title="HamLab rack" meta="basement · 48U" className="fig-rack"><Rack /></Fig>
                        <p className="metal-copy">Every Ethernet run in the house lands here. Four PowerEdge hosts run vSphere HA. The HL15 is TrueNAS, their shared storage over iSCSI. The UDM up top is the edge for everything. <Link className="text-link" href="/projects/hamlab/">HamLab</Link></p>
                    </div>
                    <div className="metal-side">
                        <Fig n="03" title="N2 · Raskal" meta="under my monitor"><NodeN2 /></Fig>
                        <p className="metal-copy">One MS-01 runs every Raskal VM: the gateway, Authentik, GitLab, the game server, and the Docker host this site is on. 10G fiber back to the rack, and a GL.iNet Comet KVM on top for when ESXi won't answer. <Link className="text-link" href="/projects/raskal/">Raskal</Link></p>
                        <Fig n="04" title="The desk PC" meta="2 systems · 1 loop"><Desktop /></Fig>
                        <p className="metal-copy">Two PCs in one case on one hardline loop, with twin reservoirs. Yes, there's a playing card in there.</p>
                    </div>
                </div>
            </section>

            <section className="work-section wrap" id="work" aria-labelledby="work-title">
                <div className="section-head">
                    <p className="label">03 / Work</p>
                    <MaskText id="work-title" lines={["Stuff I've built."]} />
                    <p className="section-note">Some for school, most because I wanted it to exist.</p>
                </div>
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
            </section>

            <section className="exp-section wrap" id="experience" aria-labelledby="exp-title">
                <div className="section-head">
                    <p className="label">04 / Experience</p>
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
                    <div><p className="label">School & certs</p><p>RIT Cybersecurity BS (May 2027) / MS (Dec 2027). Security+ CE. FCC General, {profile.callsign}. 3rd at IRSeC 2024. Education Chair, Pi Kappa Phi.</p></div>
                </div>
            </section>

            <section className="off-section wrap" aria-labelledby="off-title">
                <div className="section-head">
                    <p className="label">05 / Off the clock</p>
                    <MaskText id="off-title" lines={["The rest of me."]} />
                </div>
                <dl className="off-list">
                    {offClock.map(item => <div key={item.label}>
                        <Icon name={item.label} />
                        <dt className="label">{item.label}</dt>
                        <dd>{item.text}</dd>
                        {item.href && <dd><Link className="text-link" href={item.href}>{item.link}</Link></dd>}
                    </div>)}
                </dl>
                <p className="section-note">The less serious stuff goes on <a className="text-link" href={profile.chipnuke}>Chipnuke</a>.</p>
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

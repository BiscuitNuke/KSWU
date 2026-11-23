import { Navigation } from "../components/nav";
import Footer from "../components/footer";
import { experience, profile, projects, skills } from "../../lib/profile";
import PrintResume from "../components/print-resume";
export const metadata = { title: "Resume" };
export default function Resume() {
    return <><Navigation /><main className="wrap resume-page" id="main"><div className="resume-heading"><div><p className="label">Resume</p><h1>Kieran Wittstruck</h1><p>{profile.location} · <a href={"mailto:" + profile.email}>{profile.email}</a></p><p><a href={profile.linkedin}>LinkedIn</a> · <a href={profile.github}>GitHub</a></p></div><PrintResume /></div>
        <section><h2>Education</h2><h3>Rochester Institute of Technology</h3><p>B.S./M.S. in Cybersecurity · B.S. May 2027, M.S. December 2027 expected.</p><p>Coursework: cyber defense techniques, network security administration, reverse engineering, security policy.</p></section>
        <section><h2>Certifications</h2><p>CompTIA Security+ CE · May 2024, active through May 2027.</p><p>FCC Amateur Radio License · General Class · K2KSW.</p></section>
        <section><h2>Experience</h2>{experience.map(job => <article key={job.company}><div className="resume-job"><h3>{job.company}</h3><span>{job.dates}</span></div><p>{job.role}</p>{job.note && <p>{job.note}</p>}<ul>{job.points.map(point => <li key={point}>{point}</li>)}</ul></article>)}</section>
        <section><h2>Projects</h2>{projects.filter(project => project.kind !== "Garage").map(project => <article key={project.slug}><div className="resume-job"><h3><a href={"/projects/" + project.slug + "/"}>{project.name}</a></h3><span>{project.dates}</span></div><p>{project.stack}</p><ul>{project.did.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul></article>)}</section>
        <section><h2>Leadership & activities</h2><p>Associate Member Education Chair, Pi Kappa Phi: run education and onboarding for new members.</p><p>3rd Place, IRSeC 2024 (RITSEC): red vs. blue competition defending services against a student red team.</p><p>RITSEC, Film Photography Club; amateur radio, ADS-B tracking, engine rebuilds, photography.</p></section>
        <section><h2>Technical skills</h2>{skills.map(skill => <p key={skill.name}><strong>{skill.name}:</strong> {skill.tools}</p>)}<p><strong>Additional:</strong> Sentinel (personal lab), MITRE ATT&CK (risk registers), NIST CSF, CIS Controls, DNS/DNSSEC, DHCP, WAF, Azure, AWS.</p></section>
    </main><Footer /></>;
}

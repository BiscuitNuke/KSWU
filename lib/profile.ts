// Professional facts come from resume_master-6.pdf (November 2026).
// Edit this file when experience, availability, or case-study facts change.
export const profile = {
    name: "Kieran Wittstruck",
    email: "kieran@ksw.dev",
    location: "North Chili, New York",
    github: "https://github.com/BiscuitNuke",
    linkedin: "https://www.linkedin.com/in/kieranwittstruck/",
    chipnuke: "https://chipnuke.com",
    focus: "Infrastructure, security engineering & incident response",
    education: "B.S. Cybersecurity · May 2027 / M.S. Cybersecurity · December 2027",
};

export const experience = [
    {
        company: "Rochester Institute of Technology",
        team: "ITS Network Communications",
        role: "Network Communications Student Employee",
        dates: "Jan. 2026 — Present",
        note: "Network Communications Intern · May — Sep. 2026",
        points: [
            "Supported RIT’s campus-wide Wi-Fi 7 refresh, a project replacing 8,000+ wireless access points.",
            "Deploy enterprise switches, configure VLANs, and harden switch security across RIT’s production network.",
        ],
    },
    {
        company: "Vital Air Services",
        team: "Norcross, GA · Hybrid",
        role: "Website Developer & Information Technology Manager",
        dates: "Aug. 2023 — Present",
        note: "",
        points: ["Rebuilt the company site with HTTPS/TLS and WAF rules; run its mixed on-prem and cloud IT."],
    },
    {
        company: "iVue",
        team: "Cumming, GA",
        role: "System Administrator & Photographer",
        dates: "Apr. — Aug. 2023",
        note: "",
        points: ["Administered Windows Server and Active Directory across hybrid cloud and on-prem systems."],
    },
];

export const skills = [
    { name: "Infrastructure", tools: "ESXi / vCenter, Docker, K3s / Rancher, Windows Server, RHEL / Rocky Linux" },
    { name: "Identity & access", tools: "Authentik, OIDC, Active Directory, two-tier PKI, LDAPS, 802.1X / RADIUS" },
    { name: "Detection & monitoring", tools: "Wazuh, Prometheus, Loki, Grafana, Wireshark, incident response" },
    { name: "Networks & automation", tools: "JunOS, VLANs, iptables, Caddy, TLS, Python, PowerShell, Bash, Ansible" },
];

export type Project = {
    slug: string;
    name: string;
    category: string;
    dates: string;
    summary: string;
    tools: string;
    context: string;
    decisions: { title: string; text: string }[];
    result: string;
    limits: string;
};

export const projects: Project[] = [
    {
        slug: "raskal",
        name: "Raskal",
        category: "Identity & access",
        dates: "2026 — Present",
        summary: "One access platform for the services I run. Central identity, a hardened gateway, and a clear boundary between public and administrative access.",
        tools: "Authentik / OIDC / Caddy / GitLab / Guacamole / Docker",
        context: "I deployed Raskal as an SSO access platform for my services. It brings GitLab and Apache Guacamole under Authentik, with TOTP MFA and a shared Caddy gateway.",
        decisions: [
            { title: "Centralize identity.", text: "I configured Authentik as the identity provider and connected GitLab and Guacamole through OIDC single sign-on with TOTP MFA." },
            { title: "Define the access boundary.", text: "I put the applications behind Caddy with Authentik forward authentication, and blocked the identity provider’s administrative UI from outside access." },
            { title: "Keep useful records.", text: "I enabled JSON access logs and session recording, then hardened the edge with ACME TLS, HSTS, and security headers." },
            { title: "Treat maintenance as part of the system.", text: "I restricted container ports to administrative subnets with iptables and wrote nightly backups with Discord failure alerts." },
        ],
        result: "The platform provides centralized sign-on, MFA, and a consistent access boundary across the deployed services. Backups and failure alerts are part of the operating workflow.",
        limits: "This is a personally operated platform. The controls described here reflect the deployed project; they are not a claim of independent security certification.",
    },
    {
        slug: "hamlab",
        name: "HamLab",
        category: "Infrastructure & detection",
        dates: "2024 — Present",
        summary: "A working lab for virtualization, network segmentation, identity, and monitoring. Built on real hardware, with services I have to keep running.",
        tools: "ESXi / vCenter / Wazuh / Prometheus / JunOS / Active Directory / PKI",
        context: "I run ESXi 8 and vCenter on four Dell PowerEdge servers with 512 GB of RAM and 100 TB of storage, including an iSCSI high-availability cluster. The lab lets me work across networking, systems, and security rather than treating each as a separate exercise.",
        decisions: [
            { title: "Separate the lab from the household.", text: "I wired the house network and segmented household Wi-Fi from an isolated lab VLAN using Juniper and Ubiquiti equipment." },
            { title: "Make the infrastructure observable.", text: "I deployed Wazuh agents across lab VMs, and use Prometheus, Loki, and Grafana to monitor servers, switches, and storage through iDRAC, SNMP, and vCenter." },
            { title: "Build identity into the network.", text: "I run Active Directory, DNS, and FreeRADIUS 802.1X. A two-tier PKI backs LDAPS for vCenter." },
        ],
        result: "The lab combines virtualized services, segmented networking, centralized identity, security events, and infrastructure monitoring in one environment I operate.",
        limits: "Capacity figures describe the installed lab, not benchmark results. This project is ongoing; the photograph is an existing build record rather than a live inventory.",
    },
    {
        slug: "wannacry",
        name: "WannaCry analysis",
        category: "Malware analysis",
        dates: "CSEC 202 · Course project",
        summary: "Static and dynamic malware analysis, working through the sample with IDA, x32dbg, and x86 assembly.",
        tools: "IDA / x32dbg / x86 assembly",
        context: "For CSEC 202, I analyzed WannaCry using basic and advanced static analysis in IDA, alongside basic and advanced dynamic analysis in x32dbg.",
        decisions: [
            { title: "Read the code.", text: "I used IDA and x86 assembly for the static-analysis portion of the coursework." },
            { title: "Examine execution.", text: "I used x32dbg for the dynamic-analysis portion, complementing the static work." },
        ],
        result: "Completed a course project covering both static and dynamic malware-analysis techniques.",
        limits: "The course report and analysis artifacts are not published here. This summary does not claim original vulnerability research or findings beyond the completed coursework.",
    },
];

export function getProject(slug: string) {
    return projects.find(project => project.slug === slug);
}

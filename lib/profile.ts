// Everything the site says about me lives here.
// Pro facts come from my resume (Nov 2026). Project facts come from the repos.
// Keep it public-safe: no internal IPs, VLAN numbers, ports, or hostnames.
export const profile = {
    name: "Kieran Wittstruck",
    email: "kieran@ksw.dev",
    location: "North Chili, NY",
    github: "https://github.com/BiscuitNuke",
    linkedin: "https://www.linkedin.com/in/kieranwittstruck/",
    chipnuke: "https://chipnuke.com",
    callsign: "K2KSW",
    focus: "Infrastructure, security engineering & incident response",
};

export const experience = [
    {
        company: "RIT ITS",
        team: "Network Communications",
        role: "Network Communications Student Employee",
        dates: "Jan 2026 — now",
        note: "Network Communications Intern · May — Sep 2026",
        points: [
            "Helped roll out RIT's campus-wide Wi-Fi 7 refresh. That's 8,000+ access points getting swapped.",
            "Deploy enterprise switches, set up VLANs, and harden switch security on the production network.",
        ],
    },
    {
        company: "Vital Air Services",
        team: "Norcross, GA · Hybrid",
        role: "Website Developer & IT Manager",
        dates: "Aug 2023 — now",
        note: "",
        points: ["Rebuilt the company site with HTTPS/TLS and WAF rules. I also run their mix of on-prem and cloud IT."],
    },
    {
        company: "iVue",
        team: "Cumming, GA",
        role: "System Administrator & Photographer",
        dates: "Apr — Aug 2023",
        note: "",
        points: ["Ran Windows Server and Active Directory across hybrid cloud and on-prem systems."],
    },
];

export const skills = [
    { name: "Infrastructure", tools: "ESXi / vCenter, Docker, K3s / Rancher, Windows Server, RHEL / Rocky, TrueNAS" },
    { name: "Identity & access", tools: "Authentik, OIDC, Active Directory, two-tier PKI, LDAPS, 802.1X / RADIUS" },
    { name: "Detection & monitoring", tools: "Wazuh, Prometheus, Loki, Grafana, Wireshark, incident response" },
    { name: "Networks & automation", tools: "Junos, VLANs, iptables, Caddy, TLS, Python, PowerShell, Bash, Ansible" },
];

export type Project = {
    slug: string;
    name: string;
    kind: string;
    status: string;
    dates: string;
    summary: string;
    stack: string;
    facts: { value: string; label: string }[];
    story: string[];
    did: string[];
    now: string;
    broke: string[];
    photos?: { src: string; alt: string; w: number; h: number }[];
};

export const projects: Project[] = [
    {
        slug: "raskal",
        name: "Raskal",
        kind: "Identity & access",
        status: "Running",
        dates: "2026 — now",
        summary: "My own little enterprise. One login with MFA in front of everything I run, a hardened gateway at the edge, and boxes that update, back up, and report on themselves.",
        stack: "Authentik / OIDC / Caddy / GitLab / Guacamole / Docker / ESXi",
        facts: [
            { value: "1", label: "login for every app" },
            { value: "6", label: "VMs on one MS-01" },
            { value: "Nightly", label: "updates, backups, config commits" },
        ],
        story: [
            "I wanted to reach my stuff from anywhere without opening a pile of ports. So I built it like a company would. Raskal is the practice run for the bigger HamLab portal.",
            "Everything comes in through one gateway. The private apps behind it need an Authentik session first, and they only ever see traffic from that gateway. This site is the one public thing back there.",
        ],
        did: [
            "Set up Authentik as the identity provider. GitLab, Guacamole, and the game panel all sign in through OIDC with MFA.",
            "Put Caddy at the edge with forward auth, ACME TLS, HSTS, and security headers. The IdP admin UI isn't reachable from outside.",
            "Split it into zones on the UDM: a DMZ for the gateway, an internal zone for the apps, and a games zone that can't talk back in.",
            "Locked down Docker's published ports with iptables, since Docker skips the host firewall.",
            "Every VM commits its own config to Git each night. A secret scan runs first. If it finds anything, nothing gets pushed and I get a Discord ping.",
            "This site runs on it now. I moved it off Vercel in November 2026.",
        ],
        now: "Running every day. Next up is an SNI router so HamLab and Raskal can share one public IP.",
        broke: [
            "Docker skips the host firewall. My published ports were wide open until I put rules in the DOCKER-USER chain.",
            "Moving this site over, the gateway couldn't reach it. A tcpdump showed SYNs with no replies, and the culprit was my own iptables chain. I fixed it in the script that builds the rules, not with a one-off.",
            "Caddy doesn't reload on docker compose up -d. You have to restart it.",
        ],
    },
    {
        slug: "hamlab",
        name: "HamLab",
        kind: "Infrastructure & detection",
        status: "Running",
        dates: "2024 — now",
        summary: "The rack in my house. A vSphere cluster, real storage, real identity, and real monitoring. The house runs on it, so I can't just break it whenever I want.",
        stack: "ESXi / vCenter / TrueNAS / iSCSI / AD / PKI / Wazuh / Junos",
        facts: [
            { value: "512 GB", label: "RAM across the cluster" },
            { value: "100 TB", label: "raw storage" },
            { value: "2-tier", label: "PKI with an offline root" },
        ],
        story: [
            "HamLab started as a couple of boxes and a domain name. It's grown into the house's production environment. I wired every Ethernet run in the house myself and they all land at this rack.",
            "It's where I learn the stuff classes only talk about. If something's broken here, the house notices.",
        ],
        did: [
            "Built a vSphere HA cluster on Dell PowerEdge EPYC hosts, backed by TrueNAS over iSCSI with MPIO.",
            "Stood up Active Directory and a two-tier PKI: offline root, issuing CA, and working AIA/CDP. vCenter signs in over LDAPS.",
            "Segmented the network on a Juniper EX4400 core and UniFi. Household Wi-Fi stays away from the lab.",
            "Run FreeRADIUS for 802.1X, and Technitium for split-horizon DNS.",
            "Deployed Wazuh agents across the VMs. Prometheus, Loki, and Grafana watch servers, switches, and storage through iDRAC, SNMP, and vCenter.",
        ],
        now: "Always changing. Next is Wazuh tuning and a remote access portal using the same model as Raskal.",
        broke: [
            "iSCSI mutual CHAP kept failing with \"Invalid parameter\" from the ESXi side. One-way CHAP works. Mutual is still on the list.",
            "Swapped a PSU in the 45Drives HL15 and three backplane segments went dark. That one went to their support.",
            "LDAPS to vCenter wouldn't trust the cert until the PKI's AIA and CDP paths were published right. Both CA certs have to be there.",
            "On Junos, channelized subports have to be set per interface. Putting them in an interface-range block overlaps and breaks.",
        ],
        photos: [
            { src: "/images/hamlab/Hamlab1-1200.webp", w: 1200, h: 1600, alt: "The HamLab rack with servers and network gear." },
            { src: "/images/hamlab/Hamlab2-1200.webp", w: 1200, h: 2122, alt: "The patch panel and switches where the house wiring lands." },
        ],
    },
    {
        slug: "hambot",
        name: "HamBot",
        kind: "Automation & ops",
        status: "Running",
        dates: "2026 — now",
        summary: "A Discord bot for the house. Everyone at home uses it for chores and the cat's litter box. I use it to patch my VMs, check on things, and get alerts before stuff breaks.",
        stack: "Python / discord.py / Docker / GitHub Actions / GHCR / Dockhand",
        facts: [
            { value: "20", label: "modules" },
            { value: "15 min", label: "from push to running" },
            { value: "0", label: "third-party alert services" },
        ],
        story: [
            "This started as two webhooks: a morning cyber briefing and a ping when the Litter-Robot drawer got full. Now it's the house's control panel.",
            "One rule: nothing leaves my server. No hosted price trackers or alert services. If I need it, I build it and run it myself.",
        ],
        did: [
            "Each bot runs in its own container. GitHub Actions builds only what changed and pins the image. Dockhand sees the commit and swaps just that container.",
            "Wrote /update and /ops. They patch, snapshot, and reboot my Raskal VMs over SSH. Each VM only accepts a fixed set of commands from HamBot's key.",
            "Built pricewatch, a headless-browser price tracker, as its own container instead of signing up for a service.",
            "Morning and night digests: weather and SPC risk, power use from the Emporia monitor, chores, packages, and the litter box.",
            "Reads Flight Wall's API for rare and military aircraft alerts.",
        ],
        now: "Running. I keep adding modules when the house asks for something.",
        broke: [
            "GitLab CE can't pull-mirror. That's a paid feature. So I wrote a small container that pushes copies from GitHub every 15 minutes.",
            "The Litter-Robot carbon filter reset kept getting stuck. I pulled the feature instead of shipping something flaky.",
            "Letting a bot reboot servers is scary. Each VM only takes a fixed list of verbs from HamBot's key, so a bad command can't become a shell.",
        ],
    },
    {
        slug: "flight-wall",
        name: "Flight Wall",
        kind: "Hardware & radio",
        status: "On the wall",
        dates: "2026",
        summary: "An LED sign in my room that shows the planes flying over the house, decoded live by my own ADS-B receiver. It turns itself off at night because I sleep in there.",
        stack: "Raspberry Pi 4 / RTL-SDR / readsb / Python / HUB75 matrix",
        facts: [
            { value: "~100 nm", label: "range, up from 5" },
            { value: "256×64", label: "LED pixels" },
            { value: "1 min", label: "from git push to the wall" },
        ],
        story: [
            "I wanted something on my wall that was actually live. A USB SDR, a 1090 MHz filter, and an antenna jammed between my window and the screen got me about 100 nautical miles of planes.",
            "The Pi doesn't take SSH from outside. It pulls main from GitHub every minute and deploys itself. If a commit doesn't compile, it rolls back and never tries that one again.",
        ],
        did: [
            "Soldered the GPIO 4 to 18 jumper for hardware PWM. Flicker gone, ~176 Hz refresh.",
            "Wrote the board: airliners first, rare types highlighted, overhead alerts, distance and direction, logos, themes.",
            "Built a web control page with a live mirror of the panels, a map, stats, and a PIN lock.",
            "Self-deploy, daily backups to a Git branch, a network watchdog, and status reports pushed back to the repo.",
            "Feeds Flightradar24. Sends alerts through HamBot.",
        ],
        now: "On the wall and running. The 3D-printed mount is still on version two.",
        broke: [
            "The stock whip antenna got about 5 nm. Max gain gave zero messages. A real 1090 antenna in the window fixed it.",
            "The logo flickered at about 60 Hz until I soldered the PWM jumper.",
            "Under systemd there's no HOME, so git threw \"dubious ownership\" and the updater kept retrying a bad commit every minute.",
            "The Pi dropped off Wi-Fi at night. It got a watchdog that restarts Wi-Fi, then reboots.",
            "A smoke test on a fake panel caught a crash that py_compile missed. Now it runs before every push.",
        ],
    },
    {
        slug: "roamarc",
        name: "RoamArc",
        kind: "iOS app",
        status: "In progress",
        dates: "2026 — now",
        summary: "An iPhone app that turns driving into exploring. It tracks the roads you've actually driven, the towns you've covered, and gives you a reason to take the long way home.",
        stack: "Swift / SwiftUI / MapKit / ActivityKit / Live Activities",
        facts: [
            { value: "0", label: "third-party packages" },
            { value: "39", label: "badges to earn" },
            { value: "4", label: "tabs: Drive, Explore, Roadbook, Garage" },
        ],
        story: [
            "I road trip a lot. I drove Rochester to Spokane on I-90. I wanted an app that cared about where I'd been, not just where I'm going.",
            "A road only counts once you've actually moved along it. Driving through an intersection doesn't count. Getting that right took most of the work.",
            "Road data comes straight from the Census Bureau's TIGER service, and towns are real Census boundaries. No API keys, no accounts, no third-party code.",
        ],
        did: [
            "Road discovery from GPS movement, with nearby ambiguous roads held back so you can't get credit by accident.",
            "Drive recaps, town and state progress, badges, and NPS site details.",
            "Live Activities on the lock screen and in CarPlay's dashboard, including pause, finish, and delayed-GPS states.",
            "GPX import, private zones, and hidden endpoints so a shared recap doesn't give away where you live.",
            "Walking detection that pauses recording when you get out of the car, so a gas station stop doesn't count as a road.",
            "Speedrun mode: time a free drive or race a saved route in order.",
        ],
        now: "In progress. The full CarPlay app is waiting on Apple's category approval.",
        broke: [
            "Early builds gave you credit for a road just by passing its intersection. Now you have to actually move along it.",
            "Live Activity updates could land out of order and overwrite a finished drive with old data. Updates are ordered now.",
            "Town maps flickered while panning because every redraw rebuilt the shapes. Boundaries now wait for the camera to settle and build off the main thread.",
        ],
    },
    {
        slug: "wannacry",
        name: "WannaCry",
        kind: "Malware analysis",
        status: "Done",
        dates: "CSEC 202",
        summary: "I took WannaCry apart for my reverse engineering final, both statically and dynamically, down to the x86.",
        stack: "IDA / x32dbg / x86 assembly",
        facts: [
            { value: "4", label: "analysis phases" },
            { value: "x86", label: "read by hand" },
            { value: "2017", label: "the outbreak it came from" },
        ],
        story: [
            "This was my CSEC 202 final. Reading about ransomware is one thing. Stepping through it in a debugger is another.",
        ],
        did: [
            "Basic static analysis: strings, imports, and resources.",
            "Advanced static analysis in IDA, working through the disassembly.",
            "Basic and advanced dynamic analysis in x32dbg, watching what it actually does when it runs.",
        ],
        now: "Done. The report isn't public, and I'm not claiming any new research here. It's coursework.",
        broke: [
            "The kill-switch domain is sitting right there in the strings. Static analysis gets it before anything runs.",
            "Dynamic analysis only works in a box that can't reach anything, with a snapshot to roll back to.",
        ],
    },
    {
        slug: "baja",
        name: "Baja",
        kind: "Garage",
        status: "In the shop",
        dates: "2025 — now",
        summary: "A 2005 Subaru Baja Turbo with a stick. It's turning into a wardriving and overlanding rig, with a closed-deck engine to back it up.",
        stack: "IAG 750 closed-deck / FP Red turbo / ETS FMIC / ID1300 injectors",
        facts: [
            { value: "2005", label: "Baja Turbo, manual" },
            { value: "750", label: "closed-deck long block" },
            { value: "Rust", label: "the real enemy up here" },
        ],
        story: [
            "I'm a Subaru guy and I always wanted one. The Baja is half Outback, half pickup, and almost nobody bought one. That's exactly why I wanted it.",
            "The plan is servers and radios in the bed for wardriving, antennas on the roof, and enough gear to camp out of it.",
        ],
        did: [
            "Replaced control arms and CV axles first. Rochester salt eats old Subarus.",
            "Engine's being built at a shop: closed-deck IAG long block, FP Red turbo, front-mount intercooler, bigger injectors, dual-pump fuel.",
            "Planning the bed: power, networking, and radios for wardriving off-grid.",
        ],
        now: "In the shop. Then it's on to the wardriving setup.",
        broke: [
            "Rust. Control arms and CV axles were shot before I did anything fun.",
        ],
        photos: [
            { src: "/images/baja/baja-1200.webp", w: 1200, h: 1600, alt: "My 2005 Subaru Baja." },
            { src: "/images/baja/bajahood-1200.webp", w: 1200, h: 1600, alt: "Under the hood of the Baja." },
            { src: "/images/baja/bajaenginepull-1200.webp", w: 1200, h: 1600, alt: "The Baja's engine coming out." },
        ],
    },
];

// The stuff that doesn't fit on a resume.
export const offClock: { label: string; text: string; href?: string; link?: string }[] = [
    { label: "Photos", text: "Astro, lightning, and storm chasing on a Sony A7R V. Dark skies and supercells are worth the drive." },
    { label: "Subarus", text: "I daily a 2025 WRX tS on E50 and drove it Rochester to Spokane on I-90. The project car is a 2005 Baja Turbo.", href: "/projects/baja/", link: "The Baja build" },
    { label: "Radio", text: "General class, K2KSW. HF, mobile, and digital modes, plus the ADS-B antenna in my window." },
    { label: "FPV", text: "Building my first FPV quad from scratch. 3-inch, DJI O4 Pro. Cinewhoops are the end goal." },
];

// Baja is a garage project. It has a page but isn't in the work list.
export const work = projects.filter(project => project.kind !== "Garage");

export function getProject(slug: string) {
    return projects.find(project => project.slug === slug);
}

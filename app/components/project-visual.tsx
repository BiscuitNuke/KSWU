export default function ProjectVisual({ slug }: { slug: string }) {
    if (slug === "hamlab") {
        return <div className="lab-specs">
            <p className="eyebrow">The environment</p>
            <div><strong>4</strong><span>Dell PowerEdge servers</span></div>
            <div><strong>512<span> GB</span></strong><span>Installed memory</span></div>
            <div><strong>100<span> TB</span></strong><span>Storage capacity</span></div>
            <p className="visual-note">ESXi 8 / vCenter / iSCSI HA</p>
        </div>;
    }
    if (slug === "wannacry") {
        return <div className="analysis-visual">
            <p className="eyebrow">Two ways into the same sample</p>
            <div><span>Static analysis</span><strong>IDA</strong><small>Read the disassembly.</small></div>
            <div><span>Dynamic analysis</span><strong>x32dbg</strong><small>Examine execution.</small></div>
            <p className="visual-note">CSEC 202 / x86 assembly</p>
        </div>;
    }
    return <div className="access-visual">
        <p className="eyebrow">Raskal / simplified access model</p>
        <div className="access-row"><span>Edge</span><strong>Caddy</strong><small>TLS / forward auth</small></div>
        <div className="access-row identity"><span>Identity</span><strong>Authentik</strong><small>OIDC / TOTP MFA</small></div>
        <div className="access-apps"><span>GitLab</span><span>Guacamole</span></div>
        <p className="visual-note">Central identity. Consistent access.</p>
    </div>;
}

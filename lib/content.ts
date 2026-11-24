import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

// Markdown files with a small front matter block. Read at build time only.
const root = path.join(process.cwd(), "content");

function parse(file: string) {
    const raw = fs.readFileSync(file, "utf8");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const meta: Record<string, string> = {};
    (m ? m[1] : "").split("\n").forEach(line => {
        const i = line.indexOf(":");
        if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return { meta, html: marked.parse(m ? m[2] : raw, { async: false }) as string };
}

export type Writeup = { slug: string; title: string; date: string; summary: string; tags: string[]; html: string; minutes: number };

export function getWriteups(): Writeup[] {
    const dir = path.join(root, "writeups");
    return fs.readdirSync(dir).filter(f => f.endsWith(".md")).map(f => {
        const raw = fs.readFileSync(path.join(dir, f), "utf8");
        const { meta, html } = parse(path.join(dir, f));
        const minutes = Math.max(1, Math.round(raw.split(/\s+/).length / 220));
        return { slug: f.replace(/\.md$/, ""), title: meta.title, date: meta.date, summary: meta.summary, tags: (meta.tags || "").split(",").map(t => t.trim()).filter(Boolean), html, minutes };
    }).sort((a, b) => b.date.localeCompare(a.date));
}

export function getWriteup(slug: string) {
    return getWriteups().find(w => w.slug === slug);
}

export function getNow() {
    const { meta, html } = parse(path.join(root, "now.md"));
    return { updated: meta.updated, html };
}

export function niceDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

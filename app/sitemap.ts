import type { MetadataRoute } from "next";
import { projects } from "../lib/profile";
import { getWriteups } from "../lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
    return ["", "/projects", "/contact", "/resume", "/now", "/writeups", ...getWriteups().map(p => "/writeups/" + p.slug), ...projects.map(project => "/projects/" + project.slug)].map(path => ({ url: "https://ksw.dev" + path + "/" }));
}

import type { MetadataRoute } from "next";
import { projects } from "../lib/profile";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
    return ["", "/projects", "/contact", "/resume", ...projects.map(project => "/projects/" + project.slug)].map(path => ({ url: "https://ksw.dev" + path + "/" }));
}

import matter from "gray-matter";
import fs from "fs";
import path from "path";
import { marked } from "marked";

export interface ProjectData {
  slug: string;
  title: string;
  description: string;
  date?: string;
  url?: string;
  repository?: string;
  published: boolean;
  body: {
    code: string;
    frontmatter: Record<string, any>;
  };
}

const projectsDir = path.join(process.cwd(), "content/projects");

async function markdownToHtml(content: string): Promise<string> {
  try {
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    const html = marked.parse(content);
    return typeof html === "string" ? html : String(html);
  } catch (error) {
    console.error("Markdown to HTML error:", error);
    return `<p>Error rendering content: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
  }
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".mdx"));

  const projects: ProjectData[] = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(projectsDir, file);
      const source = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(source);

      const slug = file.replace(".mdx", "");

      try {
        const code = await markdownToHtml(content);

        return {
          slug,
          title: data.title || "",
          description: data.description || "",
          date: data.date,
          url: data.url,
          repository: data.repository,
          published: data.published !== false,
          body: {
            code,
            frontmatter: data,
          },
        };
      } catch (error) {
        console.error(`Error compiling MDX for ${slug}:`, error);
        return {
          slug,
          title: data.title || "",
          description: data.description || "",
          date: data.date,
          url: data.url,
          repository: data.repository,
          published: data.published !== false,
          body: {
            code: `<p>Error loading content</p>`,
            frontmatter: data,
          },
        };
      }
    })
  );

  return projects;
}export async function getProjectBySlug(slug: string): Promise<ProjectData | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) || null;
}

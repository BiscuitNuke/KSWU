import Link from "next/link";
import { getAllProjects } from "@/lib/mdx";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { Article } from "./article";

export const revalidate = 60;

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage(_props: PageProps) {
  const allProjects = await getAllProjects();
  const featured = allProjects.find((p) => p.slug === "ksw")!;
  const top2 = allProjects.find((p) => p.slug === "baja") ?? null;
  const top3 = allProjects.find((p) => p.slug === "hamlab") ?? null;

  const sorted = allProjects
    .filter((p) => p.published)
    .filter(
      (p) =>
        p.slug !== featured.slug &&
        (top2 ? p.slug !== top2.slug : true) &&
        (top3 ? p.slug !== top3.slug : true),
    )
    .sort(
      (a, b) =>
        new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
        new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
    );

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-display font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Projects
          </h2>
          <p className="mt-4 text-xl font-naut text-zinc-400">
            Some of the projects are from my job, but most of them are creative projects.
          </p>
        </div>

        <div className="w-full h-px bg-amber-800" />

        <div className="grid font-naut grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
          {/* Featured */}
          <Card>
            <Link href={`/projects/${featured.slug}`}>
              <article className="relative w-full h-full p-4 md:p-8 group">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-zinc-50">
                    {featured.date ? (
                      <time dateTime={new Date(String(featured.date)).toISOString()}>
                        {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                          new Date(String(featured.date)),
                        )}
                      </time>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>

                <h2
                  id="featured-post"
                  className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display"
                >
                  {featured.title}
                </h2>
                <p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
                  {featured.description}
                </p>
                <div className="absolute bottom-4 md:bottom-8">
                  <p className="hidden font-display text-zinc-200 hover:text-zinc-50 lg:block">
                    Read more <span aria-hidden="true">&rarr;</span>
                  </p>
                </div>
              </article>
            </Link>
          </Card>

          {/* Top two */}
          <div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0">
            {[top2, top3]
              .filter((p): p is NonNullable<typeof p> => p !== null)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
        </div>

        <div className="hidden w-full h-px md:block bg-zinc-800" />

        {/* 3-column masonry-like grid with your original spacing */}
        <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 0)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 1)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sorted
              .filter((_, i) => i % 3 === 2)
              .map((project) => (
                <Card key={project.slug}>
                  <Article project={project} />
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

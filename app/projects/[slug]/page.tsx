import { notFound } from "next/navigation";
import { allProjects } from "contentlayer/generated";
import MdxClient from "./MdxClient";
import { Header } from "./header";
import "./mdx.css";
import { ReportView } from "./view";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return allProjects
    .filter((p) => !!p.published)
    .map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const project =
    allProjects.find((p) => p.slug === slug) ?? notFound();

  return (
    <div className="bg-zinc-50 font-naut min-h-screen">
      <Header project={project} />
      <ReportView slug={project.slug} />
      <article className="px-4 font-naut py-12 text-lg mx-auto prose prose-zinc prose-quoteless">
        <MdxClient code={project.body.code} />
      </article>
    </div>
  );
}

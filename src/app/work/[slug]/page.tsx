import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IntroExperience from "@/components/IntroExperience";
import { projects } from "@/data/projects";
import { casePath } from "@/lib/work/caseRoute";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

const find = (slug: string) => projects.find((project) => project.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = find((await params).slug);
  if (!project) return {};
  const url = casePath(project.slug);
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: { title: `${project.name} · BytesPlatform`, description: project.summary, url },
  };
}

/**
 * A case study's own URL: the home experience, with the work scene opening
 * this project's case study over it (see lib/work/rootCardsScene).
 */
export default async function Page({ params }: Props) {
  if (!find((await params).slug)) notFound();
  return <IntroExperience />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePage from "@/components/services/ServicePage";
import { productContent } from "@/data/productContent";
import { productLinks, type ProductSlug } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return productLinks.map(({ slug }) => ({ slug }));
}

const find = (slug: string) => productContent[slug as ProductSlug];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = find((await params).slug);
  if (!content) return {};
  const url = `/products/${content.slug}`;
  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: { canonical: url },
    openGraph: { title: `${content.meta.title} · BytesPlatform`, description: content.meta.description, url },
  };
}

export default async function Page({ params }: Props) {
  const content = find((await params).slug);
  if (!content) notFound();
  const related = {
    label: "Other products",
    links: productLinks
      .filter((product) => product.slug !== content.slug)
      .map((product) => ({ href: `/products/${product.slug}`, label: product.label })),
  };
  return <ServicePage content={content} related={related} indexed />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { getArchivePage } from "@/lib/content";
import { PROGRAMS } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) return { title: "Program" };
  const page = await getArchivePage(program.archiveSlug);
  return {
    title: program.title,
    description: page?.description ?? program.summary,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) notFound();

  const page = await getArchivePage(program.archiveSlug);
  if (!page) notFound();

  return (
    <>
      <PageHero title={page.title} description={page.description || program.summary} />
      <ContentSection narrow>
        <MarkdownContent content={page.body} />
      </ContentSection>
    </>
  );
}

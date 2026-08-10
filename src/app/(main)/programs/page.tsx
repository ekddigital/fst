import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ProgramCard } from "@/components/content/program-card";
import { MarkdownContent } from "@/components/content/markdown-content";
import { getArchivePage } from "@/lib/content";
import { HERO_IMAGES, PROGRAMS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Programs",
  description: "Cambridge English preparation for KET, PET, IELTS, and English Starter for young learners.",
};

export default async function ProgramsPage() {
  const page = await getArchivePage("new-tutor-page");

  return (
    <>
      <PageHero
        title="Cambridge English Preparation"
        description="Build English skills and prepare for success with personalized KET, PET, and IELTS programs."
        image={HERO_IMAGES.programs}
        imageAlt="Teacher working with a student"
      />
      <ContentSection>
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {PROGRAMS.map((program) => (
            <ProgramCard
              key={program.slug}
              title={program.title}
              summary={program.summary}
              href={`/programs/${program.slug}`}
            />
          ))}
        </div>
        {page && <MarkdownContent content={page.body} />}
      </ContentSection>
    </>
  );
}

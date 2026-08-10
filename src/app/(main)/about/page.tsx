import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { getArchivePage } from "@/lib/content";
import { HERO_IMAGES } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Teacher Joe",
  description: "Meet Teacher Joe — experienced English teacher helping students build confident communication skills.",
};

export default async function AboutPage() {
  const page = await getArchivePage("about-teacher-joe");

  return (
    <>
      <PageHero
        title="Meet Teacher Joe"
        description="I help students build confident English through practical lessons, clear learning goals, and international teaching experience."
        image={HERO_IMAGES.teacher}
        imageAlt="Teacher Joe"
      />
      <ContentSection>{page && <MarkdownContent content={page.body} />}</ContentSection>
    </>
  );
}

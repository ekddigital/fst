import { ContentSection } from "@/components/content/content-section";
import { ArticleGridSkeleton, PageHeroSkeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <ContentSection>
        <ArticleGridSkeleton count={6} />
      </ContentSection>
    </>
  );
}

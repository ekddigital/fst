import { ContentSection } from "@/components/content/content-section";
import { ArticleContentSkeleton, PageHeroSkeleton } from "@/components/ui/skeleton";

export default function ArticleDetailLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <ContentSection narrow>
        <ArticleContentSkeleton />
      </ContentSection>
    </>
  );
}

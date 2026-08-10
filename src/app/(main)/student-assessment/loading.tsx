import { ContentSection } from "@/components/content/content-section";
import { AssessmentPageSkeleton, PageHeroSkeleton } from "@/components/ui/skeleton";

export default function StudentAssessmentLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <ContentSection narrow>
        <AssessmentPageSkeleton />
      </ContentSection>
    </>
  );
}

import { ContentSection } from "@/components/content/content-section";
import { PageHeroSkeleton, ResourcesPageSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function VideosAndResourcesLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <ContentSection>
        <ResourcesPageSkeleton />
        <div className="mt-20 border-t pt-16">
          <div className="rounded-xl border border-primary/20 bg-card p-8 shadow-lg">
            <Skeleton className="mb-2 h-9 w-64" />
            <Skeleton className="mb-8 h-5 w-full max-w-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-48" />
            </div>
          </div>
        </div>
      </ContentSection>
    </>
  );
}

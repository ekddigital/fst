import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} {...props} />;
}

function PageHeroSkeleton() {
  return (
    <section className="hero-mesh border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-secondary/25">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 lg:py-24">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-12 w-4/5 md:h-14" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </section>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  );
}

function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    </div>
  );
}

function ResourceCategorySkeleton() {
  return (
    <section className="space-y-8">
      <div className="flex items-start gap-4 border-l-4 border-primary/30 pl-5">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ResourceCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function ResourcesPageSkeleton() {
  return (
    <div className="space-y-16">
      {Array.from({ length: 2 }).map((_, i) => (
        <ResourceCategorySkeleton key={i} />
      ))}
    </div>
  );
}

function AssessmentQuestionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-5 w-72" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <Skeleton className="mb-4 h-7 w-full" />
        <Skeleton className="mb-6 h-5 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AssessmentPageSkeleton() {
  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <Skeleton className="mb-4 h-8 w-56" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <AssessmentQuestionSkeleton />
    </div>
  );
}

function ArticleContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <Skeleton className="my-8 aspect-video w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  );
}

function AdminTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex gap-4 border-b bg-muted/40 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  PageHeroSkeleton,
  ArticleCardSkeleton,
  ArticleGridSkeleton,
  ResourceCardSkeleton,
  ResourceCategorySkeleton,
  ResourcesPageSkeleton,
  AssessmentQuestionSkeleton,
  AssessmentPageSkeleton,
  ArticleContentSkeleton,
  AdminTableSkeleton,
};

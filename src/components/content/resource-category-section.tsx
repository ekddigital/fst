import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import type { ResourceCategoryWithResources } from "@/lib/data/catalog";
import { ResourceCard, ResourceSubsection } from "@/components/content/resource-card";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  "little-kids-english": Sparkles,
  "cambridge-english": GraduationCap,
  "teacher-joes-tips": BookOpen,
};

export function ResourceCategorySection({ category }: { category: ResourceCategoryWithResources }) {
  const Icon = CATEGORY_ICONS[category.slug] ?? BookOpen;

  const videosAndGuides = category.resources.filter(
    (r) => r.subsection === null && (r.type === "VIDEO" || r.type === "GUIDE"),
  );
  const otherResources = category.resources.filter(
    (r) => r.subsection === null && r.type !== "VIDEO" && r.type !== "GUIDE",
  );

  const ketResources = category.resources.filter((r) => r.subsection === "KET");
  const petResources = category.resources.filter((r) => r.subsection === "PET");
  const ieltsResources = category.resources.filter((r) => r.subsection === "IELTS");

  const isCambridge = category.slug === "cambridge-english";

  return (
    <section className="space-y-8">
      <div className="flex items-start gap-4 border-l-4 border-primary pl-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{category.title}</h2>
          {category.description && (
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {isCambridge ? (
        <div className="space-y-10">
          <ResourceSubsection title="KET Preparation (A2)" resources={ketResources} />
          <ResourceSubsection title="PET Preparation (B1)" resources={petResources} />
          <ResourceSubsection title="IELTS Preparation" resources={ieltsResources} />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            category.slug === "little-kids-english"
              ? "sm:grid-cols-2 lg:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {[...videosAndGuides, ...otherResources].map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </section>
  );
}

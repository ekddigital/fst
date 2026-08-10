import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ResourceCategorySection } from "@/components/content/resource-category-section";
import { ResourceRequestForm } from "@/components/forms/resource-request-form";
import { getResourceCategories, getRequestableResources } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Videos & Resources",
  description: "English learning videos, Cambridge preparation materials, and parent resources.",
};

export default async function VideosPage() {
  const [categories, requestableResources] = await Promise.all([
    getResourceCategories(),
    getRequestableResources(),
  ]);

  return (
    <>
      <PageHero
        title="Videos & Resources"
        description="Explore English learning videos, Cambridge preparation materials, and resources designed to support students from early learning through advanced English development."
      />
      <ContentSection>
        <div className="space-y-16">
          {categories.map((category) => (
            <ResourceCategorySection key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-20 border-t pt-16">
          <ResourceRequestForm resources={requestableResources} />
        </div>
      </ContentSection>
    </>
  );
}

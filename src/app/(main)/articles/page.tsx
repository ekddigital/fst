import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ArticleCard } from "@/components/content/article-card";
import { extractExcerpt, getAllArticles, getArticleImage } from "@/lib/content";
import { getPublishedArticles } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Articles",
  description: "English learning tips, exam preparation guides, and resources for parents and students.",
};

export default async function ArticlesPage() {
  const dbArticles = await getPublishedArticles();

  const articles =
    dbArticles.length > 0
      ? dbArticles.map((article) => ({
          slug: article.slug,
          title: article.title,
          description: article.description ?? extractExcerpt(article.content),
          image: article.coverImage ?? getArticleImage(article.content),
        }))
      : (await getAllArticles()).map((article) => ({
          slug: article.routeSlug ?? article.slug,
          title: article.title,
          description: article.description || extractExcerpt(article.body),
          image: getArticleImage(article.body),
        }));

  return (
    <>
      <PageHero
        title="Articles & English Learning Tips"
        description="Helpful articles for parents and students on English learning, exam preparation, study habits, and building confidence."
      />
      <ContentSection className="content-fade-in">
        {articles.length === 0 ? (
          <p className="text-center text-lg text-muted-foreground">Articles are being prepared. Please check back soon.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                title={article.title}
                excerpt={article.description}
                href={`/articles/${article.slug}`}
                image={article.image}
              />
            ))}
          </div>
        )}
      </ContentSection>
    </>
  );
}

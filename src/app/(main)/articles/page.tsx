import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ArticleCard } from "@/components/content/article-card";
import { ARTICLE_SLUG_MAP, extractExcerpt, getAllArticles, getArticleImage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles",
  description: "English learning tips, exam preparation guides, and resources for parents and students.",
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
      <PageHero
        title="Articles & English Learning Tips"
        description="Helpful articles for parents and students on English learning, exam preparation, study habits, and building confidence."
      />
      <ContentSection>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const routeSlug = ARTICLE_SLUG_MAP[article.slug] ?? article.slug;
            return (
              <ArticleCard
                key={article.slug}
                title={article.title}
                excerpt={article.description || extractExcerpt(article.body)}
                href={`/articles/${routeSlug}`}
                image={getArticleImage(article.body)}
              />
            );
          })}
        </div>
      </ContentSection>
    </>
  );
}

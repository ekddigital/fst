import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { getArticleByRouteSlug } from "@/lib/content";
import { getArticleBySlug, getPublishedArticles } from "@/lib/data/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const dbArticles = await getPublishedArticles();
  if (dbArticles.length > 0) {
    return dbArticles.map((article) => ({ slug: article.slug }));
  }
  const { ARTICLE_SLUG_MAP } = await import("@/lib/content");
  return Object.values(ARTICLE_SLUG_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbArticle = await getArticleBySlug(slug);
  if (dbArticle) {
    return { title: dbArticle.title, description: dbArticle.description ?? undefined };
  }
  const archiveArticle = await getArticleByRouteSlug(slug);
  if (!archiveArticle) return { title: "Article" };
  return {
    title: archiveArticle.title,
    description: archiveArticle.description,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const dbArticle = await getArticleBySlug(slug);

  if (dbArticle) {
    return (
      <>
        <PageHero title={dbArticle.title} description={dbArticle.description ?? undefined} />
        <ContentSection narrow className="content-fade-in">
          <MarkdownContent content={dbArticle.content} />
        </ContentSection>
      </>
    );
  }

  const archiveArticle = await getArticleByRouteSlug(slug);
  if (!archiveArticle) notFound();

  return (
    <>
      <PageHero title={archiveArticle.title} description={archiveArticle.description} />
      <ContentSection narrow className="content-fade-in">
        <MarkdownContent content={archiveArticle.body} />
      </ContentSection>
    </>
  );
}

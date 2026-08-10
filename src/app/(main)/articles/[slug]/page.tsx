import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { ARTICLE_SLUG_MAP, getArticleByRouteSlug } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return Object.values(ARTICLE_SLUG_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleByRouteSlug(slug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleByRouteSlug(slug);
  if (!article) notFound();

  return (
    <>
      <PageHero title={article.title} description={article.description} />
      <ContentSection narrow>
        <MarkdownContent content={article.body} />
      </ContentSection>
    </>
  );
}

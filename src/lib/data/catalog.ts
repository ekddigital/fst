import type { ResourceType, QuestionType } from "@prisma/client";

export type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: ResourceType;
  videoUrl: string | null;
  pdfPath: string | null;
  externalUrl: string | null;
  articleSlug: string | null;
  subsection: string | null;
  sortOrder: number;
  requestable: boolean;
};

export type ResourceCategoryWithResources = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  resources: ResourceItem[];
};

export type AssessmentQuestionItem = {
  id: string;
  section: string;
  sortOrder: number;
  prompt: string;
  type: QuestionType;
  options: string[] | null;
  points: number;
};

export type AssessmentWithQuestions = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  targetAge: string | null;
  questions: AssessmentQuestionItem[];
};

export type RequestableResource = {
  slug: string;
  title: string;
};

export const YOUNG_LEARNERS_ASSESSMENT_SLUG = "young-learners";

function parseOptions(options: unknown): string[] | null {
  if (!options || !Array.isArray(options)) return null;
  return options.filter((item): item is string => typeof item === "string");
}

export async function getResourceCategories(): Promise<ResourceCategoryWithResources[]> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return [];

  const categories = await db.resourceCategory.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      resources: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    sortOrder: category.sortOrder,
    resources: category.resources.map((resource) => ({
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      videoUrl: resource.videoUrl,
      pdfPath: resource.pdfPath,
      externalUrl: resource.externalUrl,
      articleSlug: resource.articleSlug,
      subsection: resource.subsection,
      sortOrder: resource.sortOrder,
      requestable: resource.requestable,
    })),
  }));
}

export async function getRequestableResources(): Promise<RequestableResource[]> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return [];

  return db.resource.findMany({
    where: { published: true, requestable: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: { slug: true, title: true },
  });
}

export async function getAssessmentBySlug(slug: string): Promise<AssessmentWithQuestions | null> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return null;

  const assessment = await db.assessment.findUnique({
    where: { slug, published: true },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!assessment || assessment.questions.length === 0) return null;

  return {
    id: assessment.id,
    slug: assessment.slug,
    title: assessment.title,
    description: assessment.description,
    targetAge: assessment.targetAge,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      section: q.section,
      sortOrder: q.sortOrder,
      prompt: q.prompt,
      type: q.type,
      options: parseOptions(q.options),
      points: q.points,
    })),
  };
}

export type ScoredAnswer = {
  questionId: string;
  answer: string;
  correct: boolean;
  points: number;
};

export async function scoreAssessmentSubmission(
  assessmentId: string,
  answers: Record<string, string>,
): Promise<{ score: number; maxScore: number; breakdown: ScoredAnswer[] } | null> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return null;

  const questions = await db.assessmentQuestion.findMany({
    where: { assessmentId },
    orderBy: { sortOrder: "asc" },
  });

  if (questions.length === 0) return null;

  const breakdown = questions.map((q) => {
    const answer = answers[q.id]?.trim() ?? "";
    const correct = Boolean(q.correctAnswer && answer === q.correctAnswer.trim());
    return {
      questionId: q.id,
      answer,
      correct,
      points: correct ? q.points : 0,
    };
  });

  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
  return { score, maxScore, breakdown };
}

export type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  publishedAt: Date | null;
  sortOrder: number;
};

export async function getPublishedArticles(): Promise<ArticleItem[]> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return [];

  const articles = await db.article.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
  });

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    content: article.content,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    sortOrder: article.sortOrder,
  }));
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return null;

  const article = await db.article.findFirst({
    where: { slug, published: true },
  });

  if (!article) return null;

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    description: article.description,
    content: article.content,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt,
    sortOrder: article.sortOrder,
  };
}

export async function resolveResourceTitle(slug: string): Promise<string | null> {
  const { db, isDatabaseConfigured } = await import("@/lib/db");
  if (!isDatabaseConfigured()) return null;

  const resource = await db.resource.findUnique({
    where: { slug },
    select: { title: true },
  });
  return resource?.title ?? null;
}

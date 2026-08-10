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

export const FALLBACK_CATEGORIES: ResourceCategoryWithResources[] = [
  {
    id: "fallback-little-kids",
    slug: "little-kids-english",
    title: "Little Kids English",
    description:
      "Fun and engaging English activities designed to help young learners build phonics, reading, vocabulary, and communication skills.",
    sortOrder: 1,
    resources: [
      {
        id: "fb-phonics",
        slug: "phonics-for-young-learners",
        title: "Phonics for Young Learners",
        description:
          "A simple phonics lesson to help young learners improve letter sounds, pronunciation, and early reading confidence.",
        type: "VIDEO",
        videoUrl: "/videos/Phonics-Song-2.mp4",
        pdfPath: null,
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 1,
        requestable: false,
      },
      {
        id: "fb-felix",
        slug: "felix-class-alphabet-phonics",
        title: "Real Online Class: Alphabet, Reading, and Phonics Practice",
        description:
          "Teacher Joe helping a young learner practise alphabet sounds, reading skills, and phonics through interactive activities.",
        type: "VIDEO",
        videoUrl: "/videos/Felix-class.mp4",
        pdfPath: null,
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 2,
        requestable: false,
      },
      {
        id: "fb-candy",
        slug: "classroom-problem-solution",
        title: "Real Classroom Lesson: Problem & Solution",
        description:
          "An engaging classroom lesson demonstrating problem and solution language skills.",
        type: "VIDEO",
        videoUrl: "/videos/Candy.mp4",
        pdfPath: null,
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 3,
        requestable: false,
      },
      {
        id: "fb-parent-guide",
        slug: "parent-guide",
        title: "Helping Your Child Build English Skills: A Parent's Guide",
        description:
          "Practical answers to common questions parents ask about English learning at home.",
        type: "GUIDE",
        videoUrl: null,
        pdfPath: "/other/FST_Parent_Guide_Cover_to_Page_8_Complete_Draft.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 4,
        requestable: false,
      },
    ],
  },
  {
    id: "fallback-cambridge",
    slug: "cambridge-english",
    title: "Cambridge English Resources",
    description:
      "Resources designed to support students preparing for Cambridge English assessments, including KET, PET, and IELTS.",
    sortOrder: 2,
    resources: [
      {
        id: "fb-ket-grammar",
        slug: "ket-grammar-practice",
        title: "A2 Grammar Practice Test (KET Level)",
        description:
          "Practice grammar questions designed for A2-level learners preparing for Cambridge English assessments.",
        type: "PDF",
        videoUrl: null,
        pdfPath: "/other/essentialvocabulary.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: "KET",
        sortOrder: 1,
        requestable: true,
      },
      {
        id: "fb-ket-vocab",
        slug: "ket-vocabulary-250",
        title: "250 Essential Vocabulary Words (KET Level)",
        description:
          "Build your A2 vocabulary with essential words and phrases for everyday communication and Cambridge English preparation.",
        type: "PDF",
        videoUrl: null,
        pdfPath: "/other/506886-a2-key-2020-vocabulary-list.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: "KET",
        sortOrder: 2,
        requestable: true,
      },
      {
        id: "fb-pet",
        slug: "pet-practice-test",
        title: "B1 Preliminary (PET) Practice Test",
        description:
          "Complete Cambridge English B1 Preliminary practice test covering Reading, Writing, Listening, and Speaking skills.",
        type: "PDF",
        videoUrl: null,
        pdfPath: "/other/Objective_PET_Test_A_full_test.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: "PET",
        sortOrder: 3,
        requestable: false,
      },
      {
        id: "fb-ielts",
        slug: "ielts-speaking-guide",
        title: "IELTS Speaking Starter Guide",
        description:
          "Develop speaking skills with practical IELTS speaking tips, sample answers, and useful vocabulary.",
        type: "PDF",
        videoUrl: null,
        pdfPath: "/other/pet-speaking-1-completo.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: "IELTS",
        sortOrder: 4,
        requestable: true,
      },
    ],
  },
  {
    id: "fallback-tips",
    slug: "teacher-joes-tips",
    title: "Teacher Joe's Learning Tips",
    description:
      "Practical English learning advice, study strategies, and tips from Teacher Joe to help students improve their English skills.",
    sortOrder: 3,
    resources: [
      {
        id: "fb-habits",
        slug: "5-daily-habits",
        title: "5 Daily Habits That Improve Your English",
        description:
          "Discover simple daily habits that help students improve their English skills and make steady progress.",
        type: "VIDEO",
        videoUrl: "/videos/revised-final.mp4",
        pdfPath: null,
        externalUrl: null,
        articleSlug: "5-daily-habits-that-improve-your-english",
        subsection: null,
        sortOrder: 1,
        requestable: true,
      },
      {
        id: "fb-mistakes",
        slug: "5-mistakes-slow-english",
        title: "5 Mistakes That Slow Down Your English Learning",
        description:
          "Learn the common mistakes that slow down English progress and discover practical strategies to improve your learning habits.",
        type: "ARTICLE",
        videoUrl: null,
        pdfPath: null,
        externalUrl: null,
        articleSlug: "online-english-lessons-for-young-children",
        subsection: null,
        sortOrder: 2,
        requestable: true,
      },
      {
        id: "fb-worksheets",
        slug: "grammar-worksheets",
        title: "Grammar Worksheets",
        description:
          "Printable grammar practice worksheets for building strong foundations in English.",
        type: "PDF",
        videoUrl: null,
        pdfPath: "/other/Adjective-Adverb-and-Verb-Word-Mats-and-Posters-Ages-6-8.pdf",
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 3,
        requestable: true,
      },
      {
        id: "fb-classes",
        slug: "english-classes-info",
        title: "I would like information about English classes",
        description:
          "Tell Teacher Joe about your goals and receive guidance on the best program for you or your child.",
        type: "EXTERNAL",
        videoUrl: null,
        pdfPath: null,
        externalUrl: null,
        articleSlug: null,
        subsection: null,
        sortOrder: 4,
        requestable: true,
      },
    ],
  },
];

const FALLBACK_QUESTIONS: AssessmentQuestionItem[] = [
  { id: "fb-q1", section: "Vocabulary", sortOrder: 1, prompt: 'What is a "cat"?', type: "MULTIPLE_CHOICE", options: ['A small animal that says "meow"', 'A big animal that says "moo"', "A bird that flies", "A fish in the water"], points: 1 },
  { id: "fb-q2", section: "Vocabulary", sortOrder: 2, prompt: "Which word is a color?", type: "MULTIPLE_CHOICE", options: ["Blue", "Run", "Happy", "Quickly"], points: 1 },
  { id: "fb-q3", section: "Vocabulary", sortOrder: 3, prompt: "What do you use to write?", type: "MULTIPLE_CHOICE", options: ["A pen", "A shoe", "A window", "A tree"], points: 1 },
  { id: "fb-q4", section: "Vocabulary", sortOrder: 4, prompt: 'Which word means the opposite of "big"?', type: "MULTIPLE_CHOICE", options: ["Small", "Tall", "Fast", "Happy"], points: 1 },
  { id: "fb-q5", section: "Grammar", sortOrder: 5, prompt: "Which sentence is correct?", type: "MULTIPLE_CHOICE", options: ["She is happy.", "She are happy.", "She am happy.", "She be happy."], points: 1 },
  { id: "fb-q6", section: "Grammar", sortOrder: 6, prompt: 'Choose the correct word: "I ___ a student."', type: "MULTIPLE_CHOICE", options: ["am", "is", "are", "be"], points: 1 },
  { id: "fb-q7", section: "Grammar", sortOrder: 7, prompt: "Which is a question?", type: "MULTIPLE_CHOICE", options: ["What is your name?", "My name is Tom.", "I like apples.", "The dog is brown."], points: 1 },
  { id: "fb-q8", section: "Grammar", sortOrder: 8, prompt: "Which word is a verb (action word)?", type: "MULTIPLE_CHOICE", options: ["Run", "Table", "Blue", "Happy"], points: 1 },
  { id: "fb-q9", section: "Reading", sortOrder: 9, prompt: 'Read: "Tom has a red ball. He plays in the park." Where does Tom play?', type: "MULTIPLE_CHOICE", options: ["In the park", "At school", "In the kitchen", "On the bus"], points: 1 },
  { id: "fb-q10", section: "Reading", sortOrder: 10, prompt: 'Read: "It is sunny today. Sara wears a hat." Why does Sara wear a hat?', type: "MULTIPLE_CHOICE", options: ["Because it is sunny", "Because it is cold", "Because it is night", "Because it is raining"], points: 1 },
  { id: "fb-q11", section: "Reading", sortOrder: 11, prompt: 'Read: "The dog is under the table." Where is the dog?', type: "MULTIPLE_CHOICE", options: ["Under the table", "On the chair", "In the box", "Behind the door"], points: 1 },
  { id: "fb-q12", section: "Reading", sortOrder: 12, prompt: 'Read: "Max likes apples and bananas. He does not like grapes." What does Max NOT like?', type: "MULTIPLE_CHOICE", options: ["Grapes", "Apples", "Bananas", "Oranges"], points: 1 },
];

export const FALLBACK_ASSESSMENT: AssessmentWithQuestions = {
  id: "fallback-assessment",
  slug: YOUNG_LEARNERS_ASSESSMENT_SLUG,
  title: "Young Learners English Skills Assessment",
  description:
    "A free assessment for parents to understand their child's English skills in vocabulary, grammar, and reading.",
  targetAge: "6-10",
  questions: FALLBACK_QUESTIONS,
};

export const FALLBACK_REQUESTABLE_RESOURCES: RequestableResource[] = FALLBACK_CATEGORIES.flatMap(
  (category) =>
    category.resources
      .filter((r) => r.requestable)
      .map((r) => ({ slug: r.slug, title: r.title })),
);

function parseOptions(options: unknown): string[] | null {
  if (!options || !Array.isArray(options)) return null;
  return options.filter((item): item is string => typeof item === "string");
}

export async function getResourceCategories(): Promise<ResourceCategoryWithResources[]> {
  try {
    const { db, isDatabaseConfigured } = await import("@/lib/db");
    if (!isDatabaseConfigured()) return FALLBACK_CATEGORIES;

    const categories = await db.resourceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        resources: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (categories.length === 0) return FALLBACK_CATEGORIES;

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
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function getRequestableResources(): Promise<RequestableResource[]> {
  try {
    const { db, isDatabaseConfigured } = await import("@/lib/db");
    if (!isDatabaseConfigured()) return FALLBACK_REQUESTABLE_RESOURCES;

    const resources = await db.resource.findMany({
      where: { published: true, requestable: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { slug: true, title: true },
    });

    if (resources.length === 0) return FALLBACK_REQUESTABLE_RESOURCES;
    return resources;
  } catch {
    return FALLBACK_REQUESTABLE_RESOURCES;
  }
}

export async function getAssessmentBySlug(slug: string): Promise<AssessmentWithQuestions | null> {
  if (slug === YOUNG_LEARNERS_ASSESSMENT_SLUG) {
    try {
      const { db, isDatabaseConfigured } = await import("@/lib/db");
      if (!isDatabaseConfigured()) return FALLBACK_ASSESSMENT;

      const assessment = await db.assessment.findUnique({
        where: { slug, published: true },
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
        },
      });

      if (!assessment || assessment.questions.length === 0) return FALLBACK_ASSESSMENT;

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
    } catch {
      return FALLBACK_ASSESSMENT;
    }
  }
  return null;
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

  if (!isDatabaseConfigured()) {
    const fallbackQuestions = FALLBACK_ASSESSMENT.questions;
    const breakdown = fallbackQuestions.map((q) => {
      const answer = answers[q.id]?.trim() ?? "";
      const correctAnswers: Record<string, string> = {
        "fb-q1": 'A small animal that says "meow"',
        "fb-q2": "Blue",
        "fb-q3": "A pen",
        "fb-q4": "Small",
        "fb-q5": "She is happy.",
        "fb-q6": "am",
        "fb-q7": "What is your name?",
        "fb-q8": "Run",
        "fb-q9": "In the park",
        "fb-q10": "Because it is sunny",
        "fb-q11": "Under the table",
        "fb-q12": "Grapes",
      };
      const correct = answer === correctAnswers[q.id];
      return { questionId: q.id, answer, correct, points: correct ? q.points : 0 };
    });
    const score = breakdown.reduce((sum, item) => sum + item.points, 0);
    const maxScore = fallbackQuestions.reduce((sum, q) => sum + q.points, 0);
    return { score, maxScore, breakdown };
  }

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

export async function resolveResourceTitle(slug: string): Promise<string | null> {
  try {
    const { db, isDatabaseConfigured } = await import("@/lib/db");
    if (!isDatabaseConfigured()) {
      return FALLBACK_REQUESTABLE_RESOURCES.find((r) => r.slug === slug)?.title ?? null;
    }
    const resource = await db.resource.findUnique({
      where: { slug },
      select: { title: true },
    });
    return resource?.title ?? FALLBACK_REQUESTABLE_RESOURCES.find((r) => r.slug === slug)?.title ?? null;
  } catch {
    return FALLBACK_REQUESTABLE_RESOURCES.find((r) => r.slug === slug)?.title ?? null;
  }
}

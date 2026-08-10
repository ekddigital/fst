import {
  PrismaClient,
  QuestionType,
  ResourceType,
} from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

const db = new PrismaClient();

const ARCHIVE_DIR = path.join(process.cwd(), "site-data", "pages");

/** Archive folder slugs → public URL slugs */
const ARTICLE_SLUG_MAP: Record<string, string> = {
  "5-daily-habits-that-improve-your-english": "5-daily-habits-that-improve-your-english",
  "ielts-writing-tips-for-better-exam-results": "ielts-writing-tips-for-better-exam-results",
  "2026__07__23__why-take-cambridge-a2-key-ket": "why-take-cambridge-a2-key-ket",
  "2026__07__28__helping-your-child-build-english-skills-a-parents-guide":
    "helping-your-child-build-english-skills",
  "2026__08__05__what-ielts-score-is-required-for-entrance-to-universities-in-america":
    "ielts-score-for-american-universities",
  "2026__08__06__when-should-students-start-preparing-for-the-ielts-exam":
    "when-to-start-ielts-preparation",
  "2026__08__07__are-online-english-lessons-effective-for-young-children-what-parents-should-know":
    "online-english-lessons-for-young-children",
};

function stripFrontMatter(raw: string): { title: string; description: string; body: string } {
  const lines = raw.split("\n");
  let title = "Fast Start Talking";
  let description = "";
  let bodyStart = 0;

  if (lines[0]?.startsWith("# ")) {
    title = lines[0].replace(/^#\s+/, "").replace(/\s*-\s*Fast Start Talking\s*$/, "").trim();
    bodyStart = 1;
  }

  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("**Description:**")) {
      description = line.replace("**Description:**", "").trim();
    }
    if (line.trim() === "---" && i > 2) {
      bodyStart = i + 1;
      break;
    }
  }

  let body = lines.slice(bodyStart).join("\n").trim();
  body = body.replace(/\*\*Note:\*\* Contains Lorem ipsum placeholder text\n*/i, "");
  body = body.replace(/Lorem ipsum dolor sit amet[^.]*\./gi, "");
  return { title, description, body };
}

function mapImageUrls(body: string, metadata?: { assets?: { images?: Array<{ url: string; local: string }> } }): string {
  let result = body;
  if (metadata?.assets?.images) {
    for (const img of metadata.assets.images) {
      const filename = path.basename(img.local);
      result = result.replaceAll(img.url, `/images/${filename}`);
    }
  }
  result = result.replace(
    /https:\/\/faststarttalking\.com\/wp-content\/uploads\/[^)\s"]+/g,
    (url) => `/images/${decodeURIComponent(url.split("/").pop() ?? "")}`,
  );
  return result;
}

function getCoverImage(body: string): string | null {
  const match = body.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/);
  return match?.[1] ?? null;
}

async function seedArticles() {
  const archiveSlugs = Object.keys(ARTICLE_SLUG_MAP);
  let sortOrder = 0;

  for (const archiveSlug of archiveSlugs) {
    const routeSlug = ARTICLE_SLUG_MAP[archiveSlug];
    const pageDir = path.join(ARCHIVE_DIR, archiveSlug);

    try {
      const [contentRaw, metadataRaw] = await Promise.all([
        fs.readFile(path.join(pageDir, "content.md"), "utf8"),
        fs.readFile(path.join(pageDir, "metadata.json"), "utf8").catch(() => null),
      ]);
      const metadata = metadataRaw ? (JSON.parse(metadataRaw) as { assets?: { images?: Array<{ url: string; local: string }> } }) : undefined;
      const parsed = stripFrontMatter(contentRaw);
      const title = parsed.title || routeSlug;
      const description = parsed.description || null;
      const content = mapImageUrls(parsed.body, metadata);
      const coverImage = getCoverImage(content);
      sortOrder += 1;

      await db.article.upsert({
        where: { slug: routeSlug },
        update: {
          title,
          description,
          content,
          coverImage,
          published: true,
          sortOrder,
        },
        create: {
          slug: routeSlug,
          title,
          description,
          content,
          coverImage,
          published: true,
          sortOrder,
          publishedAt: new Date(),
        },
      });
    } catch {
      console.warn(`  ⚠ Skipped article seed for ${archiveSlug} (site-data not found)`);
    }
  }
}

const YOUNG_LEARNERS_SLUG = "young-learners";

const ASSESSMENT_QUESTIONS = [
  {
    section: "Vocabulary",
    sortOrder: 1,
    prompt: 'What is a "cat"?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      'A small animal that says "meow"',
      'A big animal that says "moo"',
      "A bird that flies",
      "A fish in the water",
    ],
    correctAnswer: 'A small animal that says "meow"',
  },
  {
    section: "Vocabulary",
    sortOrder: 2,
    prompt: "Which word is a color?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Blue", "Run", "Happy", "Quickly"],
    correctAnswer: "Blue",
  },
  {
    section: "Vocabulary",
    sortOrder: 3,
    prompt: "What do you use to write?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A pen", "A shoe", "A window", "A tree"],
    correctAnswer: "A pen",
  },
  {
    section: "Vocabulary",
    sortOrder: 4,
    prompt: 'Which word means the opposite of "big"?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Small", "Tall", "Fast", "Happy"],
    correctAnswer: "Small",
  },
  {
    section: "Grammar",
    sortOrder: 5,
    prompt: "Which sentence is correct?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["She is happy.", "She are happy.", "She am happy.", "She be happy."],
    correctAnswer: "She is happy.",
  },
  {
    section: "Grammar",
    sortOrder: 6,
    prompt: 'Choose the correct word: "I ___ a student."',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
  },
  {
    section: "Grammar",
    sortOrder: 7,
    prompt: "Which is a question?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "What is your name?",
      "My name is Tom.",
      "I like apples.",
      "The dog is brown.",
    ],
    correctAnswer: "What is your name?",
  },
  {
    section: "Grammar",
    sortOrder: 8,
    prompt: "Which word is a verb (action word)?",
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Run", "Table", "Blue", "Happy"],
    correctAnswer: "Run",
  },
  {
    section: "Reading",
    sortOrder: 9,
    prompt: 'Read: "Tom has a red ball. He plays in the park." Where does Tom play?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["In the park", "At school", "In the kitchen", "On the bus"],
    correctAnswer: "In the park",
  },
  {
    section: "Reading",
    sortOrder: 10,
    prompt:
      'Read: "It is sunny today. Sara wears a hat." Why does Sara wear a hat?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "Because it is sunny",
      "Because it is cold",
      "Because it is night",
      "Because it is raining",
    ],
    correctAnswer: "Because it is sunny",
  },
  {
    section: "Reading",
    sortOrder: 11,
    prompt: 'Read: "The dog is under the table." Where is the dog?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Under the table", "On the chair", "In the box", "Behind the door"],
    correctAnswer: "Under the table",
  },
  {
    section: "Reading",
    sortOrder: 12,
    prompt:
      'Read: "Max likes apples and bananas. He does not like grapes." What does Max NOT like?',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["Grapes", "Apples", "Bananas", "Oranges"],
    correctAnswer: "Grapes",
  },
] as const;

async function seedAssessment() {
  const assessment = await db.assessment.upsert({
    where: { slug: YOUNG_LEARNERS_SLUG },
    update: {
      title: "Young Learners English Skills Assessment",
      description:
        "A free assessment for parents to understand their child's English skills in vocabulary, grammar, and reading.",
      targetAge: "6-10",
      published: true,
    },
    create: {
      slug: YOUNG_LEARNERS_SLUG,
      title: "Young Learners English Skills Assessment",
      description:
        "A free assessment for parents to understand their child's English skills in vocabulary, grammar, and reading.",
      targetAge: "6-10",
      published: true,
    },
  });

  await db.assessmentQuestion.deleteMany({ where: { assessmentId: assessment.id } });
  await db.assessmentQuestion.createMany({
    data: ASSESSMENT_QUESTIONS.map((q) => ({
      assessmentId: assessment.id,
      section: q.section,
      sortOrder: q.sortOrder,
      prompt: q.prompt,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 1,
    })),
  });

  return assessment;
}

async function seedResources() {
  const categories = [
    {
      slug: "little-kids-english",
      title: "Little Kids English",
      description:
        "Fun and engaging English activities designed to help young learners build phonics, reading, vocabulary, and communication skills.",
      sortOrder: 1,
    },
    {
      slug: "cambridge-english",
      title: "Cambridge English Resources",
      description:
        "Resources designed to support students preparing for Cambridge English assessments, including KET, PET, and IELTS.",
      sortOrder: 2,
    },
    {
      slug: "teacher-joes-tips",
      title: "Teacher Joe's Learning Tips",
      description:
        "Practical English learning advice, study strategies, and tips from Teacher Joe to help students improve their English skills.",
      sortOrder: 3,
      published: true,
    },
  ] as const;

  for (const category of categories) {
    await db.resourceCategory.upsert({
      where: { slug: category.slug },
      update: {
        title: category.title,
        description: category.description,
        sortOrder: category.sortOrder,
        published: true,
      },
      create: { ...category, published: true },
    });
  }

  const littleKids = await db.resourceCategory.findUniqueOrThrow({
    where: { slug: "little-kids-english" },
  });
  const cambridge = await db.resourceCategory.findUniqueOrThrow({
    where: { slug: "cambridge-english" },
  });
  const tips = await db.resourceCategory.findUniqueOrThrow({
    where: { slug: "teacher-joes-tips" },
  });

  const resources = [
    {
      categoryId: littleKids.id,
      slug: "phonics-for-young-learners",
      title: "Phonics for Young Learners",
      description:
        "A simple phonics lesson to help young learners improve letter sounds, pronunciation, and early reading confidence.",
      type: ResourceType.VIDEO,
      videoUrl: "/videos/Phonics-Song-2.mp4",
      sortOrder: 1,
    },
    {
      categoryId: littleKids.id,
      slug: "felix-class-alphabet-phonics",
      title: "Real Online Class: Alphabet, Reading, and Phonics Practice",
      description:
        "Teacher Joe helping a young learner practise alphabet sounds, reading skills, and phonics through interactive activities.",
      type: ResourceType.VIDEO,
      videoUrl: "/videos/Candy.mp4",
      sortOrder: 2,
    },
    {
      categoryId: littleKids.id,
      slug: "classroom-problem-solution",
      title: "Real Classroom Lesson: Problem & Solution",
      description:
        "An engaging classroom lesson demonstrating problem and solution language skills.",
      type: ResourceType.VIDEO,
      videoUrl: "/videos/Felix-class.mp4",
      sortOrder: 3,
    },
    {
      categoryId: littleKids.id,
      slug: "parent-guide",
      title: "Helping Your Child Build English Skills: A Parent's Guide",
      description:
        "Practical answers to common questions parents ask about English learning at home.",
      type: ResourceType.GUIDE,
      pdfPath: "/other/FST_Parent_Guide_Cover_to_Page_8_Complete_Draft.pdf",
      sortOrder: 4,
    },
    {
      categoryId: cambridge.id,
      slug: "ket-grammar-practice",
      title: "A2 Grammar Practice Test (KET Level)",
      description:
        "Practice grammar questions designed for A2-level learners preparing for Cambridge English assessments.",
      type: ResourceType.PDF,
      pdfPath: "/other/essentialvocabulary.pdf",
      subsection: "KET",
      sortOrder: 1,
      requestable: true,
    },
    {
      categoryId: cambridge.id,
      slug: "ket-vocabulary-250",
      title: "250 Essential Vocabulary Words (KET Level)",
      description:
        "Build your A2 vocabulary with essential words and phrases for everyday communication and Cambridge English preparation.",
      type: ResourceType.PDF,
      pdfPath: "/other/506886-a2-key-2020-vocabulary-list.pdf",
      subsection: "KET",
      sortOrder: 2,
      requestable: true,
    },
    {
      categoryId: cambridge.id,
      slug: "pet-practice-test",
      title: "B1 Preliminary (PET) Practice Test",
      description:
        "Complete Cambridge English B1 Preliminary practice test covering Reading, Writing, Listening, and Speaking skills.",
      type: ResourceType.PDF,
      pdfPath: "/other/Objective_PET_Test_A_full_test.pdf",
      subsection: "PET",
      sortOrder: 3,
    },
    {
      categoryId: cambridge.id,
      slug: "ielts-speaking-guide",
      title: "IELTS Speaking Starter Guide",
      description:
        "Develop speaking skills with practical IELTS speaking tips, sample answers, and useful vocabulary.",
      type: ResourceType.PDF,
      pdfPath: "/other/pet-speaking-1-completo.pdf",
      subsection: "IELTS",
      sortOrder: 4,
      requestable: true,
    },
    {
      categoryId: tips.id,
      slug: "5-daily-habits",
      title: "5 Daily Habits That Improve Your English",
      description:
        "Discover simple daily habits that help students improve their English skills and make steady progress.",
      type: ResourceType.VIDEO,
      videoUrl: "/videos/revised-final.mp4",
      articleSlug: "5-daily-habits-that-improve-your-english",
      sortOrder: 1,
      requestable: true,
    },
    {
      categoryId: tips.id,
      slug: "5-mistakes-slow-english",
      title: "5 Mistakes That Slow Down Your English Learning",
      description:
        "Learn the common mistakes that slow down English progress and discover practical strategies to improve your learning habits.",
      type: ResourceType.ARTICLE,
      articleSlug: "online-english-lessons-for-young-children",
      sortOrder: 2,
      requestable: true,
    },
    {
      categoryId: tips.id,
      slug: "grammar-worksheets",
      title: "Grammar Worksheets",
      description:
        "Printable grammar practice worksheets for building strong foundations in English.",
      type: ResourceType.PDF,
      pdfPath: "/other/Adjective-Adverb-and-Verb-Word-Mats-and-Posters-Ages-6-8.pdf",
      sortOrder: 3,
      requestable: true,
    },
    {
      categoryId: tips.id,
      slug: "english-classes-info",
      title: "I would like information about English classes",
      description:
        "Tell Teacher Joe about your goals and receive guidance on the best program for you or your child.",
      type: ResourceType.EXTERNAL,
      sortOrder: 4,
      requestable: true,
    },
  ] as const;

  for (const resource of resources) {
    const { categoryId, slug, ...data } = resource;
    await db.resource.upsert({
      where: { slug },
      update: { categoryId, ...data },
      create: { categoryId, slug, ...data },
    });
  }
}

async function main() {
  console.log("Seeding assessment…");
  const assessment = await seedAssessment();
  console.log(`  ✓ ${assessment.title} (${ASSESSMENT_QUESTIONS.length} questions)`);

  console.log("Seeding resources…");
  await seedResources();
  const counts = await Promise.all([
    db.resourceCategory.count(),
    db.resource.count({ where: { requestable: true } }),
  ]);
  console.log(`  ✓ ${counts[0]} categories, ${counts[1]} requestable resources`);

  console.log("Seeding articles…");
  await seedArticles();
  const articleCount = await db.article.count();
  console.log(`  ✓ ${articleCount} articles`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

import fs from "node:fs/promises";
import path from "node:path";

export type PageMetadata = {
  url: string;
  title: string;
  description: string;
  wp_type?: string;
  wp_slug?: string;
  assets?: {
    images?: Array<{ url: string; local: string }>;
  };
};

export type ArchivePage = {
  slug: string;
  title: string;
  description: string;
  body: string;
  metadata?: PageMetadata;
  routeSlug?: string;
};

const ARCHIVE_DIR = path.join(process.cwd(), "site-data", "pages");

/** Article archive slugs mapped to clean URL slugs */
export const ARTICLE_SLUG_MAP: Record<string, string> = {
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

const ARTICLE_ARCHIVE_SLUGS = Object.keys(ARTICLE_SLUG_MAP);

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
  body = body.replace(/## Why Choose Fast Start Talking\?\s*\n\s*## Experienced Teacher\s*\n\s*/i, "");
  return { title, description, body };
}

function mapImageUrls(body: string, metadata?: PageMetadata): string {
  let result = body;
  if (metadata?.assets?.images) {
    for (const img of metadata.assets.images) {
      const filename = path.basename(img.local);
      result = result.replaceAll(img.url, `/images/${filename}`);
    }
  }
  result = result.replace(
    /https:\/\/faststarttalking\.com\/wp-content\/uploads\/[^)\s"]+/g,
    (url) => {
      const filename = decodeURIComponent(url.split("/").pop() ?? "");
      return `/images/${filename}`;
    },
  );
  result = result.replace(/https:\/\/faststarttalking\.com\/[^)\s"]+/g, (url) => {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/^\//, "").replace(/\/$/, "");
      const routeMap: Record<string, string> = {
        "student-assessment-young-learners": "/student-assessment",
        "contact-page": "/contact",
        "new-tutor-page": "/programs",
        "about-teacher-joe": "/about",
        "english-starter-package": "/programs/english-starter",
        "ket-preparation": "/programs/ket",
        "pet-preparation": "/programs/pet",
        "ielts-preparation": "/programs/ielts",
        "articles": "/articles",
        "videos-and-resources": "/videos-and-resources",
      };
      return routeMap[pathname] ?? url;
    } catch {
      return url;
    }
  });
  return result;
}

export async function getArchivePage(archiveSlug: string): Promise<ArchivePage | null> {
  const pageDir = path.join(ARCHIVE_DIR, archiveSlug);
  try {
    const [contentRaw, metadataRaw] = await Promise.all([
      fs.readFile(path.join(pageDir, "content.md"), "utf8"),
      fs.readFile(path.join(pageDir, "metadata.json"), "utf8").catch(() => null),
    ]);
    const metadata = metadataRaw ? (JSON.parse(metadataRaw) as PageMetadata) : undefined;
    const parsed = stripFrontMatter(contentRaw);
    const title = parsed.title || metadata?.title?.replace(/\s*-\s*Fast Start Talking\s*$/, "") || archiveSlug;
    const description = parsed.description || metadata?.description || "";
    const body = mapImageUrls(parsed.body, metadata);

    return {
      slug: archiveSlug,
      title,
      description,
      body,
      metadata,
      routeSlug: ARTICLE_SLUG_MAP[archiveSlug],
    };
  } catch {
    return null;
  }
}

export async function getAllArticles(): Promise<ArchivePage[]> {
  const articles = await Promise.all(ARTICLE_ARCHIVE_SLUGS.map((slug) => getArchivePage(slug)));
  return articles.filter((a): a is ArchivePage => a !== null);
}

export async function getArticleByRouteSlug(routeSlug: string): Promise<ArchivePage | null> {
  const archiveSlug = Object.entries(ARTICLE_SLUG_MAP).find(([, r]) => r === routeSlug)?.[0];
  if (!archiveSlug) return null;
  return getArchivePage(archiveSlug);
}

export function extractExcerpt(body: string, maxLength = 160): string {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

export function getArticleImage(body: string): string | undefined {
  const match = body.match(/!\[[^\]]*\]\((\/images\/[^)]+)\)/);
  return match?.[1];
}

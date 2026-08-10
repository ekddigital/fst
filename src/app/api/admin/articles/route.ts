import { apiSuccess, badRequest, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { db } from "@/lib/db";
import { articleCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (_req, requestId) => {
    const articles = await db.article.findMany({
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return apiSuccess({ articles, requestId }, 200, requestId);
  });
}

export async function POST(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body", undefined, requestId);
    }

    const parsed = articleCreateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors, requestId);
    }

    const maxOrder = await db.article.aggregate({ _max: { sortOrder: true } });
    const sortOrder = parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;
    const publishedAt =
      parsed.data.publishedAt !== undefined
        ? parsed.data.publishedAt
          ? new Date(parsed.data.publishedAt)
          : null
        : parsed.data.published === false
          ? null
          : new Date();

    const article = await db.article.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        content: parsed.data.content,
        coverImage: parsed.data.coverImage ?? null,
        published: parsed.data.published ?? true,
        sortOrder,
        publishedAt,
      },
    });

    return created({ article, requestId }, requestId);
  });
}

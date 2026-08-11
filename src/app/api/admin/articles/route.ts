import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";
import { articleCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const { page, pageSize } = parsePagination(new URL(req.url).searchParams);
    const where = {};
    const [total, articles] = await Promise.all([
      db.article.count({ where }),
      db.article.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
        skip: paginationSkip(page, pageSize),
        take: pageSize,
      }),
    ]);
    return apiSuccess(
      { articles, pagination: buildPaginationMeta(total, page, pageSize), requestId },
      200,
      requestId,
    );
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
      return validationError(parsed.error.flatten().fieldErrors, requestId);
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

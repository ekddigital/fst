import { apiSuccess, badRequest, validationError, created } from "@/lib/api/response";
import { runAdminRoute } from "@/lib/api/admin-route";
import { buildPaginationMeta, paginationSkip, parsePagination } from "@/lib/data/pagination";
import { db } from "@/lib/db";
import { billCreateSchema } from "@/lib/validations/admin";

export async function GET(request: Request) {
  return runAdminRoute(request, async (req, requestId) => {
    const { page, pageSize } = parsePagination(new URL(req.url).searchParams);
    const [total, bills] = await Promise.all([
      db.bill.count(),
      db.bill.findMany({
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        skip: paginationSkip(page, pageSize),
        take: pageSize,
      }),
    ]);
    return apiSuccess({ bills, pagination: buildPaginationMeta(total, page, pageSize), requestId }, 200, requestId);
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

    const parsed = billCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors, requestId);
    }

    const bill = await db.bill.create({
      data: {
        description: parsed.data.description,
        amount: parsed.data.amount,
        status: parsed.data.status ?? "PENDING",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        notes: parsed.data.notes ?? null,
      },
    });

    return created({ bill, requestId }, requestId);
  });
}

import { apiSuccess, resolveRequestId, serverError } from "@/lib/api/response";
import { getResourceCategories } from "@/lib/data/catalog";

export async function GET(request: Request) {
  const requestId = resolveRequestId(request.headers.get("x-request-id"));

  try {
    const categories = await getResourceCategories();
    return apiSuccess({ categories, requestId }, 200, requestId);
  } catch (err) {
    console.error(
      JSON.stringify({ level: "error", message: "Failed to load resources", requestId, route: "resources", err }),
    );
    return serverError(undefined, requestId);
  }
}

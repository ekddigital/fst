import { handleFormPost } from "@/lib/api/form-handler";
import { db } from "@/lib/db";
import { resourceViewSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  return handleFormPost(request, {
    route: "resource-view",
    schema: resourceViewSchema,
    unavailableMessage: "Watch tracking is temporarily unavailable.",
    logLabel: "Resource view tracking failed",
    persist: async (data) => {
      const resource = await db.resource.findUnique({ where: { id: data.resourceId }, select: { id: true } });
      if (!resource) {
        throw new Error("Resource not found");
      }

      const view = await db.resourceView.create({
        data: {
          resourceId: data.resourceId,
          durationSeconds: data.durationSeconds,
          sessionId: data.sessionId,
        },
      });
      return { id: view.id };
    },
  });
}

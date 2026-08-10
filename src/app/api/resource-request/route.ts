import { resourceRequestSchema } from "@/lib/validations/forms";
import { db } from "@/lib/db";
import { handleFormPost } from "@/lib/api/form-handler";
import { resolveResourceTitle } from "@/lib/data/catalog";

export async function POST(request: Request) {
  return handleFormPost(request, {
    route: "resource-request",
    schema: resourceRequestSchema,
    unavailableMessage: "Resource requests are not configured yet. Please contact Teacher Joe directly.",
    logLabel: "Resource request failed",
    persist: async (data) => {
      const resourceTitle = (await resolveResourceTitle(data.resourceSlug)) ?? data.resourceSlug;
      return db.resourceRequest.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          wechatId: data.wechatId ?? null,
          resourceSlug: data.resourceSlug,
          resourceTitle,
          status: "PENDING",
        },
      });
    },
  });
}

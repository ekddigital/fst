import { contactSchema } from "@/lib/validations/forms";
import { db } from "@/lib/db";
import { handleFormPost } from "@/lib/api/form-handler";

export async function POST(request: Request) {
  return handleFormPost(request, {
    route: "contact",
    schema: contactSchema,
    unavailableMessage: "Contact form is not configured yet. Please email Teacher Joe directly.",
    logLabel: "Contact submission failed",
    persist: (data) => db.contactSubmission.create({ data }),
  });
}

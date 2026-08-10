import { assessmentSchema } from "@/lib/validations/forms";
import { db } from "@/lib/db";
import { handleFormPost } from "@/lib/api/form-handler";

export async function POST(request: Request) {
  return handleFormPost(request, {
    route: "assessment",
    schema: assessmentSchema,
    unavailableMessage: "Assessment submissions are not configured yet. Please contact Teacher Joe directly.",
    logLabel: "Assessment submission failed",
    persist: (data) =>
      db.assessmentSubmission.create({
        data: {
          studentName: data.studentName,
          parentEmail: data.parentEmail,
          answers: data.answers,
        },
      }),
  });
}

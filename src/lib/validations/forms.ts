import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Please enter a valid email address").max(191).trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000).trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const resourceRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(191).trim(),
  email: z.string().email("Please enter a valid email address").max(191).trim(),
  wechatId: z.string().max(191).trim(),
  resourceSlug: z.string().min(1, "Please select a resource"),
});

export type ResourceRequestInput = z.infer<typeof resourceRequestSchema>;

export function createAssessmentSchema(questionIds: string[]) {
  return z.object({
    assessmentId: z.string().min(1, "Assessment is required"),
    studentName: z.string().min(1, "Student name is required").max(100).trim(),
    parentEmail: z
      .string()
      .max(191)
      .trim()
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "Please enter a valid email address",
      }),
    age: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 3 && Number(value) <= 18),
        { message: "Age must be between 3 and 18" },
      ),
    answers: z
      .record(z.string(), z.string())
      .refine(
        (answers) => questionIds.every((id) => answers[id]?.trim()),
        { message: "Please answer all questions before submitting" },
      ),
  });
}

export type AssessmentInput = z.infer<ReturnType<typeof createAssessmentSchema>>;

export const assessmentApiSchema = z.object({
  assessmentId: z.string().min(1, "Assessment is required"),
  studentName: z.string().min(1, "Student name is required").max(100).trim(),
  parentEmail: z
    .string()
    .max(191)
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Please enter a valid email address",
    }),
  age: z.number().int().min(3).max(18).optional(),
  answers: z.record(z.string(), z.string()).refine(
    (answers) => Object.keys(answers).length > 0,
    { message: "Please answer all questions before submitting" },
  ),
});

export type AssessmentApiInput = z.infer<typeof assessmentApiSchema>;

export function normalizeAssessmentPayload(data: AssessmentInput): AssessmentApiInput {
  return {
    assessmentId: data.assessmentId,
    studentName: data.studentName,
    parentEmail: data.parentEmail.trim() === "" ? undefined : data.parentEmail.trim(),
    age: data.age.trim() === "" ? undefined : Number(data.age),
    answers: data.answers,
  };
}

export function normalizeResourceRequestPayload(data: ResourceRequestInput) {
  const wechatId = data.wechatId.trim();
  return {
    fullName: data.fullName,
    email: data.email,
    resourceSlug: data.resourceSlug,
    ...(wechatId ? { wechatId } : {}),
  };
}

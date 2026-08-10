import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Please enter a valid email address").max(191).trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000).trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const assessmentSchema = z.object({
  studentName: z.string().min(1, "Student name is required").max(100).trim(),
  parentEmail: z.string().email("Please enter a valid email address").max(191).trim(),
  answers: z.record(z.string(), z.string()),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;

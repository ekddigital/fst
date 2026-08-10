import { BillStatus, PromotionPlacement, QuestionType, ResourceType } from "@prisma/client";
import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(191)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const reorderIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const resourceReorderSchema = z.object({
  categoryId: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1),
});

export const categoryCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().omit({ slug: true });

export const resourceCreateSchema = z.object({
  categoryId: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  type: z.nativeEnum(ResourceType),
  videoUrl: z.string().max(512).optional().nullable(),
  pdfPath: z.string().max(512).optional().nullable(),
  externalUrl: z.string().max(512).optional().nullable(),
  articleSlug: z.string().max(191).optional().nullable(),
  subsection: z.string().max(191).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
  requestable: z.boolean().optional(),
});

export const resourceUpdateSchema = resourceCreateSchema.partial().omit({ slug: true, categoryId: true });

export const assessmentCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  targetAge: z.string().max(64).optional().nullable(),
  published: z.boolean().optional(),
});

export const assessmentUpdateSchema = assessmentCreateSchema.partial().omit({ slug: true });

export const questionCreateSchema = z.object({
  section: z.string().min(1).max(64),
  sortOrder: z.number().int().min(0).optional(),
  prompt: z.string().min(1).max(10000),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string().min(1)).optional().nullable(),
  correctAnswer: z.string().max(512).optional().nullable(),
  points: z.number().int().min(1).max(100).optional(),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const resourceListQuerySchema = z.object({
  categoryId: z.string().optional(),
});

export const articleCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional().nullable(),
  content: z.string().min(1),
  coverImage: z.string().max(512).optional().nullable(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial().omit({ slug: true });

export const billCreateSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.coerce.number().positive().max(9999999),
  status: z.nativeEnum(BillStatus).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const billUpdateSchema = billCreateSchema.partial();

export const promotionCreateSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(10000),
  active: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  placement: z.nativeEnum(PromotionPlacement).optional(),
});

export const promotionUpdateSchema = promotionCreateSchema.partial();

export const resourceViewSchema = z.object({
  resourceId: z.string().min(1),
  durationSeconds: z.number().int().min(0).max(86400),
  sessionId: z.string().min(8).max(64),
});

import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function parsePagination(searchParams: URLSearchParams) {
  return paginationQuerySchema.parse(Object.fromEntries(searchParams));
}

export function buildPaginationMeta(total: number, page: number, pageSize: number): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function paginationSkip(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}

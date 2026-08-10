import type { PrismaPromise } from "@prisma/client";
import { db } from "@/lib/db";

export async function reorderByIds(
  ids: string[],
  update: (id: string, sortOrder: number) => PrismaPromise<unknown>,
): Promise<void> {
  await db.$transaction(ids.map((id, index) => update(id, index + 1)));
}

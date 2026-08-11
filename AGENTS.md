# Fast Start Talking (FST) — Agent Index

Next.js full-stack app (public site + `/admin` CMS). Compose prompts from [`../.prompt/AGENTS.md`](../.prompt/AGENTS.md).

| Task | Read |
|------|------|
| Always | [master/master-prompt](../.prompt/master/master-prompt/AGENTS.md) · [dry-modular-ui](../.prompt/engineering/dry-modular-ui/AGENTS.md) · [theme-design-tokens](../.prompt/engineering/theme-design-tokens/AGENTS.md) · [security-auth-testing](../.prompt/engineering/security-auth-testing/AGENTS.md) · [validation-errors-feedback](../.prompt/engineering/validation-errors-feedback/AGENTS.md) |
| Role | [full-stack-engineer](../.prompt/system/full-stack-engineer/AGENTS.md) |
| Stack | [web-app-nextjs](../.prompt/domains/web-app-nextjs/AGENTS.md) · [restful-api](../.prompt/domains/restful-api/AGENTS.md) · [api-backend](../.prompt/domains/api-backend/AGENTS.md) · [database-design](../.prompt/domains/database-design/AGENTS.md) · [typescript](../.prompt/languages/typescript/AGENTS.md) |
| Admin CMS | [admin-dashboard](../.prompt/products/admin-dashboard/AGENTS.md) |
| Workflows | [testing](../.prompt/workflows/testing/AGENTS.md) · [debugging](../.prompt/workflows/debugging/AGENTS.md) · [code-review](../.prompt/workflows/code-review/AGENTS.md) |

**FST conventions:** Zod schemas in `src/lib/validations/` · API helpers in `src/lib/api/response.ts` · admin auth via `src/lib/auth/admin.ts` + `runAdminRoute` · admin client fetch in `src/lib/admin/client.ts` · Prisma in `prisma/schema.prisma`. Verify before push: `cd fst && npx tsc --noEmit && npm run build`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

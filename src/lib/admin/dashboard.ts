import { ResourceType } from "@prisma/client";
import { db } from "@/lib/db";

export type DashboardStats = {
  categories: number;
  resources: number;
  videos: number;
  articles: number;
  publishedArticles: number;
  assessments: number;
  resourceRequests: number;
  pendingResourceRequests: number;
  assessmentSubmissions: number;
  contactSubmissions: number;
  pendingBills: number;
  totalWatchSeconds: number;
  activePromotions: number;
};

export type ActivityItem = {
  id: string;
  type: "article" | "resource" | "assessment" | "contact" | "resource_request" | "bill";
  title: string;
  subtitle?: string;
  createdAt: Date;
  href?: string;
};

export type SubmissionTrend = {
  date: string;
  assessments: number;
  contacts: number;
  resourceRequests: number;
};

export type TopVideo = {
  resourceId: string;
  title: string;
  totalSeconds: number;
  viewCount: number;
};

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    categories,
    resources,
    videos,
    articles,
    publishedArticles,
    assessments,
    resourceRequests,
    pendingResourceRequests,
    assessmentSubmissions,
    contactSubmissions,
    pendingBills,
    watchAgg,
    activePromotions,
  ] = await Promise.all([
    db.resourceCategory.count(),
    db.resource.count(),
    db.resource.count({ where: { type: ResourceType.VIDEO } }),
    db.article.count(),
    db.article.count({ where: { published: true } }),
    db.assessment.count(),
    db.resourceRequest.count(),
    db.resourceRequest.count({ where: { status: "PENDING" } }),
    db.assessmentSubmission.count(),
    db.contactSubmission.count(),
    db.bill.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    db.resourceView.aggregate({ _sum: { durationSeconds: true } }),
    db.promotion.count({ where: { active: true } }),
  ]);

  return {
    categories,
    resources,
    videos,
    articles,
    publishedArticles,
    assessments,
    resourceRequests,
    pendingResourceRequests,
    assessmentSubmissions,
    contactSubmissions,
    pendingBills,
    totalWatchSeconds: watchAgg._sum.durationSeconds ?? 0,
    activePromotions,
  };
}

export async function getNavBadges() {
  const [pendingResourceRequests, pendingBills, recentContacts] = await Promise.all([
    db.resourceRequest.count({ where: { status: "PENDING" } }),
    db.bill.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    db.contactSubmission.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    submissions: pendingResourceRequests + recentContacts,
    bills: pendingBills,
  };
}

export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const [articles, resources, submissions, contacts, requests, bills] = await Promise.all([
    db.article.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    db.resource.findMany({ orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    db.assessmentSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, studentName: true, createdAt: true, assessment: { select: { title: true } } },
    }),
    db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    }),
    db.resourceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, fullName: true, resourceTitle: true, createdAt: true },
    }),
    db.bill.findMany({
      orderBy: { updatedAt: "desc" },
      take: 2,
      select: { id: true, description: true, updatedAt: true, status: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...articles.map((a) => ({
      id: a.id,
      type: "article" as const,
      title: a.title,
      subtitle: "Blog post updated",
      createdAt: a.updatedAt,
      href: "/admin/articles",
    })),
    ...resources.map((r) => ({
      id: r.id,
      type: "resource" as const,
      title: r.title,
      subtitle: "Resource updated",
      createdAt: r.updatedAt,
      href: "/admin/resources",
    })),
    ...submissions.map((s) => ({
      id: s.id,
      type: "assessment" as const,
      title: `${s.studentName} — ${s.assessment.title}`,
      subtitle: "Assessment completed",
      createdAt: s.createdAt,
      href: "/admin/submissions",
    })),
    ...contacts.map((c) => ({
      id: c.id,
      type: "contact" as const,
      title: c.name,
      subtitle: "Contact form message",
      createdAt: c.createdAt,
      href: "/admin/submissions",
    })),
    ...requests.map((r) => ({
      id: r.id,
      type: "resource_request" as const,
      title: r.fullName,
      subtitle: `Requested: ${r.resourceTitle}`,
      createdAt: r.createdAt,
      href: "/admin/submissions",
    })),
    ...bills.map((b) => ({
      id: b.id,
      type: "bill" as const,
      title: b.description,
      subtitle: `Bill ${b.status.toLowerCase()}`,
      createdAt: b.updatedAt,
      href: "/admin/bills",
    })),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export async function getSubmissionTrends(days = 14): Promise<SubmissionTrend[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const [assessments, contacts, requests] = await Promise.all([
    db.assessmentSubmission.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.contactSubmission.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.resourceRequest.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const dayKeys = lastNDays(days);
  const trendMap = new Map<string, SubmissionTrend>(
    dayKeys.map((d) => [dateKey(d), { date: dateKey(d), assessments: 0, contacts: 0, resourceRequests: 0 }]),
  );

  for (const row of assessments) {
    const key = dateKey(row.createdAt);
    const entry = trendMap.get(key);
    if (entry) entry.assessments += 1;
  }
  for (const row of contacts) {
    const key = dateKey(row.createdAt);
    const entry = trendMap.get(key);
    if (entry) entry.contacts += 1;
  }
  for (const row of requests) {
    const key = dateKey(row.createdAt);
    const entry = trendMap.get(key);
    if (entry) entry.resourceRequests += 1;
  }

  return Array.from(trendMap.values());
}

export async function getTopVideos(limit = 5): Promise<TopVideo[]> {
  const grouped = await db.resourceView.groupBy({
    by: ["resourceId"],
    _sum: { durationSeconds: true },
    _count: { id: true },
    orderBy: { _sum: { durationSeconds: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const resources = await db.resource.findMany({
    where: { id: { in: grouped.map((g) => g.resourceId) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(resources.map((r) => [r.id, r.title]));

  return grouped.map((g) => ({
    resourceId: g.resourceId,
    title: titleMap.get(g.resourceId) ?? "Unknown video",
    totalSeconds: g._sum.durationSeconds ?? 0,
    viewCount: g._count.id,
  }));
}

export async function getAssessmentStats() {
  const [totalSubmissions, avgScore, byAssessment] = await Promise.all([
    db.assessmentSubmission.count(),
    db.assessmentSubmission.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    }),
    db.assessmentSubmission.groupBy({
      by: ["assessmentId"],
      _count: { id: true },
      _avg: { score: true },
    }),
  ]);

  const assessments = await db.assessment.findMany({
    where: { id: { in: byAssessment.map((a) => a.assessmentId) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(assessments.map((a) => [a.id, a.title]));

  return {
    totalSubmissions,
    averageScore: avgScore._avg.score ?? null,
    byAssessment: byAssessment.map((a) => ({
      assessmentId: a.assessmentId,
      title: titleMap.get(a.assessmentId) ?? "Unknown",
      count: a._count.id,
      averageScore: a._avg.score ?? null,
    })),
  };
}

export async function getActivePromotions() {
  const { withDb } = await import("@/lib/db");
  const now = new Date();
  return withDb(
    () =>
      db.promotion.findMany({
        where: {
          active: true,
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: { gte: now } },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );
}

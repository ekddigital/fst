import {
  BookOpen,
  ClipboardList,
  Clock,
  FolderOpen,
  MessageSquare,
  Newspaper,
  Receipt,
  Video,
} from "lucide-react";
import { SubmissionTrendChart } from "@/components/admin/dashboard-charts";
import {
  GettingStartedGuide,
  QuickActionsPanel,
  RecentActivityFeed,
  StatCard,
} from "@/components/admin/dashboard-sections";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDashboardStats, getRecentActivity, getSubmissionTrends } from "@/lib/admin/dashboard";
import { db, isDatabaseConfigured, withDb } from "@/lib/db";

function formatWatchTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <AdminPageHeader
          title="Welcome to your dashboard"
          description="DATABASE_URL is not configured. Add it to your .env file to get started."
        />
      </div>
    );
  }

  const [stats, activity, trends, pendingRequests] = await Promise.all([
    withDb(() => getDashboardStats(), {
      categories: 0,
      resources: 0,
      videos: 0,
      articles: 0,
      publishedArticles: 0,
      assessments: 0,
      resourceRequests: 0,
      pendingResourceRequests: 0,
      assessmentSubmissions: 0,
      contactSubmissions: 0,
      pendingBills: 0,
      totalWatchSeconds: 0,
      activePromotions: 0,
    }),
    withDb(() => getRecentActivity(8), []),
    withDb(() => getSubmissionTrends(14), []),
    withDb(() => db.resourceRequest.count({ where: { status: "PENDING" } }), 0),
  ]);

  const totalSubmissions = stats.assessmentSubmissions + stats.contactSubmissions + stats.resourceRequests;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Welcome back!"
        description="Here's what's happening on Fast Start Talking. Use the cards below to see stats at a glance, or jump to a quick action."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blog Posts"
          value={stats.articles}
          sublabel={`${stats.publishedArticles} published`}
          href="/admin/articles"
          icon={Newspaper}
        />
        <StatCard
          label="Videos & Resources"
          value={stats.resources}
          sublabel={`${stats.videos} videos`}
          href="/admin/resources"
          icon={Video}
        />
        <StatCard
          label="Assessments Taken"
          value={stats.assessmentSubmissions}
          sublabel={`${stats.assessments} quizzes available`}
          href="/admin/submissions"
          icon={ClipboardList}
        />
        <StatCard
          label="Messages & Requests"
          value={totalSubmissions}
          sublabel={
            pendingRequests > 0
              ? `${pendingRequests} resource requests pending`
              : `${stats.contactSubmissions} contact messages`
          }
          href="/admin/submissions"
          icon={MessageSquare}
          highlight={pendingRequests > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Content Categories"
          value={stats.categories}
          href="/admin/categories"
          icon={FolderOpen}
        />
        <StatCard
          label="Total Watch Time"
          value={formatWatchTime(stats.totalWatchSeconds)}
          sublabel="Across all videos"
          href="/admin/watch-time"
          icon={Clock}
        />
        <StatCard
          label="Active Promotions"
          value={stats.activePromotions}
          href="/admin/promotions"
          icon={BookOpen}
        />
        <StatCard
          label="Open Bills"
          value={stats.pendingBills}
          sublabel="Pending or overdue"
          href="/admin/bills"
          icon={Receipt}
          highlight={stats.pendingBills > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SubmissionTrendChart data={trends} />
        <RecentActivityFeed items={activity} />
      </div>

      <QuickActionsPanel />
      <GettingStartedGuide />
    </div>
  );
}

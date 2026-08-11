"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SubmissionTrendChart, WatchTimeBarChart } from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin/client";
import { formatAdminErrorMessage } from "@/lib/admin/api-feedback";
import { LoadingScreen } from "@/components/ui/loading-screen";

type AnalyticsData = {
  trends: Array<{ date: string; assessments: number; contacts: number; resourceRequests: number }>;
  topVideos: Array<{ resourceId: string; title: string; totalSeconds: number; viewCount: number }>;
  assessmentStats: {
    totalSubmissions: number;
    averageScore: number | null;
    byAssessment: Array<{ assessmentId: string; title: string; count: number; averageScore: number | null }>;
  };
  watchTime: {
    totalSeconds: number;
    totalViews: number;
    uniqueSessions: number;
    videoCount: number;
  };
};

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} minutes`;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await adminFetch<AnalyticsData>("/api/admin/analytics");
    if (res.success) setData(res.data);
    else toast.error(formatAdminErrorMessage(res.error, res.requestId));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Analytics Overview"
          description="See how students and parents interact with your site."
          breadcrumbs={[{ label: "Analytics" }]}
        />
        <LoadingScreen message="Loading analytics…" variant="section" gradient={false} className="min-h-[240px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics Overview"
        description="See how students and parents interact with your site — assessments, messages, and video watch time."
        breadcrumbs={[{ label: "Analytics" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessment submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.assessmentStats.totalSubmissions}</p>
            {data.assessmentStats.averageScore != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                Average score: {Math.round(data.assessmentStats.averageScore)}%
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total watch time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatWatchTime(data.watchTime.totalSeconds)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.watchTime.videoCount} videos tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Video views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.watchTime.totalViews}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.watchTime.uniqueSessions} unique sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessments available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.assessmentStats.byAssessment.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">With at least one submission</p>
          </CardContent>
        </Card>
      </div>

      <SubmissionTrendChart data={data.trends} />
      <WatchTimeBarChart videos={data.topVideos} />

      {data.assessmentStats.byAssessment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Results by assessment</CardTitle>
            <CardDescription className="text-base">How many students completed each quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {data.assessmentStats.byAssessment.map((a) => (
                <li key={a.assessmentId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-muted-foreground">
                    {a.count} submission{a.count !== 1 ? "s" : ""}
                    {a.averageScore != null && ` · avg ${Math.round(a.averageScore)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

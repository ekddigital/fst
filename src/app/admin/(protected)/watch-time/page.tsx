"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { WatchTimeBarChart } from "@/components/admin/dashboard-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin/client";
import { LoadingScreen } from "@/components/ui/loading-screen";

type WatchData = {
  topVideos: Array<{ resourceId: string; title: string; totalSeconds: number; viewCount: number }>;
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
  if (hours > 0) return `${hours} hours ${mins} min`;
  if (mins > 0) return `${mins} minutes`;
  return `${seconds} seconds`;
}

export default function AdminWatchTimePage() {
  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await adminFetch<WatchData>("/api/admin/analytics");
    if (res.success) {
      setData({ topVideos: res.data.topVideos, watchTime: res.data.watchTime });
    } else toast.error(res.error.message);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Student Watch Time" breadcrumbs={[{ label: "Watch Time" }]} />
        <LoadingScreen message="Loading watch time…" variant="section" gradient={false} className="min-h-[200px]" />
      </div>
    );
  }

  const hasData = data.watchTime.totalViews > 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Student Watch Time"
        description="See how much time visitors spend watching your videos. Tracking starts automatically when someone plays a video on the public site."
        breadcrumbs={[{ label: "Watch Time" }]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/resources">Manage videos</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total watch time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatWatchTime(data.watchTime.totalSeconds)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Play sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.watchTime.totalViews}</p>
            <p className="mt-1 text-sm text-muted-foreground">{data.watchTime.uniqueSessions} unique visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Videos on site</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.watchTime.videoCount}</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <AdminEmptyState
          icon={Clock}
          title="No watch data yet"
          description="Once students and parents play videos on your website, you'll see which videos are most popular and how long people watch."
          actionLabel="Add a video"
          actionHref="/admin/resources?new=1"
        />
      ) : (
        <>
          <WatchTimeBarChart videos={data.topVideos} />
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Top videos detail</CardTitle>
              <CardDescription className="text-base">Ranked by total minutes watched</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {data.topVideos.map((v, i) => (
                  <li key={v.resourceId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span>
                      <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                      {v.title}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(v.totalSeconds / 60)} min · {v.viewCount} session{v.viewCount !== 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

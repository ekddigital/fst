"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubmissionTrend } from "@/lib/admin/dashboard";

function formatShortDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SubmissionTrendChart({ data }: { data: SubmissionTrend[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
    total: d.assessments + d.contacts + d.resourceRequests,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Activity over the last 2 weeks</CardTitle>
        <CardDescription className="text-base">
          Assessments completed, contact messages, and resource requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.every((d) => d.total === 0) ? (
          <p className="py-12 text-center text-muted-foreground">
            No activity yet — once students and parents use the site, trends will appear here.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))" }}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as SubmissionTrend | undefined;
                    return row ? formatShortDate(row.date) : "";
                  }}
                />
                <Bar dataKey="assessments" name="Assessments" fill="hsl(200 62% 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contacts" name="Contact messages" fill="hsl(200 45% 70%)" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="resourceRequests"
                  name="Resource requests"
                  fill="hsl(200 35% 82%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WatchTimeBarChart({
  videos,
}: {
  videos: Array<{ title: string; totalSeconds: number; viewCount: number }>;
}) {
  const chartData = videos.map((v) => ({
    name: v.title.length > 28 ? `${v.title.slice(0, 28)}…` : v.title,
    minutes: Math.round(v.totalSeconds / 60),
    views: v.viewCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Top videos by watch time</CardTitle>
        <CardDescription className="text-base">Total minutes watched per video</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Watch time will appear once visitors play videos on the public site.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} unit=" min" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))" }}
                  formatter={(value, name) => [name === "minutes" ? `${value} min` : value, name === "minutes" ? "Watch time" : "Views"]}
                />
                <Bar dataKey="minutes" name="minutes" fill="hsl(200 62% 55%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

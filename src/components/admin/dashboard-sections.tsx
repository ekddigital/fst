import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Clock,
  FolderOpen,
  Megaphone,
  Newspaper,
  Plus,
  Receipt,
  Video,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACTIONS: Array<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  query?: string;
}> = [
  {
    href: "/admin/articles",
    label: "Write a blog post",
    description: "Share tips and news with parents",
    icon: Newspaper,
    query: "?new=1",
  },
  {
    href: "/admin/resources",
    label: "Add a video or resource",
    description: "Upload links to videos, PDFs, or guides",
    icon: Video,
    query: "?new=1",
  },
  {
    href: "/admin/assessments",
    label: "Manage student assessment",
    description: "Edit questions and review results",
    icon: ClipboardList,
  },
  {
    href: "/admin/submissions",
    label: "View submissions",
    description: "Contact messages and assessment results",
    icon: BookOpen,
  },
  {
    href: "/admin/promotions",
    label: "Create a promotion",
    description: "Announce offers on the website",
    icon: Megaphone,
    query: "?new=1",
  },
  {
    href: "/admin/bills",
    label: "Track a bill",
    description: "Record payments and expenses",
    icon: Receipt,
    query: "?new=1",
  },
  {
    href: "/admin/analytics",
    label: "View analytics",
    description: "See trends and performance",
    icon: BarChart3,
  },
  {
    href: "/admin/lessons",
    label: "Build a lesson",
    description: "Combine videos, resources, and assessments",
    icon: FolderOpen,
  },
];

export function QuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quick actions</CardTitle>
        <CardDescription className="text-base">Common tasks — click to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTIONS.map(({ href, label, description, icon: Icon, query }) => (
            <Link
              key={href}
              href={`${href}${query ?? ""}`}
              className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold group-hover:text-primary">{label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function GettingStartedGuide() {
  const sections = [
    {
      title: "Blog Posts",
      body: "Write articles for parents — tips on learning English, exam prep, and updates from Teacher Joe.",
    },
    {
      title: "Videos & Resources",
      body: "Organize videos, PDFs, and guides into categories. Parents browse these on the Videos page.",
    },
    {
      title: "Student Assessments",
      body: "Create quizzes to evaluate students. Results appear under Submissions when parents complete them.",
    },
    {
      title: "Promotions",
      body: "Highlight special offers or announcements with a banner on the homepage.",
    },
    {
      title: "Bills & Invoices",
      body: "Keep track of payments and expenses — useful for bookkeeping, not shown to the public.",
    },
    {
      title: "Watch Time",
      body: "See which videos students watch most. Tracking starts automatically when videos are played.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">What each section does</CardTitle>
        <CardDescription className="text-base">A plain-English guide to the admin dashboard</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ title, body }) => (
          <div key={title} className="rounded-lg bg-muted/50 p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivityFeed({
  items,
}: {
  items: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    createdAt: Date;
    href?: string;
  }>;
}) {
  const typeLabels: Record<string, string> = {
    article: "Blog",
    resource: "Resource",
    assessment: "Assessment",
    contact: "Contact",
    resource_request: "Request",
    bill: "Bill",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recent activity</CardTitle>
          <CardDescription className="text-base">Latest updates across your site</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/analytics">
            <Clock className="size-4" />
            All analytics
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No activity yet. Start by adding content!</p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.subtitle ?? typeLabels[item.type] ?? item.type}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    {item.createdAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {item.href && (
                    <Link href={item.href} className="text-xs text-primary hover:underline">
                      View
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  href,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  href?: string;
  icon: typeof Plus;
  highlight?: boolean;
}) {
  const content = (
    <Card className={`transition-shadow hover:shadow-md ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-5 text-primary" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {sublabel && <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>}
        {href && (
          <p className="mt-3 flex items-center text-sm font-medium text-primary">
            Manage <ArrowRight className="ml-1 size-3.5" />
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

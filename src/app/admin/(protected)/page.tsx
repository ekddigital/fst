import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, FolderOpen, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, isDatabaseConfigured } from "@/lib/db";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-4 text-muted-foreground">DATABASE_URL is not configured.</p>
      </div>
    );
  }

  const [categories, resources, assessments, resourceRequests, assessmentSubmissions, contactSubmissions] =
    await Promise.all([
      db.resourceCategory.count(),
      db.resource.count(),
      db.assessment.count(),
      db.resourceRequest.count(),
      db.assessmentSubmission.count(),
      db.contactSubmission.count(),
    ]);

  const stats = [
    { label: "Categories", value: categories, href: "/admin/categories", icon: FolderOpen },
    { label: "Resources", value: resources, href: "/admin/resources", icon: BookOpen },
    { label: "Assessments", value: assessments, href: "/admin/assessments", icon: ClipboardList },
    {
      label: "Submissions",
      value: resourceRequests + assessmentSubmissions + contactSubmissions,
      href: "/admin/submissions",
      icon: MessageSquare,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage FST resources, assessments, and submissions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
                <p className="mt-2 flex items-center text-sm text-primary">
                  Manage <ArrowRight className="ml-1 size-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Use up/down arrows to reorder categories, resources, and assessment questions.</p>
          <p>
            For videos and PDFs, paste a path like <code className="rounded bg-muted px-1">/videos/foo.mp4</code> or an
            external URL — files in <code className="rounded bg-muted px-1">public/</code> are served automatically.
          </p>
          <p>
            Subcategory (subsection) groups Cambridge resources under KET, PET, or IELTS on the public page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

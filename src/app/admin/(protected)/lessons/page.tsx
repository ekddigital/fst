import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Video,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    step: 1,
    title: "Create a category",
    description: "Group your lesson materials — e.g. “KET Preparation” or “Phonics for Beginners”.",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    step: 2,
    title: "Add videos and resources",
    description: "Upload video links, PDF worksheets, or guides into that category.",
    href: "/admin/resources",
    icon: Video,
  },
  {
    step: 3,
    title: "Create an assessment (optional)",
    description: "Build a quiz so students can test what they learned from the lesson.",
    href: "/admin/assessments",
    icon: ClipboardList,
  },
  {
    step: 4,
    title: "Write a blog post (optional)",
    description: "Share tips for parents or explain what the lesson covers.",
    href: "/admin/articles",
    icon: BookOpen,
  },
  {
    step: 5,
    title: "Review submissions",
    description: "Check assessment results and contact messages from parents.",
    href: "/admin/submissions",
    icon: CheckCircle2,
  },
] as const;

const EXAMPLES = [
  {
    title: "Weekly KET lesson",
    items: ["Category: KET Prep", "Video: Grammar review", "PDF: Practice worksheet", "Quiz: 10 questions"],
  },
  {
    title: "Parent resource pack",
    items: ["Category: Parent Guides", "PDF: How to help at home", "Article: Daily habits tip"],
  },
  {
    title: "Trial lesson follow-up",
    items: ["Assessment: Level check", "Video: Welcome message", "Promotion: Book next lesson"],
  },
];

export default function AdminLessonsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Lesson Builder"
        description="A lesson on FST combines videos, resources, and optional assessments. Follow these steps — no coding required."
        breadcrumbs={[{ label: "Lessons" }]}
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl">How lessons work</CardTitle>
              <CardDescription className="text-base">
                You don&apos;t need a separate &ldquo;lesson&rdquo; item — just organize content in categories and link
                an assessment. Parents find everything on the Videos and Assessment pages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(({ step, title, description, href, icon: Icon }) => (
          <Card key={step} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step}
                </span>
                <Icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={href}>
                  Go to step {step} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Example lesson ideas</CardTitle>
          <CardDescription className="text-base">Copy these workflows to get started quickly</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {EXAMPLES.map((ex) => (
            <div key={ex.title} className="rounded-xl border bg-muted/30 p-4">
              <p className="font-semibold">{ex.title}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {ex.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

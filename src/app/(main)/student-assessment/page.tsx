import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getArchivePage } from "@/lib/content";
import { MarkdownContent } from "@/components/content/markdown-content";

export const metadata: Metadata = {
  title: "Student Assessment",
  description: "Free young learners English skills assessment for parents.",
};

export default async function AssessmentPage() {
  const page = await getArchivePage("student-assessment-young-learners");

  return (
    <>
      <PageHero
        title="Student Assessment — Young Learners"
        description="This free assessment helps parents understand their child's English skills in vocabulary, listening, grammar, and communication."
      />
      <ContentSection narrow>
        {page && (
          <div className="mb-10">
            <MarkdownContent content={page.body.split("Start Quiz")[0] ?? page.body} />
          </div>
        )}

        <Card className="overflow-hidden border-border/80 shadow-md">
          <CardHeader>
            <CardTitle>Understanding the results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-lg text-muted-foreground">
            <p>Each section is scored independently:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>8–10 correct:</strong> Strong foundation — ready for more advanced practice
              </li>
              <li>
                <strong>5–7 correct:</strong> Developing skills — some areas need improvement
              </li>
              <li>
                <strong>0–4 correct:</strong> Beginner level — focus on building basic skills
              </li>
            </ul>
          </CardContent>
        </Card>

        <AssessmentForm />
      </ContentSection>
    </>
  );
}

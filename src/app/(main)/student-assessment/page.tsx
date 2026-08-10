import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssessmentBySlug, YOUNG_LEARNERS_ASSESSMENT_SLUG } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Student Assessment",
  description: "Free young learners English skills assessment for parents.",
};

export default async function AssessmentPage() {
  const assessment = await getAssessmentBySlug(YOUNG_LEARNERS_ASSESSMENT_SLUG);

  if (!assessment) {
    return (
      <>
        <PageHero title="Student Assessment" description="Assessment is temporarily unavailable." />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Student Assessment — Young Learners"
        description="This free assessment helps parents understand their child's English skills in vocabulary, grammar, and reading."
      />
      <ContentSection narrow>
        <Card className="mb-10 overflow-hidden border-border/80 shadow-md">
          <CardHeader>
            <CardTitle>{assessment.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg text-muted-foreground">
            {assessment.description && <p>{assessment.description}</p>}
            <p>
              The quiz has <strong>{assessment.questions.length} questions</strong> across three sections: Vocabulary,
              Grammar, and Reading. Each section is scored independently.
            </p>
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

        <AssessmentForm assessment={assessment} />
      </ContentSection>
    </>
  );
}

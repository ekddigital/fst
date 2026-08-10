import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ProgramCard } from "@/components/content/program-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRAND, HERO_IMAGES, PROGRAMS } from "@/lib/brand";

export default function HomePage() {
  return (
    <>
      <PageHero
        title="Learn English. Speak Fluently. Reach Your Goals."
        description="Personalized online English lessons for children, teenagers, and adults. Build speaking confidence, improve communication skills, and prepare for Cambridge KET, PET, and IELTS assessments with an experienced teacher."
        image={HERO_IMAGES.home}
        imageAlt="Teacher Joe with student Felix during an online English lesson"
        actions={[
          { href: "/student-assessment", label: "Take Free Assessment" },
          { href: "/contact", label: "Book a Free Trial", variant: "outline" },
        ]}
      />

      <ContentSection>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Find Your Child&apos;s English Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Not sure which English skills your child needs to improve? Our free assessment helps parents
                understand current strengths and areas for growth in vocabulary, grammar, listening, and reading.
              </p>
              <Button asChild size="lg">
                <Link href="/student-assessment">Take Free Assessment</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Find the Right English Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                From everyday English to Cambridge exam preparation — explore programs designed for young learners
                through advanced IELTS students.
              </p>
              <Button variant="outline" asChild size="lg">
                <Link href="/programs">Explore Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      <ContentSection className="bg-muted/30">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Our Programs</h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Cambridge English preparation and everyday English for every stage
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {PROGRAMS.map((program) => (
            <ProgramCard
              key={program.slug}
              title={program.title}
              summary={program.summary}
              href={`/programs/${program.slug}`}
            />
          ))}
        </div>
      </ContentSection>

      <ContentSection>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Why Choose {BRAND.siteName}?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Experienced Teacher</h3>
                <p className="text-lg text-muted-foreground">
                  Teacher Joe has spent many years helping students of all ages develop confident English communication
                  — from young learners beginning their journey to students preparing for international assessments.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Personalized Lessons</h3>
                <p className="text-lg text-muted-foreground">
                  Every student is different. Lessons are adapted to each learner&apos;s level, goals, and learning needs
                  with clear plans and regular feedback.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Cambridge Exam Focus</h3>
                <p className="text-lg text-muted-foreground">
                  Expert coaching for KET, PET, and IELTS — building the skills, strategies, and confidence needed for
                  exam success.
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/about">Meet Teacher Joe</Link>
            </Button>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={HERO_IMAGES.teacher}
              alt="Teacher Joe"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </ContentSection>

      <ContentSection className="bg-primary/10 text-center">
        <h2 className="text-3xl font-bold">Ready to Start?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
          Contact Teacher Joe to ask questions or arrange a free trial lesson today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/student-assessment">Free Assessment</Link>
          </Button>
        </div>
      </ContentSection>
    </>
  );
}

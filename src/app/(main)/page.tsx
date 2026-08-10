import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles, Target, Users, ShieldCheck, Clock, Video } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ProgramCard } from "@/components/content/program-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRAND, HERO_IMAGES, PROGRAMS } from "@/lib/brand";

const FEATURES = [
  {
    icon: Users,
    title: "Experienced Teacher",
    description:
      "Teacher Joe has spent many years helping students of all ages develop confident English communication — from young learners to IELTS candidates.",
  },
  {
    icon: Target,
    title: "Personalized Lessons",
    description:
      "Every student is different. Lessons adapt to each learner's level, goals, and needs with clear plans and regular feedback.",
  },
  {
    icon: BookOpen,
    title: "Cambridge Exam Focus",
    description:
      "Expert coaching for KET, PET, and IELTS — building the skills, strategies, and confidence needed for exam success.",
  },
] as const;

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: "Safe online learning environment" },
  { icon: Clock, label: "Flexible scheduling for busy families" },
  { icon: Video, label: "Live one-to-one lessons via video" },
] as const;

export default function HomePage() {
  return (
    <>
      <PageHero
        title="Learn English. Speak Fluently. Reach Your Goals."
        description="Personalized online English lessons for children, teenagers, and adults. Build speaking confidence, improve communication skills, and prepare for Cambridge KET, PET, and IELTS with an experienced teacher."
        image={HERO_IMAGES.home}
        imageAlt="Teacher Joe with student Felix during an online English lesson"
        actions={[
          { href: "/student-assessment", label: "Take Free Assessment" },
          { href: "/contact", label: "Book a Free Trial", variant: "outline" },
        ]}
      />

      <ContentSection>
        <div className="mb-10 flex flex-wrap justify-center gap-6 md:gap-10">
          {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="size-5 shrink-0 text-primary" aria-hidden />
              <span className="text-base font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="group border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles aria-hidden />
              </div>
              <CardTitle className="text-2xl">Find Your Child&apos;s English Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Not sure which skills your child needs to improve? Our free assessment helps parents understand
                strengths and growth areas in vocabulary, grammar, listening, and reading.
              </p>
              <Button asChild size="lg" className="shadow-sm">
                <Link href="/student-assessment">
                  Take Free Assessment
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-secondary/50 text-foreground">
                <BookOpen aria-hidden />
              </div>
              <CardTitle className="text-2xl">Find the Right English Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                From everyday English to Cambridge exam preparation — explore programs designed for young learners
                through advanced IELTS students.
              </p>
              <Button variant="outline" asChild size="lg">
                <Link href="/programs">
                  Explore Courses
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ContentSection>

      <ContentSection className="bg-gradient-to-b from-muted/40 to-muted/20">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Programs</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Cambridge English for Every Stage</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
            KET, PET, IELTS preparation and English Starter for young learners
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {PROGRAMS.map((program) => (
            <ProgramCard
              key={program.slug}
              slug={program.slug}
              title={program.title}
              summary={program.summary}
              href={`/programs/${program.slug}`}
            />
          ))}
        </div>
      </ContentSection>

      <ContentSection>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Why {BRAND.siteName}</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Teaching That Meets You Where You Are</h2>
            </div>
            <div className="space-y-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-1 text-lg text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="shadow-md">
              <Link href="/about">Meet Teacher Joe</Link>
            </Button>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50">
            <Image
              src={HERO_IMAGES.teacher}
              alt="Teacher Joe"
              fill
              className="object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </ContentSection>

      <ContentSection className="bg-gradient-to-r from-primary/15 via-primary/10 to-secondary/20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Start?</h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Contact Teacher Joe to ask questions or arrange a free trial lesson today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="shadow-md">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/student-assessment">Free Assessment</Link>
            </Button>
          </div>
        </div>
      </ContentSection>
    </>
  );
}

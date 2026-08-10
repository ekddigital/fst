import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Map,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContentSection } from "@/components/content/content-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEACHER_PORTRAIT = "/images/Weixin-Image_20260712205128_535_52-3.jpg";
const CLASSROOM_PHOTO = "/images/Weixin-Image_20260712205132_540_52-1.jpg";

const TRAVEL_BOOKS = [
  { src: "/images/Grandpa-frozen-land-cover-page1.jpg", alt: "Grandpa Travels — Frozen Land book cover" },
  { src: "/images/Kenya-book-cover.jpg", alt: "Grandpa Travels — Kenya book cover" },
  { src: "/images/Grandpa-China-cover-page.jpg", alt: "Grandpa Travels — China book cover" },
  { src: "/images/Brazil-cover-page-scaled.jpg", alt: "Grandpa Travels — Brazil book cover" },
  { src: "/images/Austria-front-page-scaled.jpg", alt: "Grandpa Travels — Austria book cover" },
] as const;

const PHILOSOPHY = [
  {
    icon: Target,
    title: "Clear Goals",
    description:
      "Students need to understand what they want to achieve. Clear goals help students stay motivated and understand their learning path.",
  },
  {
    icon: BookOpen,
    title: "Good Plans",
    description:
      "Students improve faster when they follow the right steps. I help students create a learning plan that matches their level and goals.",
  },
  {
    icon: Compass,
    title: "Teaching Beyond the Classroom",
    description:
      "My goal is to create a positive learning environment where students feel comfortable participating, making mistakes, and continuing to improve.",
  },
  {
    icon: Sparkles,
    title: "Regular Practice",
    description:
      "English improves through consistent use. Students develop stronger skills by practicing regularly and applying what they learn.",
  },
] as const;

type AboutSectionProps = {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  image?: { src: string; alt: string; aspect?: "portrait" | "landscape" | "square" };
  reverse?: boolean;
  className?: string;
};

function AboutSection({ title, icon: Icon, children, image, reverse, className }: AboutSectionProps) {
  const aspectClass =
    image?.aspect === "landscape"
      ? "aspect-[4/3]"
      : image?.aspect === "square"
        ? "aspect-square"
        : "aspect-[3/4]";

  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        reverse && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
        className,
      )}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">{children}</div>
      </div>
      {image && (
        <div
          className={cn(
            "relative mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50 lg:max-w-none",
            aspectClass,
          )}
        >
          <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 1024px) 90vw, 45vw" />
        </div>
      )}
    </div>
  );
}

export function AboutPageContent() {
  return (
    <>
      <ContentSection className="pt-8 md:pt-12">
        <AboutSection title="My Teaching Experience" icon={GraduationCap}>
          <p>
            I have spent many years helping students develop their English skills and become more confident communicators.
          </p>
          <p>
            I have taught students of different ages and levels, from young learners beginning their English journey to
            students preparing for international English assessments.
          </p>
          <p>
            Every student is different. My teaching approach focuses on understanding each student&apos;s needs and
            creating a learning plan that helps them reach their goals.
          </p>
        </AboutSection>
      </ContentSection>

      <ContentSection className="bg-gradient-to-b from-primary/5 to-background">
        <AboutSection title="Supporting Students and Parents" icon={HeartHandshake} reverse>
          <p>
            Learning English is a journey that requires patience, practice, and encouragement.
          </p>
          <p>
            I believe parents play an important role in supporting their children&apos;s progress. When teachers,
            students, and parents work together, students can develop better learning habits and achieve their goals.
          </p>
          <p>
            My goal is to encourage students to practice regularly, enjoy learning English, and understand that progress
            comes through consistent effort.
          </p>
        </AboutSection>
      </ContentSection>

      <ContentSection>
        <AboutSection
          title="Cambridge English Preparation"
          icon={Globe2}
          image={{ src: TEACHER_PORTRAIT, alt: "Teacher Joe", aspect: "portrait" }}
        >
          <p>
            I help students prepare for Cambridge English assessments, including KET, PET, and IELTS.
          </p>
          <p>
            These assessments provide students with clear learning goals and help measure their English development. They
            are valuable tools for understanding a student&apos;s current level and planning the next steps in their
            learning journey.
          </p>
          <p>
            Through focused practice, guidance, and regular feedback, students can develop the skills needed to
            communicate more effectively and prepare for their future goals.
          </p>
        </AboutSection>
      </ContentSection>

      <ContentSection className="bg-muted/30">
        <div className="space-y-10">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Map className="size-6" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Children&apos;s Travel Books</h2>
            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                In addition to teaching English, I have written the Grandpa Travels series of children&apos;s books.
                These books encourage young readers to explore the world through stories, geography, culture, and
                discovery.
              </p>
              <p>
                My goal is to help children develop curiosity about different places and understand that learning
                extends beyond the classroom.
              </p>
              <p>
                Through these books, I combine my love of teaching, travel, and helping young learners discover the world
                around them.
              </p>
              <p className="font-medium text-foreground">Written by Joseph G. Summers</p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 md:gap-6">
            {TRAVEL_BOOKS.map((book) => (
              <li key={book.src}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50 transition-transform hover:scale-[1.02]">
                  <Image
                    src={book.src}
                    alt={book.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, 20vw"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </ContentSection>

      <ContentSection>
        <AboutSection
          title="Beyond the Classroom"
          icon={Users}
          reverse
          image={{ src: CLASSROOM_PHOTO, alt: "Teacher Joe with students", aspect: "landscape" }}
        >
          <p>
            In addition to teaching English, I have had the opportunity to teach and work with students from different
            countries and cultures. These experiences have helped me understand that every learner has a unique
            background, learning style, and goal.
          </p>
          <p>
            Traveling and teaching in different places has shown me that English is more than a subject to study. It is a
            tool that helps people communicate, build relationships, and discover new opportunities.
          </p>
          <p>
            I have also written several children&apos;s travel books designed to encourage curiosity, learning, and
            exploration.
          </p>
          <p>
            I believe language learning is not only about vocabulary and grammar. It is also about discovering the
            world, communicating with others, and developing lifelong learning skills.
          </p>
        </AboutSection>
      </ContentSection>

      <ContentSection className="bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="space-y-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">How I Teach</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">My Teaching Philosophy</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {PHILOSOPHY.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-primary/20 bg-card/80 shadow-md transition-shadow hover:shadow-lg">
                <CardHeader className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ContentSection>

      <ContentSection className="pb-20 md:pb-28">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/10 to-secondary/20 p-8 text-center shadow-lg md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Let&apos;s Work Together</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Learning English is a journey, and I enjoy helping students discover their abilities and reach their goals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="min-h-12 px-8 shadow-md">
              <Link href="/contact">Contact Teacher Joe</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="min-h-12 px-8">
              <Link href="/student-assessment">Free Assessment</Link>
            </Button>
          </div>
        </div>
      </ContentSection>
    </>
  );
}

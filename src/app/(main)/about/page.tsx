import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Globe, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getArchivePage } from "@/lib/content";
import { HERO_IMAGES } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Teacher Joe",
  description: "Meet Teacher Joe — experienced English teacher helping students build confident communication skills.",
};

const HIGHLIGHTS = [
  {
    icon: GraduationCap,
    title: "Experienced Educator",
    description: "Years of teaching students from young learners through IELTS candidates.",
  },
  {
    icon: Globe,
    title: "International Background",
    description: "Teaching experience across cultures with a focus on practical communication.",
  },
  {
    icon: Award,
    title: "Cambridge Exam Specialist",
    description: "Focused preparation for KET, PET, and IELTS with clear learning plans.",
  },
] as const;

export default async function AboutPage() {
  const page = await getArchivePage("about-teacher-joe");

  return (
    <>
      <PageHero
        title="Meet Teacher Joe"
        description="I help students build confident English through practical lessons, clear learning goals, and international teaching experience."
        image={HERO_IMAGES.teacher}
        imageAlt="Teacher Joe"
        actions={[{ href: "/contact", label: "Book a Free Trial" }]}
      />

      <ContentSection>
        <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50 lg:mx-0 lg:max-w-none">
              <Image
                src={HERO_IMAGES.teacher}
                alt="Teacher Joe"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 80vw, 30vw"
                priority
              />
            </div>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="space-y-4 p-6">
                <p className="text-lg font-medium text-foreground">Ready to start learning?</p>
                <p className="text-muted-foreground">
                  Book a free trial lesson or take the student assessment to find the right program.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/contact">Contact Teacher Joe</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/student-assessment">Free Assessment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-border/80 shadow-sm">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {page && <MarkdownContent content={page.body} />}
          </div>
        </div>
      </ContentSection>
    </>
  );
}

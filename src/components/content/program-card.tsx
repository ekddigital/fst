import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, GraduationCap, Languages, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROGRAM_ICONS: Record<string, LucideIcon> = {
  "english-starter": Sparkles,
  ket: BookOpen,
  pet: Languages,
  ielts: GraduationCap,
};

type ProgramCardProps = {
  title: string;
  summary: string;
  href: string;
  slug?: string;
};

export function ProgramCard({ title, summary, href, slug }: ProgramCardProps) {
  const Icon = (slug && PROGRAM_ICONS[slug]) || GraduationCap;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15",
          )}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <CardTitle className="transition-colors group-hover:text-primary">{title}</CardTitle>
        <CardDescription className="line-clamp-3">{summary}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button variant="outline" asChild className="w-full group-hover:border-primary/50 sm:w-auto">
          <Link href={href}>
            Learn more
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

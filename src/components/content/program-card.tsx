import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ProgramCardProps = {
  title: string;
  summary: string;
  href: string;
};

export function ProgramCard({ title, summary, href }: ProgramCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="pb-3">
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

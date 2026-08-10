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
    <Card className="flex h-full flex-col transition-colors hover:border-primary/40 hover:bg-muted/30">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href={href}>
            Learn more
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

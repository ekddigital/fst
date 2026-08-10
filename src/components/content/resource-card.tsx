import Link from "next/link";
import { Download, ExternalLink, FileText, Play } from "lucide-react";
import type { ResourceItem } from "@/lib/data/catalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  if (resource.type === "VIDEO" && resource.videoUrl) {
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video bg-muted">
          <video controls className="h-full w-full" preload="metadata" title={resource.title}>
            <source src={resource.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
      </Card>
    );
  }

  if (resource.type === "GUIDE" && resource.pdfPath) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Download className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <Link href={resource.pdfPath} target="_blank">
              Download Parent Guide (PDF)
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (resource.type === "PDF" && resource.pdfPath) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={resource.pdfPath} target="_blank">
              <Download aria-hidden />
              Download PDF
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (resource.type === "ARTICLE" && resource.articleSlug) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={`/articles/${resource.articleSlug}`}>Read article</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (resource.type === "VIDEO" || resource.videoUrl) {
    return (
      <Card className={cn("overflow-hidden transition-shadow hover:shadow-md")}>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Play className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ExternalLink className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-xl">{resource.title}</CardTitle>
        {resource.description && (
          <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

export function ResourceSubsection({
  title,
  resources,
}: {
  title: string;
  resources: ResourceItem[];
}) {
  if (resources.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground/90">{title}</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

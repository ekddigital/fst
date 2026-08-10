import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import type { ResourceItem } from "@/lib/data/catalog";
import { PdfDocumentCard } from "@/components/content/pdf-document-card";
import { TrackedVideo } from "@/components/content/tracked-video";
import { WordDocumentCard } from "@/components/content/word-document-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDocumentKind } from "@/lib/documents";
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
          <TrackedVideo
            resourceId={resource.id}
            videoUrl={resource.videoUrl}
            title={resource.title}
            className="h-full w-full"
          />
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

  if ((resource.type === "GUIDE" || resource.type === "PDF") && resource.pdfPath) {
    const kind = getDocumentKind(resource.pdfPath);

    if (kind === "word") {
      return (
        <WordDocumentCard
          title={resource.title}
          description={resource.description}
          filePath={resource.pdfPath}
          className={resource.type === "GUIDE" ? "col-span-full" : undefined}
        />
      );
    }

    return (
      <PdfDocumentCard
        title={resource.title}
        description={resource.description}
        pdfPath={resource.pdfPath}
        variant={resource.type === "GUIDE" ? "guide" : "default"}
        className={resource.type === "GUIDE" ? "col-span-full" : undefined}
      />
    );
  }

  if (resource.type === "ARTICLE" && resource.articleSlug) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="lg" className="min-h-11">
            <Link href={`/articles/${resource.articleSlug}`}>Read article</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (resource.type === "EXTERNAL" && resource.externalUrl) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">{resource.title}</CardTitle>
          {resource.description && (
            <CardDescription className="text-base">{truncate(resource.description)}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="lg" className="min-h-11">
            <Link href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
              Open resource
            </Link>
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

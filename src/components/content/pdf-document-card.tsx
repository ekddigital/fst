import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentDownloadButton } from "@/components/content/document-download-button";
import { PdfViewer } from "@/components/content/pdf-viewer";
import { cn } from "@/lib/utils";

type PdfDocumentCardProps = {
  title: string;
  description?: string | null;
  pdfPath: string;
  variant?: "default" | "guide";
  className?: string;
};

function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function PdfDocumentCard({
  title,
  description,
  pdfPath,
  variant = "default",
  className,
}: PdfDocumentCardProps) {
  const isGuide = variant === "guide";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg",
        isGuide && "border-2 border-primary/35 bg-gradient-to-br from-primary/10 via-primary/5 to-background",
        className,
      )}
    >
      <CardHeader className="space-y-3 pb-4">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl text-primary",
            isGuide ? "bg-primary/20" : "bg-primary/10",
          )}
        >
          <FileText className="size-6" aria-hidden />
        </div>
        <CardTitle className={cn("text-xl", isGuide && "text-2xl md:text-3xl")}>{title}</CardTitle>
        {description && (
          <CardDescription className={cn("text-base leading-relaxed", isGuide && "text-lg")}>
            {truncate(description, isGuide ? 280 : 200)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <PdfViewer src={pdfPath} title={title} defaultExpanded={isGuide} />
        <DocumentDownloadButton href={pdfPath} variant={isGuide ? "default" : "outline"} />
      </CardContent>
    </Card>
  );
}

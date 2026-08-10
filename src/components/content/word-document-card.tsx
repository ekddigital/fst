import { FileType2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentDownloadButton } from "@/components/content/document-download-button";
import { getDocumentFilename } from "@/lib/documents";
import { cn } from "@/lib/utils";

type WordDocumentCardProps = {
  title: string;
  description?: string | null;
  filePath: string;
  className?: string;
};

function truncate(text: string, max = 200): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function WordDocumentCard({ title, description, filePath, className }: WordDocumentCardProps) {
  const filename = getDocumentFilename(filePath);

  return (
    <Card
      className={cn(
        "overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-secondary/30 via-background to-primary/5 transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <FileType2 className="size-6" aria-hidden />
        </div>
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
        {description && <CardDescription className="text-base leading-relaxed">{truncate(description)}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center md:p-8">
          <FileType2 className="mx-auto mb-3 size-14 text-primary/70" aria-hidden />
          <p className="text-lg font-medium text-foreground">Microsoft Word document</p>
          <p className="mt-2 text-base text-muted-foreground">
            Word files open best in Microsoft Word or Google Docs. Download{" "}
            <span className="font-medium text-foreground">{filename}</span> to read on your device.
          </p>
        </div>
        <DocumentDownloadButton href={filePath} kind="word" />
      </CardContent>
    </Card>
  );
}

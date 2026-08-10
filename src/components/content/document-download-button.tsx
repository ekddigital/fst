import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocumentDownloadLabel, getDocumentFilename, getDocumentKind, type DocumentKind } from "@/lib/documents";
import { cn } from "@/lib/utils";

type DocumentDownloadButtonProps = {
  href: string;
  label?: string;
  size?: "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
  kind?: DocumentKind;
};

export function DocumentDownloadButton({
  href,
  label,
  size = "lg",
  variant = "default",
  className,
  kind,
}: DocumentDownloadButtonProps) {
  const resolvedKind = kind ?? getDocumentKind(href);
  const downloadLabel = label ?? getDocumentDownloadLabel(resolvedKind);
  const filename = getDocumentFilename(href);

  return (
    <Button asChild size={size} variant={variant} className={cn("min-h-12 gap-2 shadow-sm", className)}>
      <Link href={href} download={filename} target="_blank" rel="noopener noreferrer">
        <Download className="size-5 shrink-0" aria-hidden />
        {downloadLabel}
      </Link>
    </Button>
  );
}

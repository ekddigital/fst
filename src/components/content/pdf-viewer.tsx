"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PdfViewerProps = {
  src: string;
  title: string;
  className?: string;
  defaultExpanded?: boolean;
};

export function PdfViewer({ src, title, className, defaultExpanded = true }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10 gap-2"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <Minimize2 className="size-4" aria-hidden />
              Collapse viewer
            </>
          ) : (
            <>
              <Maximize2 className="size-4" aria-hidden />
              Expand viewer
            </>
          )}
        </Button>
      </div>
      {expanded && (
        <div className="overflow-hidden rounded-xl border-2 border-primary/25 bg-muted/20 shadow-inner ring-1 ring-primary/10">
          <iframe
            src={`${src}#view=FitH&toolbar=1`}
            title={`PDF viewer: ${title}`}
            className="h-[min(75vh,720px)] w-full bg-white"
          />
        </div>
      )}
    </div>
  );
}

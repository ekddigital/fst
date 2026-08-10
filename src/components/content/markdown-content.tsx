import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { resolveFullSizeImagePath } from "@/lib/images";
import { PdfViewer } from "@/components/content/pdf-viewer";
import { DocumentDownloadButton } from "@/components/content/document-download-button";
import { WordDocumentCard } from "@/components/content/word-document-card";
import { getDocumentKind } from "@/lib/documents";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={className ?? "prose-fst"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2 className="text-3xl font-bold">{children}</h2>,
          p: ({ children }) => {
            const text = String(children ?? "").trim();
            if (!text || text === "Ad" || text === ".") return null;
            return <p className="text-lg leading-relaxed text-muted-foreground">{children}</p>;
          },
          h2: ({ children }) => {
            const text = String(children ?? "").trim();
            if (!text || text === "Ad") return null;
            return <h2 className="text-2xl font-semibold">{children}</h2>;
          },
          h3: ({ children }) => <h3 className="text-xl font-semibold">{children}</h3>,
          a: ({ href, children }) => {
            if (href && getDocumentKind(href) === "pdf") {
              return (
                <span className="my-8 block space-y-4">
                  <PdfViewer src={href} title={String(children ?? "PDF document")} />
                  <DocumentDownloadButton href={href} variant="outline" size="default" />
                </span>
              );
            }
            if (href && getDocumentKind(href) === "word") {
              return (
                <WordDocumentCard
                  title={String(children ?? "Word document")}
                  filePath={href}
                  className="my-8"
                />
              );
            }
            return (
              <a href={href} className="font-medium text-primary underline-offset-4 hover:underline">
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") return null;
            if (src.startsWith("/images/")) {
              const fullSrc = resolveFullSizeImagePath(src);
              return (
                <span className="my-6 block overflow-hidden rounded-xl shadow-md">
                  <Image
                    src={fullSrc}
                    alt={alt ?? ""}
                    width={800}
                    height={500}
                    className="h-auto w-full object-cover"
                  />
                </span>
              );
            }
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="my-6 h-auto w-full rounded-xl" loading="lazy" />
            );
          },
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-lg">{children}</ul>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 text-lg italic text-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

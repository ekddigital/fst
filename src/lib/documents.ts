export type DocumentKind = "pdf" | "word" | "other";

export function getDocumentKind(path: string): DocumentKind {
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "word";
  return "other";
}

export function getDocumentFilename(path: string): string {
  return decodeURIComponent(path.split("/").pop() ?? "document");
}

export function getDocumentDownloadLabel(kind: DocumentKind): string {
  switch (kind) {
    case "pdf":
      return "Download PDF";
    case "word":
      return "Download Word Document";
    default:
      return "Download File";
  }
}

"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { adminUpload } from "@/lib/admin/client";
import { formatAdminErrorMessage } from "@/lib/admin/api-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UploadKind } from "@/lib/upload";

type FileUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: UploadKind;
  accept?: string;
  hint?: string;
};

const DEFAULT_ACCEPT: Record<UploadKind, string> = {
  images: "image/jpeg,image/png,image/webp,image/gif",
  videos: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
  other: "application/pdf,.pdf,.doc,.docx",
};

export function FileUploadField({ label, value, onChange, kind, accept, hint }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const res = await adminUpload(file, kind);
    setUploading(false);
    if (!res.success) {
      toast.error(formatAdminErrorMessage(res.error, res.requestId));
      return;
    }
    onChange(res.data.url);
    toast.success("File uploaded");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        ref={inputRef}
        type="file"
        accept={accept ?? (kind ? DEFAULT_ACCEPT[kind] : undefined)}
        disabled={uploading}
        onChange={(e) => void handleFileChange(e.target.files?.[0])}
      />
      {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Uploaded path appears here, or paste a URL"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

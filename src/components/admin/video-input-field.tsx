"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { adminUpload } from "@/lib/admin/client";
import { formatAdminErrorMessage } from "@/lib/admin/api-feedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  detectVideoInputMode,
  getPlatformLabel,
  parseVideoUrl,
  type VideoInputMode,
} from "@/lib/video-url";

type VideoInputFieldProps = {
  value: string;
  onChange: (url: string) => void;
};

const MODE_HINTS: Record<VideoInputMode, string> = {
  upload: "Upload an MP4, WebM, or MOV file. The path is saved automatically after upload.",
  external:
    "Paste a link from YouTube, Facebook, Instagram, Vimeo, TikTok, Dailymotion, Wistia, Streamable, or a direct .mp4/.webm URL.",
  local: "Enter a path under public/ (e.g. /videos/lesson.mp4). Use this for files already on the server.",
};

export function VideoInputField({ value, onChange }: VideoInputFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<VideoInputMode>("upload");
  const [uploading, setUploading] = useState(false);
  const [externalDraft, setExternalDraft] = useState("");
  const [localDraft, setLocalDraft] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const detected = detectVideoInputMode(value);
    setMode(detected);
    if (detected === "external") setExternalDraft(value);
    if (detected === "local") setLocalDraft(value);
  }, [value]);

  const parsed = value ? parseVideoUrl(value) : null;
  const platformLabel = parsed?.ok && parsed.platform ? getPlatformLabel(parsed.platform) : null;

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const res = await adminUpload(file, "videos");
    setUploading(false);
    if (!res.success) {
      toast.error(formatAdminErrorMessage(res.error, res.requestId));
      return;
    }
    onChange(res.data.url);
    toast.success("Video uploaded");
    if (fileRef.current) fileRef.current.value = "";
  }

  function switchMode(next: VideoInputMode) {
    setMode(next);
    if (next === "upload") {
      setExternalDraft("");
      setLocalDraft("");
      if (value.startsWith("http")) onChange("");
    } else if (next === "external") {
      setExternalDraft(value.startsWith("http") ? value : "");
      setLocalDraft("");
      if (value.startsWith("/")) onChange("");
    } else {
      setLocalDraft(value.startsWith("/") ? value : "");
      setExternalDraft("");
      if (value.startsWith("http")) onChange("");
    }
  }

  function applyExternalUrl(url: string) {
    setExternalDraft(url);
    const trimmed = url.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    const result = parseVideoUrl(trimmed);
    if (!result.ok) return;
    onChange(result.normalized);
  }

  function applyLocalPath(path: string) {
    setLocalDraft(path);
    const trimmed = path.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    const result = parseVideoUrl(trimmed);
    if (!result.ok) return;
    onChange(result.normalized);
  }

  function validationError(draft: string): string | null {
    const trimmed = draft.trim();
    if (!trimmed) return null;
    const result = parseVideoUrl(trimmed);
    return result.ok ? null : result.error;
  }

  const externalError = mode === "external" ? validationError(externalDraft) : null;
  const localError = mode === "local" ? validationError(localDraft) : null;

  return (
    <div className="space-y-3">
      <Label>Video source</Label>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["upload", "Upload file"],
            ["external", "External URL"],
            ["local", "Local path"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => switchMode(id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              mode === id
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "upload" && (
        <div className="space-y-2">
          <Input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            disabled={uploading}
            onChange={(e) => void handleFileChange(e.target.files?.[0])}
          />
          {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
        </div>
      )}

      {mode === "external" && (
        <div className="space-y-2">
          <Input
            value={externalDraft}
            onChange={(e) => applyExternalUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          {externalError && <p className="text-xs text-destructive">{externalError}</p>}
        </div>
      )}

      {mode === "local" && (
        <div className="space-y-2">
          <Input
            value={localDraft}
            onChange={(e) => applyLocalPath(e.target.value)}
            placeholder="/videos/lesson.mp4"
          />
          {localError && <p className="text-xs text-destructive">{localError}</p>}
        </div>
      )}

      {value && parsed?.ok && (
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Saved: </span>
          <span className="break-all">{value}</span>
          {platformLabel && (
            <span className="mt-1 block text-primary">Platform: {platformLabel} (embedded player)</span>
          )}
          {parsed.kind === "local" && <span className="mt-1 block">Self-hosted video</span>}
          {parsed.kind === "remote-direct" && <span className="mt-1 block">Direct video URL</span>}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{MODE_HINTS[mode]}</p>
    </div>
  );
}

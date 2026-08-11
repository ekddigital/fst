"use client";

import { useCallback, useEffect, useRef } from "react";
import { getVideoEmbedInfo } from "@/lib/video-url";
import { cn } from "@/lib/utils";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "fst-video-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

async function sendWatchBeacon(resourceId: string, durationSeconds: number) {
  if (durationSeconds < 5) return;
  try {
    await fetch("/api/resource-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceId,
        durationSeconds: Math.round(durationSeconds),
        sessionId: getSessionId(),
      }),
      keepalive: true,
    });
  } catch {
    // Non-critical tracking — fail silently
  }
}

function TrackedNativeVideo({
  resourceId,
  src,
  title,
  className,
}: {
  resourceId: string;
  src: string;
  title: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watchedRef = useRef(0);
  const lastSentRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = useCallback(() => {
    const delta = watchedRef.current - lastSentRef.current;
    if (delta >= 5) {
      lastSentRef.current = watchedRef.current;
      void sendWatchBeacon(resourceId, delta);
    }
  }, [resourceId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (!video.paused && !video.ended) {
        watchedRef.current = video.currentTime;
      }
    };

    const onPause = () => flush();
    const onEnded = () => flush();

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    intervalRef.current = setInterval(flush, 30000);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      if (intervalRef.current) clearInterval(intervalRef.current);
      flush();
    };
  }, [flush, resourceId]);

  return (
    <video ref={videoRef} controls className={className} preload="metadata" title={title}>
      <source src={src} />
      Your browser does not support the video tag.
    </video>
  );
}

function TrackedEmbed({
  resourceId,
  embedUrl,
  title,
  className,
}: {
  resourceId: string;
  embedUrl: string;
  title: string;
  className?: string;
}) {
  const sentRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    void sendWatchBeacon(resourceId, 5);
    sentRef.current = true;

    intervalRef.current = setInterval(() => {
      if (startRef.current) {
        const elapsed = (Date.now() - startRef.current) / 1000;
        void sendWatchBeacon(resourceId, 30);
        startRef.current = Date.now() - (elapsed % 30) * 1000;
      }
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (startRef.current && sentRef.current) {
        const elapsed = (Date.now() - startRef.current) / 1000;
        if (elapsed >= 5) void sendWatchBeacon(resourceId, elapsed);
      }
    };
  }, [resourceId]);

  return (
    <iframe
      src={embedUrl}
      title={title}
      className={cn("h-full w-full border-0", className)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

export function VideoPlayer({
  resourceId,
  videoUrl,
  title,
  className,
}: {
  resourceId: string;
  videoUrl: string;
  title: string;
  className?: string;
}) {
  const info = getVideoEmbedInfo(videoUrl);

  if (!info) {
    return (
      <div className={cn("flex items-center justify-center bg-muted p-6 text-sm text-muted-foreground", className)}>
        Video unavailable
      </div>
    );
  }

  if (info.kind === "embed" && info.embedUrl) {
    return (
      <TrackedEmbed
        resourceId={resourceId}
        embedUrl={info.embedUrl}
        title={title}
        className={className}
      />
    );
  }

  const src = info.directSrc ?? info.normalized;
  return (
    <TrackedNativeVideo resourceId={resourceId} src={src} title={title} className={className} />
  );
}

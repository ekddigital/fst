"use client";

import { useCallback, useEffect, useRef } from "react";

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

export function TrackedVideo({
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
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

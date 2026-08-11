"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="max-w-md border-destructive/30">
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            This admin page failed to load. Try again — if the problem persists, check server logs
            {error.digest ? ` (ref: ${error.digest.slice(0, 8)})` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}

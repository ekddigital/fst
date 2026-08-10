import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-7" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-base text-muted-foreground">{description}</p>
        {(actionLabel && actionHref) || (actionLabel && onAction) ? (
          <div className="mt-6">
            {actionHref ? (
              <Button asChild size="lg">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button size="lg" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

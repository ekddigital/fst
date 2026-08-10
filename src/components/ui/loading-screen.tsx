import Image from "next/image";
import { cn } from "@/lib/utils";
import { LOGO } from "@/lib/brand";
import { LoadingSpinner, type LoadingSpinnerSize } from "@/components/ui/loading-spinner";

type LoadingScreenProps = {
  message?: string;
  /** page = full viewport; section = content area; overlay = fixed over parent */
  variant?: "page" | "section" | "overlay";
  showLogo?: boolean;
  gradient?: boolean;
  spinnerSize?: LoadingSpinnerSize;
  className?: string;
};

export function LoadingScreen({
  message = "Loading…",
  variant = "section",
  showLogo = false,
  gradient = true,
  spinnerSize,
  className,
}: LoadingScreenProps) {
  const resolvedSpinnerSize =
    spinnerSize ?? (variant === "page" ? "page" : variant === "overlay" ? "section" : "section");

  const content = (
    <div className="flex flex-col items-center gap-6 text-center">
      {showLogo ? (
        <div className="relative">
          <Image
            src={LOGO.md}
            alt=""
            width={80}
            height={80}
            className="animate-pulse rounded-xl opacity-90"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <LoadingSpinner size="button" />
          </div>
        </div>
      ) : (
        <LoadingSpinner size={resolvedSpinnerSize} />
      )}
      <p className="max-w-sm text-lg font-medium text-foreground md:text-xl">{message}</p>
    </div>
  );

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className={cn(
            "rounded-2xl border border-border/60 px-10 py-12 shadow-xl",
            gradient && "hero-mesh bg-gradient-to-br from-primary/10 via-card to-secondary/15",
          )}
        >
          {content}
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={cn(
          "flex min-h-[60vh] flex-1 items-center justify-center px-6 py-24",
          gradient && "hero-mesh bg-gradient-to-br from-primary/10 via-background to-secondary/20",
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[320px] items-center justify-center rounded-xl px-6 py-16",
        gradient && "hero-mesh bg-gradient-to-br from-primary/8 via-muted/30 to-transparent",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {content}
    </div>
  );
}

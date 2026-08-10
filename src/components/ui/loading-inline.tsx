import { cn } from "@/lib/utils";
import { LoadingSpinner, type LoadingSpinnerSize } from "@/components/ui/loading-spinner";

type LoadingInlineProps = {
  message?: string;
  size?: LoadingSpinnerSize;
  className?: string;
};

/** Spinner + text for cards, forms, and inline status areas. */
export function LoadingInline({
  message = "Loading…",
  size = "inline",
  className,
}: LoadingInlineProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)} role="status" aria-live="polite">
      <LoadingSpinner size={size} />
      <span className="text-lg font-medium text-foreground">{message}</span>
    </span>
  );
}

type ButtonLoadingContentProps = {
  loading: boolean;
  loadingText: string;
  idleIcon?: React.ReactNode;
  idleText: string;
};

/** Swap button label between idle and loading states with a consistent spinner. */
export function ButtonLoadingContent({
  loading,
  loadingText,
  idleIcon,
  idleText,
}: ButtonLoadingContentProps) {
  if (loading) {
    return (
      <>
        <LoadingSpinner size="button" />
        {loadingText}
      </>
    );
  }

  return (
    <>
      {idleIcon}
      {idleText}
    </>
  );
}

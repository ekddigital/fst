import { cn } from "@/lib/utils";

const sizeClasses = {
  button: "size-6",
  inline: "size-8",
  section: "size-12",
  page: "size-16",
} as const;

export type LoadingSpinnerSize = keyof typeof sizeClasses;

type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
  className?: string;
  label?: string;
};

/** Brand-colored ring spinner — 24px (button) through 64px (page). */
export function LoadingSpinner({ size = "section", className, label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative", sizeClasses[size], className)}
    >
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
    </div>
  );
}

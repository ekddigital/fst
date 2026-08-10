import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer";
}) {
  return <Component className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>{children}</Component>;
}

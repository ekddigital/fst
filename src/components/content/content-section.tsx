import { cn } from "@/lib/utils";

export function ContentSection({
  children,
  className,
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <section className={cn("px-4 py-12 md:px-6 md:py-16", className)}>
      <div className={cn("mx-auto", narrow ? "max-w-3xl" : "max-w-4xl")}>{children}</div>
    </section>
  );
}

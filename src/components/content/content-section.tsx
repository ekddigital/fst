import { Container } from "@/components/layout/container";
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
    <section className={cn("py-12 md:py-16 lg:py-20", className)}>
      <Container className={narrow ? "max-w-3xl" : undefined}>{children}</Container>
    </section>
  );
}

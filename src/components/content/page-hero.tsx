import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
  actions?: Array<{ href: string; label: string; variant?: "default" | "outline" }>;
};

export function PageHero({ title, description, image, imageAlt, className, actions }: PageHeroProps) {
  return (
    <section
      className={cn(
        "hero-mesh relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-secondary/25",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-secondary/30 blur-3xl" />

      <Container className="relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:py-24">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">{title}</h1>
          {description && <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">{description}</p>}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {actions.map((action) => (
                <Button
                  key={action.href}
                  variant={action.variant ?? "default"}
                  size="lg"
                  asChild
                  className={action.variant === "default" ? "shadow-md" : undefined}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50 md:aspect-square lg:aspect-[4/3]">
            <Image
              src={image}
              alt={imageAlt ?? title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        )}
      </Container>
    </section>
  );
}

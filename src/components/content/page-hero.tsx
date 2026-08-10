import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <section className={cn("border-b border-border bg-muted/30", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
          {description && <p className="text-xl text-muted-foreground">{description}</p>}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {actions.map((action) => (
                <Button key={action.href} variant={action.variant ?? "default"} asChild>
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src={image}
              alt={imageAlt ?? title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}

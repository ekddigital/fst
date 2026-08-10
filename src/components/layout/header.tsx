import Image from "next/image";
import Link from "next/link";
import { BRAND, LOGO } from "@/lib/brand";
import { SiteNav } from "@/components/layout/site-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
      <Container as="div" className="flex h-16 items-center gap-3 lg:h-[4.5rem] lg:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline lg:gap-3">
          <Image
            src={LOGO.sm}
            alt={`${BRAND.siteName} logo`}
            width={44}
            height={43}
            className="size-11 rounded-full ring-2 ring-primary/20"
            priority
          />
          <span className="hidden font-bold tracking-tight text-foreground sm:block sm:text-base lg:text-lg">
            {BRAND.siteName}
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <SiteNav />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="lg:hidden">
            <SiteNav mobileOnly />
          </div>
          <ThemeToggle />
          <Button asChild size="sm" className="hidden shadow-sm sm:inline-flex lg:h-10">
            <Link href="/contact">Book a Trial</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BRAND, LOGO } from "@/lib/brand";
import { SiteNav } from "@/components/layout/site-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image
            src={LOGO.sm}
            alt={`${BRAND.siteName} logo`}
            width={48}
            height={48}
            className="rounded-full"
            priority
          />
          <span className="hidden text-xl font-bold text-foreground sm:block">{BRAND.siteName}</span>
        </Link>

        <div className="flex items-center gap-2">
          <SiteNav />
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex">
            <Link href="/contact">Book a Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

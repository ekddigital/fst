import Link from "next/link";
import Image from "next/image";
import { Mail, GraduationCap } from "lucide-react";
import { BRAND, LOGO, NAV_ITEMS, PROGRAMS } from "@/lib/brand";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const quickLinks = NAV_ITEMS.filter((item) => !("children" in item));

  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-muted/30 to-muted/60">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 no-underline">
              <Image src={LOGO.sm} alt="" width={40} height={40} className="rounded-full" />
              <span className="text-xl font-bold text-foreground">{BRAND.siteName}</span>
            </Link>
            <p className="text-lg leading-relaxed text-muted-foreground">{BRAND.tagline}</p>
            <Button asChild size="sm">
              <Link href="/contact">Book a Free Trial</Link>
            </Button>
          </div>

          <nav aria-label="Footer navigation">
            <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <GraduationCap className="size-5 text-primary" aria-hidden />
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base text-muted-foreground no-underline transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Programs">
            <p className="mb-4 text-lg font-semibold text-foreground">Programs</p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/programs"
                  className="text-base text-muted-foreground no-underline transition-colors hover:text-primary"
                >
                  All Programs
                </Link>
              </li>
              {PROGRAMS.map((program) => (
                <li key={program.slug}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="text-base text-muted-foreground no-underline transition-colors hover:text-primary"
                  >
                    {program.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Mail className="size-5 text-primary" aria-hidden />
              Get in Touch
            </p>
            <p className="text-base text-muted-foreground">
              Questions about lessons or exam prep? Teacher Joe is happy to help you find the right program.
            </p>
            <a
              href={`mailto:${BRAND.contactEmail}`}
              className="mt-3 inline-block text-base font-medium text-primary no-underline hover:text-primary/80"
            >
              {BRAND.contactEmail}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-base text-muted-foreground">
            © {currentYear} {BRAND.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
            <Link href="/student-assessment" className="text-base text-muted-foreground no-underline hover:text-primary">
              Free Assessment
            </Link>
            <Link href="/contact" className="text-base text-muted-foreground no-underline hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

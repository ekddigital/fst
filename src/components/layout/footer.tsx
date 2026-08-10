import Link from "next/link";
import { BRAND, NAV_ITEMS } from "@/lib/brand";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="text-xl font-bold text-foreground">{BRAND.siteName}</p>
          <p className="mt-2 text-lg text-muted-foreground">{BRAND.tagline}</p>
        </div>

        <nav aria-label="Footer navigation">
          <p className="mb-3 text-lg font-semibold">Quick Links</p>
          <ul className="space-y-2">
            {NAV_ITEMS.filter((item) => !("children" in item)).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-lg text-muted-foreground no-underline hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/programs" className="text-lg text-muted-foreground no-underline hover:text-primary">
                Programs
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-lg font-semibold">Contact</p>
          <p className="text-lg text-muted-foreground">
            <a href={`mailto:${BRAND.contactEmail}`} className="hover:text-primary">
              {BRAND.contactEmail}
            </a>
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            © {currentYear} {BRAND.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

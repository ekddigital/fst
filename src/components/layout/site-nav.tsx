"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-lg font-medium no-underline transition-colors hover:bg-muted hover:text-foreground",
      isActive(href) ? "bg-primary/10 text-primary" : "text-foreground",
    );

  return (
    <nav aria-label="Main navigation" className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen((o) => !o)}
      >
        {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
      </Button>

      <ul className="hidden items-center gap-1 lg:flex">
        {NAV_ITEMS.map((item) =>
          "children" in item && item.children ? (
            <li key={item.href} className="relative">
              <button
                type="button"
                className={cn(navLinkClass(item.href), "inline-flex items-center gap-1")}
                aria-expanded={programsOpen}
                onClick={() => setProgramsOpen((o) => !o)}
                onBlur={(e) => {
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                    setProgramsOpen(false);
                  }
                }}
              >
                {item.label}
                <ChevronDown className="size-4" aria-hidden />
              </button>
              {programsOpen && (
                <ul className="absolute left-0 top-full z-50 mt-1 min-w-52 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <li>
                    <Link href={item.href} className={cn(navLinkClass(item.href), "block")}>
                      All Programs
                    </Link>
                  </li>
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className={cn(navLinkClass(child.href), "block")}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href} className={navLinkClass(item.href)}>
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-xl lg:hidden"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(navLinkClass(item.href), "block")}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {"children" in item && item.children && (
                  <ul className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={cn(navLinkClass(child.href), "block text-base")}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

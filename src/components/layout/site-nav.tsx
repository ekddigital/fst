"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS, type NavItem } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isProgramsActive(pathname: string) {
  return pathname === "/programs" || pathname.startsWith("/programs/");
}

function getNavLabel(item: NavItem) {
  return item.shortLabel ?? item.label;
}

function NavLink({
  href,
  label,
  shortLabel,
  active,
  className,
  onClick,
}: {
  href: string;
  label: string;
  shortLabel?: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium no-underline transition-colors xl:px-3 xl:text-[0.95rem]",
        active
          ? "text-primary after:absolute after:bottom-0.5 after:left-2.5 after:right-2.5 after:h-0.5 after:rounded-full after:bg-primary"
          : "text-foreground/75 hover:bg-muted/60 hover:text-foreground",
        className,
      )}
    >
      <span className="xl:hidden">{shortLabel ?? label}</span>
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-0.5 xl:gap-1">
        {NAV_ITEMS.map((item) =>
          "children" in item && item.children ? (
            <li key={item.href}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3 xl:text-[0.95rem]",
                      isProgramsActive(pathname)
                        ? "text-primary"
                        : "text-foreground/75 hover:bg-muted/60 hover:text-foreground",
                    )}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <ChevronDown className="size-4 opacity-70" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                  <DropdownMenuItem asChild>
                    <Link href={item.href} className="font-medium no-underline">
                      All Programs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="no-underline">
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ) : (
            <li key={item.href}>
              <NavLink
                href={item.href}
                label={item.label}
                shortLabel={item.shortLabel}
                active={isNavActive(pathname, item.href)}
              />
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

function MobileNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-2 pb-6">
      {NAV_ITEMS.map((item) =>
        "children" in item && item.children ? (
          <div key={item.href} className="space-y-1">
            <NavLink
              href={item.href}
              label={item.label}
              active={isProgramsActive(pathname)}
              className="block w-full px-3 py-3 text-base after:hidden"
              onClick={onNavigate}
            />
            <div className="ml-3 space-y-1 border-l-2 border-primary/20 pl-3">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-base no-underline transition-colors",
                    isNavActive(pathname, child.href)
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            shortLabel={getNavLabel(item)}
            active={isNavActive(pathname, item.href)}
            className="block w-full px-3 py-3 text-base after:hidden"
            onClick={onNavigate}
          />
        ),
      )}

      <div className="mt-4 border-t border-border pt-4 px-1">
        <Button asChild className="w-full" size="lg">
          <Link href="/contact" onClick={onNavigate}>
            Book a Trial
          </Link>
        </Button>
      </div>
    </nav>
  );
}

export function SiteNav({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const [open, setOpen] = useState(false);

  if (mobileOnly) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open menu">
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <MobileNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return <DesktopNav />;
}

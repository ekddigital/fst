"use client";

import Link from "next/link";
import { CircleUser, ExternalLink, LogOut } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BRAND } from "@/lib/brand";
import { adminLogout } from "@/lib/admin/logout-client";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-card/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80 md:px-6">
      <div className="min-w-0 flex-1" aria-hidden />

      <div className="flex shrink-0 items-center gap-1">
        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Admin account menu">
              <CircleUser className="size-5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium leading-tight">{BRAND.siteName} Admin</p>
              <p className="text-xs font-normal text-muted-foreground">Administrator</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="size-4" aria-hidden />
                View public site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void adminLogout();
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" aria-hidden />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

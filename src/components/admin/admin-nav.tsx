"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND, LOGO } from "@/lib/brand";

const NAV: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/resources", label: "Resources", icon: BookOpen },
  { href: "/admin/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/submissions", label: "Submissions", icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <img src={LOGO.sm} alt="" className="size-10 rounded-lg" />
        <div>
          <p className="font-semibold leading-tight">{BRAND.siteName}</p>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Clock,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BRAND, LOGO } from "@/lib/brand";
import { adminFetch } from "@/lib/admin/client";

const NAV: Array<{
  href: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badgeKey?: "submissions" | "bills";
}> = [
  { href: "/admin", label: "Dashboard", description: "Overview and quick actions", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", description: "Trends and performance", icon: BarChart3 },
  { href: "/admin/articles", label: "Blog Posts", description: "Articles for parents", icon: Newspaper },
  { href: "/admin/resources", label: "Videos & Resources", description: "Videos, PDFs, guides", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", description: "Organize your content", icon: FolderOpen },
  { href: "/admin/lessons", label: "Lesson Builder", description: "Combine content into lessons", icon: GraduationCap },
  { href: "/admin/assessments", label: "Assessments", description: "Student quizzes", icon: ClipboardList },
  { href: "/admin/submissions", label: "Submissions", description: "Messages and results", icon: MessageSquare, badgeKey: "submissions" },
  { href: "/admin/watch-time", label: "Watch Time", description: "Video viewing stats", icon: Clock },
  { href: "/admin/promotions", label: "Promotions", description: "Banners and announcements", icon: Megaphone },
  { href: "/admin/bills", label: "Bills & Invoices", description: "Track payments", icon: Receipt, badgeKey: "bills" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [badges, setBadges] = useState<{ submissions: number; bills: number }>({ submissions: 0, bills: 0 });

  useEffect(() => {
    void adminFetch<{ badges: { submissions: number; bills: number } }>("/api/admin/nav-stats").then((res) => {
      if (res.success) setBadges(res.data.badges);
    });
  }, [pathname]);

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <img src={LOGO.sm} alt="" className="size-10 rounded-lg" />
        <div>
          <p className="font-semibold leading-tight">{BRAND.siteName}</p>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ href, label, description, icon: Icon, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badgeCount = badgeKey ? badges[badgeKey] : 0;
          return (
            <Link
              key={href}
              href={href}
              title={description}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{label}</p>
                <p className={cn("truncate text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {description}
                </p>
              </div>
              {badgeCount > 0 && (
                <Badge variant={active ? "secondary" : "default"} className="shrink-0 text-xs">
                  {badgeCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

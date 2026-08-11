import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminNav } from "@/components/admin/admin-nav";
import { isAdminAuthenticatedFromCookies, isAdminConfigured } from "@/lib/auth/admin";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminConfigured()) {
    redirect("/admin/login?error=not-configured");
  }

  const authenticated = await isAdminAuthenticatedFromCookies();
  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

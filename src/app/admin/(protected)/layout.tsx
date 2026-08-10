import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

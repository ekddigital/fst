export async function adminLogout() {
  await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/admin/login";
}

import Link from "next/link";
import { getActivePromotions } from "@/lib/admin/dashboard";

export async function PromotionBanner() {
  const promotions = await getActivePromotions();
  const banner = promotions.find((p) => p.placement === "HOME_BANNER" || p.placement === "TOP_BAR");
  if (!banner) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10 px-4 py-3 text-center text-base">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
        <p>
          <span className="font-semibold text-foreground">{banner.title}</span>
          {" — "}
          <span className="text-foreground/90">{banner.body}</span>
        </p>
        <Link href="/contact" className="hidden shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground sm:inline-block">
          Learn more
        </Link>
      </div>
    </div>
  );
}

export async function PromotionAnnouncement() {
  const promotions = await getActivePromotions();
  const announcement = promotions.find((p) => p.placement === "ANNOUNCEMENT");
  if (!announcement) return null;

  return (
    <aside className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Announcement</p>
      <p className="mt-1 text-lg font-semibold">{announcement.title}</p>
      <p className="mt-2 text-base text-muted-foreground">{announcement.body}</p>
    </aside>
  );
}

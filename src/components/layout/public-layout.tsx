import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromotionBanner } from "@/components/content/promotion-banner";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromotionBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

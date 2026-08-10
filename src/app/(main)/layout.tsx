import { PublicLayout } from "@/components/layout/public-layout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

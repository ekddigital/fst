import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AdminProtectedLoading() {
  return <LoadingScreen message="Loading admin panel…" variant="section" showLogo gradient={false} />;
}

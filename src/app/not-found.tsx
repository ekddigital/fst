import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}

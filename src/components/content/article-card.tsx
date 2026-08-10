import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardProps = {
  title: string;
  excerpt: string;
  href: string;
  image?: string;
};

export function ArticleCard({ title, excerpt, href, image }: ArticleCardProps) {
  return (
    <Card className="group h-full overflow-hidden border-border/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link href={href} className="flex h-full flex-col no-underline">
        {image && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={image}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">{title}</CardTitle>
          <CardDescription className="line-clamp-3">{excerpt}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="inline-flex items-center gap-1 text-base font-medium text-primary">
            Read article
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}

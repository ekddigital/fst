import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardProps = {
  title: string;
  excerpt: string;
  href: string;
  image?: string;
};

export function ArticleCard({ title, excerpt, href, image }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/40">
      <Link href={href} className="block no-underline">
        {image && (
          <div className="relative aspect-video w-full bg-muted">
            <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
          <CardDescription>{excerpt}</CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-lg font-medium text-primary">Read article →</span>
        </CardContent>
      </Link>
    </Card>
  );
}

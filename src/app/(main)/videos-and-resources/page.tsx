import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { MarkdownContent } from "@/components/content/markdown-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getArchivePage } from "@/lib/content";
import { VIDEOS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Videos & Resources",
  description: "English learning videos, Cambridge preparation materials, and parent resources.",
};

export default async function VideosPage() {
  const page = await getArchivePage("videos-and-resources");

  return (
    <>
      <PageHero
        title="Videos & Resources"
        description="Explore English learning videos, Cambridge preparation materials, and resources designed to support students from early learning through advanced English development."
      />
      <ContentSection>
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {VIDEOS.map((video) => (
            <Card key={video.src} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <video controls className="h-full w-full" preload="metadata" title={video.title}>
                  <source src={video.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <CardHeader>
                <CardTitle>{video.title}</CardTitle>
                <CardDescription>{video.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mb-12 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Free Parent Guide</CardTitle>
            <CardDescription>
              Practical answers to common questions parents ask about English learning at home.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/other/FST_Parent_Guide_Cover_to_Page_8_Complete_Draft.pdf" target="_blank">
                Download Free Parent Guide (PDF)
              </Link>
            </Button>
          </CardContent>
        </Card>

        {page && <MarkdownContent content={page.body} />}
      </ContentSection>
    </>
  );
}

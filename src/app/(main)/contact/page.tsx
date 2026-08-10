import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";
import { getArchivePage } from "@/lib/content";
import { MarkdownContent } from "@/components/content/markdown-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Teacher Joe to ask questions or arrange a free trial English lesson.",
};

export default async function ContactPage() {
  const page = await getArchivePage("contact-page");

  return (
    <>
      <PageHero
        title="Contact Teacher Joe"
        description="Ready to begin improving your English? Contact Teacher Joe by WeChat or email to ask questions or arrange a free trial lesson."
      />
      <ContentSection>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            {page && <MarkdownContent content={page.body.split("## Scan")[0] ?? page.body} />}

            <Card>
              <CardHeader>
                <CardTitle>Add Teacher Joe on WeChat</CardTitle>
              </CardHeader>
              <CardContent>
                <Image
                  src="/images/qr-code-203x300.jpg"
                  alt="WeChat QR code to contact Teacher Joe"
                  width={203}
                  height={300}
                  className="rounded-lg shadow-md"
                />
              </CardContent>
            </Card>

            <p className="text-lg">
              Prefer email?{" "}
              <a href={`mailto:${BRAND.contactEmail}`} className="font-medium">
                {BRAND.contactEmail}
              </a>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </>
  );
}

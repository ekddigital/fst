import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/content/page-hero";
import { ContentSection } from "@/components/content/content-section";
import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Teacher Joe to ask questions or arrange a free trial English lesson.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Teacher Joe"
        description="Ready to begin improving your English? Ask questions or arrange a free trial lesson by WeChat or email."
      />
      <ContentSection>
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="size-6 text-primary" aria-hidden />
                  WeChat
                </CardTitle>
                <CardDescription>
                  Scan the QR code to add Teacher Joe on WeChat — the fastest way to ask questions or book a trial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="inline-block overflow-hidden rounded-xl bg-white p-3 shadow-inner ring-1 ring-border/50">
                  <Image
                    src="/images/qr-code-203x300.jpg"
                    alt="WeChat QR code to contact Teacher Joe"
                    width={203}
                    height={300}
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-6 text-primary" aria-hidden />
                  Email
                </CardTitle>
                <CardDescription>
                  Prefer email? Send a message anytime — whether you&apos;re interested in everyday English, KET, PET,
                  IELTS, or young learners programs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${BRAND.contactEmail}`}
                  className="text-lg font-medium text-primary no-underline hover:text-primary/80"
                >
                  {BRAND.contactEmail}
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/80 shadow-lg lg:col-span-3">
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle>Send a message</CardTitle>
              <CardDescription>
                Fill out the form below and Teacher Joe will get back to you. Or{" "}
                <Link href="/student-assessment" className="font-medium text-primary">
                  take the free assessment
                </Link>{" "}
                first.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </>
  );
}

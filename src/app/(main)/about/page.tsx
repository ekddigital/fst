import type { Metadata } from "next";
import { PageHero } from "@/components/content/page-hero";
import { AboutPageContent } from "@/components/content/about-page-content";

export const metadata: Metadata = {
  title: "About Teacher Joe",
  description: "Meet Teacher Joe — experienced English teacher helping students build confident communication skills.",
};

const HERO_IMAGE = "/images/Weixin-Image_20260712205128_535_52-3.jpg";

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Meet Teacher Joe"
        description="I help students build confident English through practical lessons, clear learning goals, and international teaching experience."
        image={HERO_IMAGE}
        imageAlt="Teacher Joe"
        actions={[{ href: "/contact", label: "Book a Free Trial" }]}
      />
      <AboutPageContent />
    </>
  );
}

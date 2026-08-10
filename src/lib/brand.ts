/** Fast Start Talking brand tokens — sky blue ~#75BEE2 (hue ~200) */
export const BRAND = {
  hue: 200,
  saturation: 62,
  lightness: 55,
  siteName: "Fast Start Talking",
  tagline: "Learn English. Speak Fluently. Reach Your Goals.",
  contactEmail: "teacherjoejinan@gmail.com",
} as const;

export const LOGO = {
  sm: "/images/DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214-123x120.webp",
  md: "/images/DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214-300x293.webp",
  favicon: "/images/cropped-logo-192x192.jpg",
} as const;

export const HERO_IMAGES = {
  home: "/images/felix-and-I-1024x651.png",
  teacher: "/images/Weixin-Image_20260712205128_535_52-3-724x1024.jpg",
  programs: "/images/student-teacher1.jpg",
} as const;

export const EMAIL_BRAND = {
  primary: "#75BEE2",
  background: "#f0f9fd",
  text: "#1a3a4a",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://faststarttalking.com",
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/student-assessment", label: "Student Assessment" },
  { href: "/about", label: "About Teacher Joe" },
  {
    href: "/programs",
    label: "Programs",
    children: [
      { href: "/programs/ielts", label: "IELTS" },
      { href: "/programs/pet", label: "PET" },
      { href: "/programs/ket", label: "KET" },
      { href: "/programs/english-starter", label: "English Starter" },
    ],
  },
  { href: "/videos-and-resources", label: "Videos & Resources" },
  { href: "/articles", label: "Articles" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROGRAMS = [
  {
    slug: "english-starter",
    archiveSlug: "english-starter-package",
    title: "English Starter",
    summary: "Fun English lessons for young learners focusing on phonics, vocabulary, speaking, and early communication skills.",
  },
  {
    slug: "ket",
    archiveSlug: "ket-preparation",
    title: "KET / A2 Key",
    summary: "Build strong English foundations through grammar, vocabulary, reading, writing, listening, and speaking practice.",
  },
  {
    slug: "pet",
    archiveSlug: "pet-preparation",
    title: "PET / B1 Preliminary",
    summary: "Develop stronger communication skills and prepare students for the next level of English learning.",
  },
  {
    slug: "ielts",
    archiveSlug: "ielts-preparation",
    title: "IELTS Preparation",
    summary: "Personalized IELTS preparation focusing on listening, reading, writing, and speaking skills for academic goals.",
  },
] as const;

export const VIDEOS = [
  {
    title: "Phonics for Young Learners",
    description: "A simple phonics lesson to help young learners improve letter sounds, pronunciation and early reading confidence.",
    src: "/videos/Phonics-Song-2.mp4",
  },
  {
    title: "Real Online Class: Alphabet, Reading, and Phonics Practice",
    description: "Teacher Joe helping a young learner practise alphabet sounds, reading skills, and phonics through interactive activities.",
    src: "/videos/Felix-class.mp4",
  },
  {
    title: "Real Classroom Lesson: Problem & Solution",
    description: "An engaging classroom lesson demonstrating problem and solution language skills.",
    src: "/videos/Candy.mp4",
  },
  {
    title: "5 Daily Habits That Improve Your English",
    description: "Practical tips for building daily English learning habits.",
    src: "/videos/revised-final.mp4",
  },
] as const;

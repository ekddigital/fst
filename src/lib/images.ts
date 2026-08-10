/** WordPress-style `-150x150`, `-1024x768`, etc. before the file extension */
const DIMENSION_SUFFIX = /-\d+x\d+(?=\.[a-z0-9]+$)/i;

/** Known thumbnails → best full-size filename in public/images */
const FULL_SIZE_OVERRIDES: Record<string, string> = {
  "Brazil-cover-page-150x150.jpg": "Brazil-cover-page-scaled.jpg",
  "Brazil-cover-page-1024x1024.jpg": "Brazil-cover-page-scaled.jpg",
  "Austria-front-page-150x150.jpg": "Austria-front-page-scaled.jpg",
  "IMG_20260210_084115-768x1024.jpg": "IMG_20260210_084115-scaled.jpg",
  "IMG_20260210_084115-225x300.jpg": "IMG_20260210_084115-scaled.jpg",
  "cropped-pic-1024x1024.png": "cropped-pic-1.png",
  "cropped-pic-1-1024x1024.png": "cropped-pic-1.png",
  "felix-and-I-1024x651.png": "felix-and-I.png",
  "felix-and-I-300x191.png": "felix-and-I.png",
  "felix-and-I-768x488.png": "felix-and-I.png",
  "Weixin-Image_20260712205128_535_52-3-724x1024.jpg": "Weixin-Image_20260712205128_535_52-3.jpg",
  "Weixin-Image_20260712205128_535_52-3-212x300.jpg": "Weixin-Image_20260712205128_535_52-3.jpg",
  "Weixin-Image_20260712205128_535_52-3-768x1087.jpg": "Weixin-Image_20260712205128_535_52-3.jpg",
  "Weixin-Image_20260712205128_535_52-3-1085x1536.jpg": "Weixin-Image_20260712205128_535_52-3.jpg",
  "Weixin-Image_20260712205132_540_52-1-1024x696.jpg": "Weixin-Image_20260712205132_540_52-1.jpg",
  "Weixin-Image_20260712205132_540_52-1-300x204.jpg": "Weixin-Image_20260712205132_540_52-1.jpg",
  "Weixin-Image_20260712205132_540_52-1-768x522.jpg": "Weixin-Image_20260712205132_540_52-1.jpg",
  "qr-code-203x300.jpg": "qr-code.jpg",
  "qr-code-693x1024.jpg": "qr-code.jpg",
  "qr-code-768x1135.jpg": "qr-code.jpg",
  "mychild-1024x1024.webp": "mychild.webp",
  "mychild-150x150.webp": "mychild.webp",
  "mychild-300x300.webp": "mychild.webp",
  "mychild-768x768.webp": "mychild.webp",
  "freepik__the-style-is-candid-image-photography-with-natural__57231-796x1024.jpeg":
    "freepik__the-style-is-candid-image-photography-with-natural__57231.jpeg",
  "freepik__the-style-is-candid-image-photography-with-natural__57231-233x300.jpeg":
    "freepik__the-style-is-candid-image-photography-with-natural__57231.jpeg",
  "freepik__the-style-is-candid-image-photography-with-natural__57231-768x987.jpeg":
    "freepik__the-style-is-candid-image-photography-with-natural__57231.jpeg",
  "DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214-123x120.webp":
    "DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214.webp",
  "DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214-300x293.webp":
    "DALL_E-2025-02-06-18.14.53-A-modern-and-professional-logo-for-Fast-Start-Talking-with-the-initials-FST-as-the-main-design-element.-The-logo-should-include___-A-sleek-and-bo-1-e1739329906214.webp",
  "Grandpa-frozen-land-cover-page1-150x150.jpg": "Grandpa-frozen-land-cover-page1.jpg",
  "Kenya-book-cover-150x150.jpg": "Kenya-book-cover.jpg",
  "Grandpa-China-cover-page-150x150.jpg": "Grandpa-China-cover-page.jpg",
};

/**
 * Resolve a /images/ path to the largest available asset (strip WP dimension suffixes).
 */
export function resolveFullSizeImagePath(imagePath: string): string {
  if (!imagePath.startsWith("/images/")) return imagePath;

  const filename = decodeURIComponent(imagePath.slice("/images/".length));
  const override = FULL_SIZE_OVERRIDES[filename];
  if (override) return `/images/${override}`;

  if (filename.includes("-scaled") || !DIMENSION_SUFFIX.test(filename)) {
    return imagePath;
  }

  const upgraded = filename.replace(DIMENSION_SUFFIX, "");
  return `/images/${upgraded}`;
}

/** Upgrade image paths inside markdown/HTML content strings. */
export function upgradeContentImagePaths(content: string): string {
  return content.replace(/(\/images\/[^\s")]+)/g, (match) => resolveFullSizeImagePath(match));
}

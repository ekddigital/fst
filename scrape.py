#!/usr/bin/env python3
"""Mirror faststarttalking.com into the site-data/ directory."""

from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.parse
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

import html2text
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://faststarttalking.com"
BASE_DOMAIN = "faststarttalking.com"
ROOT = Path(__file__).resolve().parent
SITE_DATA = ROOT / "site-data"
PAGES_DIR = SITE_DATA / "pages"
ASSETS = {
    "images": SITE_DATA / "assets" / "images",
    "videos": SITE_DATA / "assets" / "videos",
    "other": SITE_DATA / "assets" / "other",
}
DELAY_SEC = 0.25
DOWNLOAD_TIMEOUT = (10, 30)  # connect, read
USER_AGENT = "FST-Archiver/1.0 (content preservation; respectful crawl)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT})

h2t = html2text.HTML2Text()
h2t.ignore_links = False
h2t.ignore_images = False
h2t.body_width = 0
h2t.unicode_snob = True


class LinkExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: set[str] = set()
        self.images: set[str] = set()
        self.videos: list[dict] = []
        self.files: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k: (v or "") for k, v in attrs}
        if tag == "a" and attr.get("href"):
            self.links.add(attr["href"])
        elif tag == "img":
            for key in ("src", "data-src", "data-lazy-src"):
                if attr.get(key):
                    self.images.add(attr[key])
            if attr.get("srcset"):
                for part in attr["srcset"].split(","):
                    url = part.strip().split()[0]
                    if url:
                        self.images.add(url)
        elif tag == "source" and attr.get("src"):
            self.videos.append({"type": "source", "url": attr["src"], "mime": attr.get("type", "")})
        elif tag == "video" and attr.get("src"):
            self.videos.append({"type": "video", "url": attr["src"], "mime": attr.get("type", "")})
        elif tag == "iframe" and attr.get("src"):
            self.videos.append({"type": "embed", "url": attr["src"], "title": attr.get("title", "")})
        elif tag == "link" and "icon" in attr.get("rel", "") and attr.get("href"):
            self.files.add(attr["href"])


def log(msg: str) -> None:
    print(msg, flush=True)


def normalize_url(url: str, page_url: str = BASE_URL) -> str | None:
    if not url or url.startswith(("mailto:", "tel:", "javascript:", "#", "data:")):
        return None
    absolute = urllib.parse.urljoin(page_url, url)
    parsed = urllib.parse.urlparse(absolute)
    if parsed.netloc and parsed.netloc.replace("www.", "") != BASE_DOMAIN.replace("www.", ""):
        return None
    path = parsed.path or "/"
    if not path.endswith("/") and "." not in Path(path).name:
        path = path + "/"
    return urllib.parse.urlunparse((parsed.scheme or "https", parsed.netloc or BASE_DOMAIN, path, "", parsed.query, ""))


def slugify_path(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.strip("/") or "home"
    path = re.sub(r"[^a-zA-Z0-9/_-]", "-", path)
    return path.replace("/", "__")


def safe_filename(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    name = Path(parsed.path).name or "asset"
    name = urllib.parse.unquote(name)
    name = re.sub(r"[^\w.\-]", "_", name)
    if not name or name == "_":
        digest = hashlib.sha256(url.encode()).hexdigest()[:12]
        ext = Path(parsed.path).suffix or ".bin"
        name = f"asset_{digest}{ext}"
    return name


def fetch_json(endpoint: str) -> list[dict]:
    items: list[dict] = []
    page = 1
    while True:
        url = f"{BASE_URL}/wp-json/wp/v2/{endpoint}?per_page=100&page={page}"
        resp = SESSION.get(url, timeout=DOWNLOAD_TIMEOUT)
        if resp.status_code == 400:
            break
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        items.extend(batch)
        total_pages = int(resp.headers.get("X-WP-TotalPages", 1))
        if page >= total_pages:
            break
        page += 1
        time.sleep(DELAY_SEC)
    return items


def fetch_sitemap_urls() -> set[str]:
    urls: set[str] = set()
    index = SESSION.get(f"{BASE_URL}/sitemap_index.xml", timeout=DOWNLOAD_TIMEOUT)
    index.raise_for_status()
    soup = BeautifulSoup(index.text, "lxml-xml")
    for sm in soup.find_all("sitemap"):
        loc = sm.find("loc")
        if not loc or not loc.text:
            continue
        sub = SESSION.get(loc.text.strip(), timeout=DOWNLOAD_TIMEOUT)
        sub.raise_for_status()
        sub_soup = BeautifulSoup(sub.text, "lxml-xml")
        for url_tag in sub_soup.find_all("url"):
            loc_tag = url_tag.find("loc")
            if loc_tag and loc_tag.text:
                normalized = normalize_url(loc_tag.text.strip())
                if normalized:
                    urls.add(normalized)
        time.sleep(DELAY_SEC)
    return urls


def classify_asset(url: str) -> str:
    lower = url.lower().split("?")[0]
    if any(lower.endswith(ext) for ext in (".mp4", ".webm", ".mov", ".m4v", ".ogg")):
        return "videos"
    if lower.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico")):
        return "images"
    if any(lower.endswith(ext) for ext in (".pdf", ".doc", ".docx", ".zip", ".css")):
        return "other"
    if "/wp-content/uploads/" in lower:
        return "images"
    return "other"


def download_asset(url: str, category: str, downloaded: dict[str, str], failed: list[dict]) -> str | None:
    if url in downloaded:
        return downloaded[url]

    parsed = urllib.parse.urlparse(url)
    if parsed.netloc.replace("www.", "") != BASE_DOMAIN.replace("www.", ""):
        return None

    # Skip large direct video downloads — recorded in video manifest instead
    if category == "videos" or url.lower().split("?")[0].endswith((".mp4", ".webm", ".mov", ".m4v")):
        downloaded[url] = ""
        return None

    filename = safe_filename(url)
    dest_dir = ASSETS[category]
    dest = dest_dir / filename
    if dest.exists() and dest.stat().st_size > 0:
        downloaded[url] = str(dest.relative_to(ROOT))
        return downloaded[url]

    try:
        resp = SESSION.get(url, timeout=DOWNLOAD_TIMEOUT, stream=True)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        if not dest.suffix and "image/" in content_type:
            ext = content_type.split("/")[-1].split(";")[0]
            dest = dest_dir / f"{dest.stem}.{ext}"
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(chunk_size=65536):
                if chunk:
                    f.write(chunk)
        downloaded[url] = str(dest.relative_to(ROOT))
        time.sleep(DELAY_SEC)
        return downloaded[url]
    except Exception as exc:
        failed.append({"url": url, "error": str(exc)})
        log(f"  [warn] download failed: {url} ({exc})")
        return None


def extract_meta(soup: BeautifulSoup) -> dict:
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    og_desc = soup.find("meta", property="og:description")
    description = ""
    if desc_tag and desc_tag.get("content"):
        description = desc_tag["content"]
    elif og_desc and og_desc.get("content"):
        description = og_desc["content"]
    canonical = soup.find("link", rel="canonical")
    return {
        "title": title,
        "description": description,
        "canonical": canonical["href"] if canonical and canonical.get("href") else "",
    }


def process_page(url: str, wp_item: dict | None) -> dict | None:
    try:
        resp = SESSION.get(url, timeout=DOWNLOAD_TIMEOUT)
        resp.raise_for_status()
    except Exception as exc:
        log(f"[fail] {url}: {exc}")
        return {"url": url, "status": "failed", "error": str(exc)}

    soup = BeautifulSoup(resp.text, "lxml")
    meta = extract_meta(soup)

    parser = LinkExtractor()
    parser.feed(resp.text)

    page_assets = {"images": [], "videos": [], "other": []}
    for img in sorted(parser.images):
        abs_url = urllib.parse.urljoin(url, img)
        if normalize_url(abs_url, url):
            page_assets["images"].append({"url": abs_url})

    for vid in parser.videos:
        vid_url = urllib.parse.urljoin(url, vid["url"])
        entry = {"url": vid_url, **{k: v for k, v in vid.items() if k != "url"}}
        is_embed = any(h in vid_url for h in ("youtube.com", "youtu.be", "vimeo.com", "player.vimeo"))
        is_direct = vid_url.lower().split("?")[0].endswith((".mp4", ".webm", ".mov", ".m4v"))
        entry["embed"] = is_embed or is_direct
        page_assets["videos"].append(entry)

    for link in parser.links:
        abs_link = urllib.parse.urljoin(url, link)
        if any(abs_link.lower().endswith(ext) for ext in (".pdf", ".doc", ".docx", ".zip")):
            page_assets["other"].append({"url": abs_link})

    for f in parser.files:
        abs_f = urllib.parse.urljoin(url, f)
        if normalize_url(abs_f, url):
            page_assets["other"].append({"url": abs_f})

    content_html = ""
    if wp_item:
        content_html = wp_item.get("content", {}).get("rendered", "")
    if not content_html:
        main = soup.find("main") or soup.find("article") or soup.find("div", class_=re.compile("entry-content|site-content|elementor"))
        content_html = str(main) if main else resp.text

    content_md = h2t.handle(content_html).strip()
    has_lorem = "lorem ipsum" in content_md.lower() or "lorem ipsum" in resp.text.lower()

    slug = slugify_path(url)
    page_dir = PAGES_DIR / slug
    page_dir.mkdir(parents=True, exist_ok=True)
    (page_dir / "content.md").write_text(
        f"# {meta['title']}\n\n"
        f"**URL:** {url}\n\n"
        f"**Description:** {meta['description']}\n\n"
        f"{'**Note:** Contains Lorem ipsum placeholder text\n\n' if has_lorem else ''}"
        f"---\n\n{content_md}\n",
        encoding="utf-8",
    )
    metadata = {
        "url": url,
        "title": meta["title"],
        "description": meta["description"],
        "canonical": meta["canonical"],
        "has_lorem_ipsum": has_lorem,
        "wp_id": wp_item.get("id") if wp_item else None,
        "wp_type": wp_item.get("type") if wp_item else None,
        "wp_slug": wp_item.get("slug") if wp_item else None,
        "modified": wp_item.get("modified") if wp_item else None,
        "assets": page_assets,
        "internal_links": sorted({u for u in (normalize_url(l, url) for l in parser.links) if u}),
    }
    (page_dir / "metadata.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    (page_dir / "raw.html").write_text(resp.text, encoding="utf-8")

    return {
        "url": url,
        "slug": slug,
        "title": meta["title"],
        "description": meta["description"],
        "has_lorem_ipsum": has_lorem,
        "status": "ok",
        "wp_type": wp_item.get("type") if wp_item else "crawled",
        "image_count": len(page_assets["images"]),
        "video_count": len(page_assets["videos"]),
        "metadata_path": str((page_dir / "metadata.json").relative_to(ROOT)),
    }


def attach_local_paths(content_index: list[dict], downloaded: dict[str, str]) -> None:
    for page in content_index:
        meta_path = ROOT / page["metadata_path"]
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        for category in ("images", "other"):
            for asset in meta["assets"].get(category, []):
                asset["local"] = downloaded.get(asset["url"])
        for asset in meta["assets"].get("videos", []):
            if not asset.get("embed"):
                asset["local"] = downloaded.get(asset["url"])
        meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    for d in [PAGES_DIR, *ASSETS.values()]:
        d.mkdir(parents=True, exist_ok=True)

    log("Fetching WordPress content...")
    pages = fetch_json("pages")
    posts = fetch_json("posts")
    media = fetch_json("media")
    log(f"  WP pages: {len(pages)}, posts: {len(posts)}, media: {len(media)}")

    log("Fetching sitemap...")
    sitemap_urls = fetch_sitemap_urls()
    log(f"  Sitemap URLs: {len(sitemap_urls)}")

    wp_by_link: dict[str, dict] = {}
    for item in pages + posts:
        link = item["link"].rstrip("/") + "/"
        wp_by_link[link] = item

    all_urls: set[str] = set(sitemap_urls)
    all_urls.add(BASE_URL + "/")
    for item in pages + posts:
        norm = normalize_url(item["link"])
        if norm:
            all_urls.add(norm)

    content_index: list[dict] = []
    failed_pages: list[dict] = []
    pending_assets: dict[str, str] = {}  # url -> category

    log(f"Processing {len(all_urls)} pages (content only)...")
    for i, url in enumerate(sorted(all_urls), 1):
        log(f"  [{i}/{len(all_urls)}] {url}")
        wp_item = wp_by_link.get(url.rstrip("/") + "/")
        result = process_page(url, wp_item)
        if not result:
            continue
        if result.get("status") == "failed":
            failed_pages.append(result)
        else:
            content_index.append(result)
            meta = json.loads((ROOT / result["metadata_path"]).read_text(encoding="utf-8"))
            for img in meta["assets"]["images"]:
                pending_assets[img["url"]] = classify_asset(img["url"])
            for other in meta["assets"]["other"]:
                pending_assets[other["url"]] = classify_asset(other["url"])
            for vid in meta["assets"]["videos"]:
                if not vid.get("embed"):
                    pending_assets[vid["url"]] = "videos"
        time.sleep(DELAY_SEC)

    for m in media:
        src = m.get("source_url")
        if src and not src.lower().split("?")[0].endswith((".mp4", ".webm", ".mov", ".m4v")):
            pending_assets[src] = classify_asset(src)

    downloaded: dict[str, str] = {}
    failed_downloads: list[dict] = []
    log(f"Downloading {len(pending_assets)} unique assets...")
    for i, (asset_url, category) in enumerate(sorted(pending_assets.items()), 1):
        cat = category if category in ASSETS else "images"
        log(f"  [{i}/{len(pending_assets)}] {asset_url}")
        download_asset(asset_url, cat, downloaded, failed_downloads)

    attach_local_paths(content_index, downloaded)

    video_manifest: list[dict] = []
    seen_vids: set[str] = set()
    for page in content_index:
        meta = json.loads((ROOT / page["metadata_path"]).read_text(encoding="utf-8"))
        for vid in meta["assets"].get("videos", []):
            key = vid["url"]
            if key not in seen_vids:
                seen_vids.add(key)
                video_manifest.append({"page": meta["url"], **vid})

    embed_count = sum(1 for v in video_manifest if v.get("embed"))
    downloaded_count = sum(1 for v in video_manifest if not v.get("embed") and v.get("local"))

    (ASSETS["videos"] / "manifest.json").write_text(
        json.dumps(video_manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    sitemap = {
        "source": BASE_URL,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "urls": sorted(all_urls),
        "wp_pages": len(pages),
        "wp_posts": len(posts),
        "wp_media": len(media),
    }
    (SITE_DATA / "sitemap.json").write_text(json.dumps(sitemap, indent=2, ensure_ascii=False), encoding="utf-8")

    index = {
        "source": BASE_URL,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "pages_captured": len(content_index),
            "pages_failed": len(failed_pages),
            "images_downloaded": len([p for p in downloaded.values() if "images" in p]),
            "other_assets": len([p for p in downloaded.values() if "other" in p]),
            "videos_embed_urls": embed_count,
            "videos_downloaded": downloaded_count,
            "assets_failed": len(failed_downloads),
            "pages_with_lorem_ipsum": sum(1 for p in content_index if p.get("has_lorem_ipsum")),
        },
        "pages": content_index,
        "failed_pages": failed_pages,
        "failed_downloads": failed_downloads,
    }
    (SITE_DATA / "content-index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")

    lorem_pages = [p["title"] for p in content_index if p.get("has_lorem_ipsum")]
    readme = f"""# Fast Start Talking — Site Archive

**Source:** [{BASE_URL}]({BASE_URL})
**Captured:** {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
**Method:** WordPress REST API + Yoast sitemap + HTML crawl

## Summary

| Metric | Count |
|--------|-------|
| Pages captured | {len(content_index)} |
| Pages failed | {len(failed_pages)} |
| Images downloaded | {len([p for p in downloaded.values() if 'images' in p])} |
| Video embeds (YouTube/Vimeo/etc.) | {embed_count} |
| Videos downloaded (direct files) | {downloaded_count} |
| Other assets (PDF, favicon, etc.) | {len([p for p in downloaded.values() if 'other' in p])} |
| Asset downloads failed | {len(failed_downloads)} |
| WP pages (API) | {len(pages)} |
| WP posts (API) | {len(posts)} |
| WP media items (API) | {len(media)} |

## Directory Structure

```
fst/site-data/
├── sitemap.json
├── content-index.json
├── pages/<slug>/
│   ├── content.md
│   ├── metadata.json
│   └── raw.html
└── assets/
    ├── images/
    ├── videos/manifest.json
    └── other/
```

## Key Pages

"""
    for p in content_index:
        readme += f"- [{p['title']}]({p['url']}) → `pages/{p['slug']}/content.md`\n"

    if lorem_pages:
        readme += "\n## Lorem Ipsum Placeholder Text\n\n"
        for title in lorem_pages:
            readme += f"- {title}\n"

    if failed_pages:
        readme += "\n## Failed Pages\n\n"
        for f in failed_pages:
            readme += f"- {f['url']}: {f.get('error', 'unknown')}\n"

    if failed_downloads:
        readme += f"\n## Failed Asset Downloads ({len(failed_downloads)})\n\nSee `content-index.json` → `failed_downloads`.\n"

    readme += """
## Limitations

- External video embeds (YouTube, Vimeo) saved in `assets/videos/manifest.json`, not downloaded
- WordPress admin/login and search results excluded
- Elementor styling not fully preserved (content-focused archive)
- Crawl delay: 0.25s between requests
"""
    (SITE_DATA / "SCRAPE_REPORT.md").write_text(readme, encoding="utf-8")

    log("\nDone!")
    log(json.dumps(index["summary"], indent=2))


if __name__ == "__main__":
    main()

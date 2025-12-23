import os, csv, io, re
import requests
from datetime import datetime
from slugify import slugify
from openai import OpenAI
import json

GENERATED_PATH = os.path.join("content_pipeline", "generated.json")
SHEET_CSV_URL = os.environ.get("SHEET_CSV_URL", "").strip()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()

POSTS_DIR = os.path.join("src", "blog", "posts")

SYSTEM = """You are a professional Turkish SEO blog writer for EDER (ederapp.com).
Write helpful, original, non-spammy content. Avoid making absolute price claims. Use clear headings.
Include at least 4 H2 sections and a short FAQ section at the end (3 Q/A).
Add a short disclaimer about prices changing.
Include internal link suggestions in plain text (do not use markdown links), like:
- /valuation
- /pricing
"""

PROMPT = """Write a Turkish blog post.

Title: {title}
Primary keyword: {kw}
Audience: Turkish drivers shopping for used cars
Tone: professional, clear, friendly
Length: ~900-1200 words

Structure requirements:
- Start with a short intro
- At least 4 H2 sections (##)
- Use bullet lists where helpful
- Add "Sık Sorulan Sorular" section with 3 Q/A
- Add a short disclaimer at the end

Do not include HTML. Output Markdown only.
"""
def load_generated():
    if not os.path.exists(GENERATED_PATH):
        return {}
    with open(GENERATED_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return {}

def save_generated(data):
    os.makedirs(os.path.dirname(GENERATED_PATH), exist_ok=True)
    with open(GENERATED_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
def fetch_rows():
    if not SHEET_CSV_URL:
        raise RuntimeError("SHEET_CSV_URL missing")
    r = requests.get(SHEET_CSV_URL, timeout=30)
    r.raise_for_status()
    data = r.content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(data))
    return list(reader)

def pick_ready(rows, limit=2):
    ready = [row for row in rows if (row.get("status","").strip().upper() == "READY")]
    return ready[:limit]

def frontmatter(title, desc, date, slug, tags):
    # YAML frontmatter
    tags_list = [t.strip() for t in (tags or "").split(",") if t.strip()]
    tags_yaml = "[" + ", ".join([f'"{t}"' for t in tags_list]) + "]"
    canonical = f"https://ederapp.com/blog/{slug}"
    return f"""---
title: "{title}"
description: "{desc}"
date: "{date}"
slug: "{slug}"
tags: {tags_yaml}
canonical: "{canonical}"
---
"""

def build_description(text, fallback=""):
    # First ~155 chars from first paragraph
    s = re.sub(r"\s+", " ", text.strip())
    s = s[:155].rstrip()
    return s if len(s) > 40 else (fallback or s)

def ensure_dir():
    os.makedirs(POSTS_DIR, exist_ok=True)

def write_post(md, slug, date):
    filename = f"{date}-{slug}.md"
    path = os.path.join(POSTS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(md)
    return path

def main():
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY missing")

    ensure_dir()
    generated = load_generated()
    rows = fetch_rows()
    selected = pick_ready(rows, limit=2)
    if not selected:
        print("No READY rows found.")
        return

    client = OpenAI(api_key=OPENAI_API_KEY)

    created_paths = []
    for row in selected:
        title = (row.get("title") or "").strip()
        if not title:
            continue
        kw = (row.get("primary_keyword") or "").strip() or title
        tags = (row.get("tags") or "").strip()

        date = (row.get("date") or "").strip()
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        slug = (row.get("slug") or "").strip()
        if not slug:
            slug = slugify(title, lowercase=True)

        # 4) Her satır için üretimden önce kontrol et
        if slug in generated:
            print(f"Skip (already generated): {slug}")
            continue

        notes = (row.get("notes") or "").strip()
        user_prompt = PROMPT.format(title=title, kw=kw)
        if notes:
            user_prompt += f"\nExtra notes: {notes}\n"

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role":"system","content": SYSTEM},
                {"role":"user","content": user_prompt},
            ],
            temperature=0.7,
        )

        body = resp.choices[0].message.content.strip()

        # Description from content
        desc = build_description(body, fallback=f"{title} hakkında rehber ve piyasa analizi.")
        fm = frontmatter(title, desc.replace('"', "'"), date, slug, tags)

        md = fm + "\n" + body + "\n"
        path = write_post(md, slug, date)
        created_paths.append(path)
        print("Created:", path)

        # 5) Ürettikten sonra kaydet
        generated[slug] = date
        save_generated(generated)

    if not created_paths:
        print("No posts created.")
        return

if __name__ == "__main__":
    main()

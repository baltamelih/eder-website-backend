import os, csv, io, re
import requests
from datetime import datetime
from slugify import slugify
from openai import OpenAI
import json

import gspread
from google.oauth2.service_account import Credentials

# ----------------------------
# Config
# ----------------------------
GENERATED_PATH = os.path.join("content_pipeline", "generated.json")
SHEET_CSV_URL = os.environ.get("SHEET_CSV_URL", "").strip()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()

SHEET_ID = os.environ.get("SHEET_ID", "").strip()
SHEET_WORKSHEET = os.environ.get("SHEET_WORKSHEET", "Sheet1").strip()

POSTS_DIR = os.path.join("src", "blog", "posts")
STATUS_COL_NAME = "status"   # Sheet header'da status kolon adı
DONE_STATUS = "DONE"         # READY -> DONE yapılacak değer

SYSTEM = """You are a professional Turkish SEO blog writer for EDER (ederapp.com).
Write helpful, original, non-spammy content. Avoid making absolute price claims. Use clear headings.
Include at least 4 H2 sections and a short FAQ section at the end (3 Q/A).
Add a short disclaimer about prices changing.
Include internal link suggestions in plain text (do not use markdown links), like:
- app/valuation
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

# ----------------------------
# Google Sheets write helpers
# ----------------------------
def get_sheet_client():
    raw = os.environ.get("GSERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        raise RuntimeError("GSERVICE_ACCOUNT_JSON missing")

    info = json.loads(raw)
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_info(info, scopes=scopes)
    return gspread.authorize(creds)

def mark_status_in_sheet(row_index: int, status: str = DONE_STATUS):
    """
    row_index: Sheet'teki gerçek satır numarası (1 header dahil).
    status: Yazılacak durum (DONE, ERROR vb.)
    """
    if not SHEET_ID:
        raise RuntimeError("SHEET_ID missing")

    gc = get_sheet_client()
    sh = gc.open_by_key(SHEET_ID)
    ws = sh.worksheet(SHEET_WORKSHEET)

    headers = ws.row_values(1)
    if STATUS_COL_NAME not in headers:
        raise RuntimeError(f"'{STATUS_COL_NAME}' column not found in sheet headers: {headers}")

    status_col = headers.index(STATUS_COL_NAME) + 1  # 1-based index
    ws.update_cell(row_index, status_col, status)

# ----------------------------
# Local state (generated.json)
# ----------------------------
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

# ----------------------------
# Sheet CSV read
# ----------------------------
def fetch_rows():
    if not SHEET_CSV_URL:
        raise RuntimeError("SHEET_CSV_URL missing")

    r = requests.get(SHEET_CSV_URL, timeout=30)
    r.raise_for_status()

    data = r.content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(data))

    rows = []
    # CSV'de 1. satır header, veri 2. satırdan başlar
    for i, row in enumerate(reader, start=2):
        row["_row"] = i  # ✅ sheet satır numarası gibi kullanacağız
        rows.append(row)

    return rows

# ----------------------------
# Selection logic
# ----------------------------
def pick_ready(rows, generated, limit=3):
    """
    READY olanlardan, generated.json'da olmayan slug'ları seçer.
    Skip olanları geçip limit kadar doldurur.
    """
    picked = []
    for row in rows:
        if (row.get(STATUS_COL_NAME, "").strip().upper() != "READY"):
            continue

        title = (row.get("title") or "").strip()
        if not title:
            continue

        slug = (row.get("slug") or "").strip()
        if not slug:
            slug = slugify(title, lowercase=True)

        if slug in generated:
            continue

        picked.append(row)
        if len(picked) >= limit:
            break

    return picked

# ----------------------------
# Markdown helpers
# ----------------------------
def frontmatter(title, desc, date, slug, tags):
    tags_list = [t.strip() for t in (tags or "").split(",") if t.strip()]
    tags_yaml = "[" + ", ".join([f'"{t}"' for t in tags_list]) + "]"
    canonical = f"https://ederapp.com/blog/{slug}"

    safe_title = (title or "").replace('"', "'")
    safe_desc = (desc or "").replace('"', "'")

    return f"""---
title: "{safe_title}"
description: "{safe_desc}"
date: "{date}"
slug: "{slug}"
tags: {tags_yaml}
canonical: "{canonical}"
---
"""

def build_description(text, fallback=""):
    s = re.sub(r"\s+", " ", (text or "").strip())
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

# ----------------------------
# Main
# ----------------------------
def main():
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY missing")

    ensure_dir()
    generated = load_generated()

    rows = fetch_rows()
    selected = pick_ready(rows, generated, limit=3)

    if not selected:
        print("No READY rows found (or all READY are already generated).")
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

        if slug in generated:
            print(f"Skip (already generated): {slug}")
            continue

        notes = (row.get("notes") or "").strip()
        user_prompt = PROMPT.format(title=title, kw=kw)
        if notes:
            user_prompt += f"\nExtra notes: {notes}\n"

        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
            )

            body = (resp.choices[0].message.content or "").strip()
            if not body:
                raise RuntimeError("OpenAI returned empty content")

            desc = build_description(body, fallback=f"{title} hakkında rehber ve piyasa analizi.")
            fm = frontmatter(title, desc, date, slug, tags)

            md = fm + "\n" + body + "\n"
            path = write_post(md, slug, date)
            created_paths.append(path)
            print("Created:", path)

            # ✅ generated.json güncelle
            generated[slug] = date
            save_generated(generated)

            # ✅ Sheet status -> DONE (post üretimi başarılıysa)
            row_index = row.get("_row")
            if row_index:
                mark_status_in_sheet(int(row_index), DONE_STATUS)
                print(f"Sheet updated: row {row_index} -> {DONE_STATUS}")

        except Exception as e:
            # İstersen sheet'e ERROR basabilirsin:
            row_index = row.get("_row")
            if row_index:
                try:
                    mark_status_in_sheet(int(row_index), "ERROR")
                    print(f"Sheet updated: row {row_index} -> ERROR")
                except Exception as e2:
                    print("Failed to update sheet status to ERROR:", e2)

            print("Error generating/saving post for slug:", slug)
            raise  # workflow fail etsin istiyorsan raise kalsın, istemiyorsan kaldır.

    if not created_paths:
        print("No posts created.")
        return

    print(f"Done. Created {len(created_paths)} posts.")

if __name__ == "__main__":
    main()

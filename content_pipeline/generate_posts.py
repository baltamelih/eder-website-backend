import os, csv, io, re, json
import requests
from datetime import datetime
from slugify import slugify
from openai import OpenAI

import gspread
from google.oauth2.service_account import Credentials

# X (Twitter) API
from requests_oauthlib import OAuth1

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

# ----------------------------
# Blog constraints
# ----------------------------
MIN_WORDS = 1000
MAX_WORDS = 1500

# ----------------------------
# X (Twitter) env
# ----------------------------
X_API_KEY = os.environ.get("X_API_KEY", "").strip()
X_API_KEY_SECRET = os.environ.get("X_API_KEY_SECRET", "").strip()
X_ACCESS_TOKEN = os.environ.get("X_ACCESS_TOKEN", "").strip()
X_ACCESS_TOKEN_SECRET = os.environ.get("X_ACCESS_TOKEN_SECRET", "").strip()

def can_tweet():
    return all([X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET])

SYSTEM = """You are a professional Turkish SEO blog writer for EDER (ederapp.com).
Write helpful, original, non-spammy content. Avoid making absolute claims.
Use clear headings.

CRITICAL RULES:
- Do NOT provide specific car prices, price ranges, or numeric market values.
- Do NOT include any TL/₺ amounts or numbers that look like prices (e.g., 850.000, 850k, 850 bin).
- If you need to discuss pricing, do it qualitatively: "piyasada değişkenlik gösterir", "donanım ve km fiyatı etkiler".
- Include at least 4 H2 sections and a short FAQ section at the end (3 Q/A).
- Add a short disclaimer about prices changing.
- Include internal link suggestions in plain text (do not use markdown links), like:
  - app/valuation
  - /pricing
"""

PROMPT = """Write a Turkish blog post.

Title: {title}
Primary keyword: {kw}
Audience: Turkish drivers shopping for used cars
Tone: professional, clear, friendly
Target length: 1000-1500 words (IMPORTANT: stay within this range)

Structure requirements:
- Start with a short intro (2-3 short paragraphs)
- At least 4 H2 sections (##)
- Use bullet lists where helpful
- Add a "Sık Sorulan Sorular" section with 3 Q/A
- Add a short disclaimer at the end
- Add a small "EDER ile Değerleme" section describing how to use EDER without quoting prices; suggest using app/valuation and /pricing

Pricing rules:
- Do NOT include any exact prices, price ranges, or numbers that imply prices.
- Do NOT include any TL/₺ amounts or "xxx bin / xxxk / xxx.000" formats.
- Use qualitative language only.

Do not include HTML. Output Markdown only.
"""

# ----------------------------
# Google Sheets helpers
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

def _open_worksheet():
    if not SHEET_ID:
        raise RuntimeError("SHEET_ID missing")

    gc = get_sheet_client()
    sh = gc.open_by_key(SHEET_ID)

    try:
        ws = sh.worksheet(SHEET_WORKSHEET)
    except Exception:
        titles = [w.title for w in sh.worksheets()]
        raise RuntimeError(
            f"Worksheet not found: {SHEET_WORKSHEET}. Available: {titles}"
        )
    return ws

def _get_header_map(ws):
    headers = ws.row_values(1)
    if not headers:
        raise RuntimeError("Sheet header row (row 1) is empty.")
    header_map = {h.strip(): (idx + 1) for idx, h in enumerate(headers) if (h or "").strip()}
    if STATUS_COL_NAME not in header_map:
        raise RuntimeError(f"'{STATUS_COL_NAME}' column not found in sheet headers: {headers}")
    return headers, header_map

def mark_status_in_sheet_by_row(row_index: int, status: str):
    if not isinstance(row_index, int) or row_index < 2:
        raise RuntimeError(f"Invalid row_index: {row_index}")

    ws = _open_worksheet()
    _, header_map = _get_header_map(ws)
    status_col = header_map[STATUS_COL_NAME]
    ws.update_cell(row_index, status_col, status)

def mark_status_in_sheet_by_slug(slug_value: str, status: str):
    slug_value = (slug_value or "").strip()
    if not slug_value:
        raise RuntimeError("slug_value is empty")

    ws = _open_worksheet()
    headers, header_map = _get_header_map(ws)

    if "slug" not in header_map:
        raise RuntimeError(f"'slug' column not found in sheet headers: {headers}")

    slug_col = header_map["slug"]
    status_col = header_map[STATUS_COL_NAME]

    col_vals = ws.col_values(slug_col)
    target_row = None
    for i in range(2, len(col_vals) + 1):
        if (col_vals[i - 1] or "").strip() == slug_value:
            target_row = i
            break

    if not target_row:
        raise RuntimeError(f"Slug not found in sheet: {slug_value}")

    ws.update_cell(target_row, status_col, status)

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
    for i, row in enumerate(reader, start=2):
        row["_row"] = i
        rows.append(row)
    return rows

# ----------------------------
# Selection logic
# ----------------------------
def pick_ready(rows, generated, limit=3):
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
# Content safety: remove price-like patterns
# ----------------------------
_PRICE_PATTERNS = [
    r"\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b",                 # 850.000 / 1.250.000
    r"\b\d{2,4}\s?(?:bin|k)\b",                         # 850 bin / 850k
    r"(?:₺|TL)\s?\d[\d\.\,]*",                          # ₺850.000 / TL 850.000
    r"\b\d[\d\.\,]*\s?(?:₺|TL)\b",                      # 850.000 TL
    r"\b\d{2,4}\s?-\s?\d{2,4}\s?(?:bin|k)\b",           # 800-900 bin
    r"\b\d{1,3}\s?-\s?\d{1,3}\s?(?:bin|k)\b",           # 80-90 bin (just in case)
]

def sanitize_prices(md: str) -> str:
    if not md:
        return md
    out = md
    for pat in _PRICE_PATTERNS:
        out = re.sub(pat, "piyasaya göre değişebilir", out, flags=re.IGNORECASE)
    out = re.sub(r"fiyat aralığı", "fiyat seviyesi", out, flags=re.IGNORECASE)
    out = re.sub(r"ortalama fiyat", "genel fiyat seviyesi", out, flags=re.IGNORECASE)
    return out

def word_count(text: str) -> int:
    if not text:
        return 0
    cleaned = re.sub(r"[`*_>#\[\]\(\)\-]", " ", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return len(cleaned.split(" "))

def expand_to_range(client: OpenAI, title: str, kw: str, draft_md: str) -> str:
    wc = word_count(draft_md)
    if wc >= MIN_WORDS:
        return draft_md

    expand_prompt = f"""
Aşağıdaki yazıyı 1000-1500 kelime aralığına çıkar.
- Yeni H2 ekleyebilirsin.
- İçeriği derinleştir (kontrol listeleri, dikkat edilmesi gerekenler, bakım/versiyon farkları).
- Kesinlikle fiyat, fiyat aralığı veya TL/₺ gibi rakamlar ekleme.
- Başlık: {title}
- Ana anahtar kelime: {kw}

Mevcut taslak (Markdown):
{draft_md}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": expand_prompt},
        ],
        temperature=0.6,
    )
    return (resp.choices[0].message.content or "").strip() or draft_md

def trim_to_range(client: OpenAI, title: str, kw: str, draft_md: str) -> str:
    wc = word_count(draft_md)
    if wc <= MAX_WORDS:
        return draft_md

    trim_prompt = f"""
Aşağıdaki yazıyı 1000-1500 kelime aralığına indir.
- En önemli bilgileri koru.
- Tekrarlayan cümleleri sil, gereksiz uzatmaları çıkar.
- Kesinlikle fiyat, fiyat aralığı veya TL/₺ gibi rakamlar ekleme.
- Başlık: {title}
- Ana anahtar kelime: {kw}

Mevcut taslak (Markdown):
{draft_md}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": trim_prompt},
        ],
        temperature=0.4,
    )
    return (resp.choices[0].message.content or "").strip() or draft_md

# ----------------------------
# Tweet helpers (Title + intro + link)
# ----------------------------
def extract_intro(md: str, max_chars: int = 240) -> str:
    """
    Markdown içinden ilk 1-2 paragrafı alır; başlık/listeleri atlar.
    """
    if not md:
        return ""

    md2 = re.sub(r"(?s)^---.*?---\s*", "", md).strip()
    parts = [p.strip() for p in md2.split("\n\n") if p.strip()]

    intro_parts = []
    for p in parts:
        if p.startswith("#") or p.startswith("```") or p.startswith("- ") or p.startswith("* "):
            continue
        intro_parts.append(p)
        if len(intro_parts) >= 2:
            break

    intro = " ".join(intro_parts)
    intro = re.sub(r"\s+", " ", intro).strip()

    if len(intro) > max_chars:
        intro = intro[:max_chars].rsplit(" ", 1)[0].rstrip() + "…"
    return intro

def build_tweet_text(title: str, slug: str, body_md: str) -> str:
    link = f"https://ederapp.com/blog/{slug}"
    intro = extract_intro(body_md, max_chars=240)
    intro = sanitize_prices(intro)

    # Başlık + giriş + link (senin istediğin format)
    # Başlık çok uzunsa kısalt
    safe_title = (title or "").strip()
    if len(safe_title) > 90:
        safe_title = safe_title[:90].rsplit(" ", 1)[0] + "…"

    if intro:
        text = f"{safe_title}\n\n{intro}\n\n{link}"
    else:
        text = f"{safe_title}\n\n{link}"

    # Çok uzunsa biraz kırp (X linki otomatik kısaltır ama yine de güvenli)
    if len(text) > 275:
        # intro’yu kırp
        max_intro = max(80, 275 - len(safe_title) - len(link) - 6)
        intro2 = extract_intro(body_md, max_chars=max_intro)
        intro2 = sanitize_prices(intro2)
        text = f"{safe_title}\n\n{intro2}\n\n{link}"
        if len(text) > 280:
            text = (text[:280].rsplit(" ", 1)[0] + "…")
    return text

def post_tweet(text: str) -> dict:
    if not can_tweet():
        raise RuntimeError("X API env vars missing (X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)")

    url = "https://api.twitter.com/2/tweets"
    auth = OAuth1(X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)

    r = requests.post(url, auth=auth, json={"text": text}, timeout=30)
    if r.status_code >= 400:
        raise RuntimeError(f"Tweet failed: {r.status_code} {r.text}")
    return r.json()

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

        # generated.json: slug obj olabilir (tweet bilgisi)
        if slug in generated:
            print(f"Skip (already generated): {slug}")
            continue

        notes = (row.get("notes") or "").strip()
        user_prompt = PROMPT.format(title=title, kw=kw)
        if notes:
            user_prompt += f"\nExtra notes: {notes}\n"

        row_index = row.get("_row")
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

            # 1) fiyat benzeri kalıpları temizle
            body = sanitize_prices(body)

            # 2) Kelime aralığına zorla (1 expand / 1 trim turu)
            wc = word_count(body)
            if wc < MIN_WORDS:
                body2 = expand_to_range(client, title, kw, body)
                body = sanitize_prices(body2)
            wc = word_count(body)
            if wc > MAX_WORDS:
                body2 = trim_to_range(client, title, kw, body)
                body = sanitize_prices(body2)

            wc_final = word_count(body)
            if wc_final < MIN_WORDS or wc_final > MAX_WORDS:
                print(f"[warn] Word count out of range ({wc_final}). Proceeding anyway.")

            desc = build_description(body, fallback=f"{title} hakkında rehber ve piyasa değerlendirmesi.")
            fm = frontmatter(title, desc, date, slug, tags)

            md = fm + "\n" + body + "\n"
            path = write_post(md, slug, date)
            created_paths.append(path)
            print("Created:", path, "| words:", wc_final)

            # ✅ generated.json güncelle (slug -> object)
            generated[slug] = {
                "date": date,
                "tweeted": False,
                "tweet_id": None,
                "tweeted_at": None,
            }
            save_generated(generated)

            # ✅ Tweet at (best-effort)
            try:
                # İstersen env ile tweet'i kapat: ENABLE_TWEET=0
                enable_tweet = os.environ.get("ENABLE_TWEET", "1").strip() != "0"

                if enable_tweet and can_tweet():
                    tweet_text = build_tweet_text(title, slug, body)
                    res = post_tweet(tweet_text)
                    tweet_id = (res.get("data") or {}).get("id")

                    generated[slug]["tweeted"] = True
                    generated[slug]["tweet_id"] = tweet_id
                    generated[slug]["tweeted_at"] = datetime.utcnow().isoformat() + "Z"
                    save_generated(generated)

                    print("Tweet posted:", tweet_id)
                else:
                    if not enable_tweet:
                        print("[warn] Tweet skipped: ENABLE_TWEET=0")
                    elif not can_tweet():
                        print("[warn] Tweet skipped: X API env vars missing.")
            except Exception as te:
                print("[warn] Tweet failed (continuing):", te)

            # ✅ Sheet status -> DONE
            if row_index:
                try:
                    mark_status_in_sheet_by_row(int(row_index), DONE_STATUS)
                    print(f"Sheet updated: row {row_index} -> {DONE_STATUS}")
                except Exception as e_row:
                    print(f"[warn] Row update failed ({e_row}). Trying slug fallback...")
                    mark_status_in_sheet_by_slug(slug, DONE_STATUS)
                    print(f"Sheet updated: slug {slug} -> {DONE_STATUS}")

        except Exception as e:
            if row_index:
                try:
                    mark_status_in_sheet_by_row(int(row_index), "ERROR")
                    print(f"Sheet updated: row {row_index} -> ERROR")
                except Exception as e_row:
                    print(f"[warn] Row ERROR update failed ({e_row}). Trying slug fallback...")
                    try:
                        mark_status_in_sheet_by_slug(slug, "ERROR")
                        print(f"Sheet updated: slug {slug} -> ERROR")
                    except Exception as e2:
                        print("Failed to update sheet status to ERROR:", e2)

            print("Error generating/saving post for slug:", slug)
            raise

    if not created_paths:
        print("No posts created.")
        return

    print(f"Done. Created {len(created_paths)} posts.")

if __name__ == "__main__":
    main()

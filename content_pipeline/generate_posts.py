import csv
import io
import json
import os
import re
from datetime import datetime

import gspread
import requests
from google.oauth2.service_account import Credentials
from openai import OpenAI
from slugify import slugify


# ----------------------------
# Config
# ----------------------------
SHEET_CSV_URL = os.environ.get("SHEET_CSV_URL", "").strip()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "").strip() or "gpt-4o-mini"
RETRY_SLUGS_RAW = os.environ.get("RETRY_SLUGS", "").strip()

SHEET_ID = os.environ.get("SHEET_ID", "").strip()
SHEET_WORKSHEET = os.environ.get("SHEET_WORKSHEET", "Sheet1").strip()

POSTS_DIR = os.path.join("src", "blog", "posts")
RUN_MANIFEST_PATH = os.path.join("content_pipeline", "run_manifest.json")

STATUS_COL_NAME = "status"
READY_STATUS = "READY"
ERROR_STATUS = "ERROR"

MIN_WORDS = 1000
MAX_WORDS = 1500

SYSTEM = """You are a professional Turkish SEO blog writer for EDER (ederapp.com).
Write helpful, original, non-spammy content. Avoid making absolute claims.
Use clear headings.

CRITICAL RULES:
- Do NOT provide specific car prices, price ranges, or numeric market values.
- Do NOT include any TL/₺ amounts or numbers that look like prices (e.g., 850.000, 850k, 850 bin).
- Technical numbers such as year, kilometre, engine size and model names are allowed and must remain accurate.
- If you need to discuss pricing, do it qualitatively: "piyasada değişkenlik gösterir", "donanım ve km fiyatı etkiler".
- Include at least 4 H2 sections and a short FAQ section at the end (3 Q/A).
- Add a short disclaimer about prices changing.
- Include a small "EDER ile Değerleme" section.
- Mention app/valuation and /pricing as plain-text internal paths.
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
- Add a short disclaimer at the end explaining that market conditions and prices can change
- Add a small "EDER ile Değerleme" section describing how to use EDER without quoting prices
- Mention app/valuation and /pricing as plain text

Pricing rules:
- Do NOT include any exact prices, price ranges, or numbers that imply prices.
- Do NOT include any TL/₺ amounts.
- Technical values such as model year, kilometre and engine size are allowed.
- Use qualitative pricing language only.

Do not include HTML. Output Markdown only.
"""


# ----------------------------
# Google Sheets
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
        return sh.worksheet(SHEET_WORKSHEET)
    except Exception:
        titles = [w.title for w in sh.worksheets()]
        raise RuntimeError(
            f"Worksheet not found: {SHEET_WORKSHEET}. Available: {titles}"
        )


def _get_header_map(ws):
    headers = ws.row_values(1)
    if not headers:
        raise RuntimeError("Sheet header row (row 1) is empty.")

    header_map = {
        (h or "").strip(): idx + 1
        for idx, h in enumerate(headers)
        if (h or "").strip()
    }

    if STATUS_COL_NAME not in header_map:
        raise RuntimeError(
            f"'{STATUS_COL_NAME}' column not found in sheet headers: {headers}"
        )

    return headers, header_map


def mark_status_in_sheet_by_slug(slug_value: str, status: str):
    slug_value = (slug_value or "").strip()
    if not slug_value:
        raise RuntimeError("slug_value is empty")

    ws = _open_worksheet()
    headers, header_map = _get_header_map(ws)

    if "slug" not in header_map:
        raise RuntimeError(
            f"'slug' column not found in sheet headers: {headers}"
        )

    slug_col = header_map["slug"]
    status_col = header_map[STATUS_COL_NAME]

    col_vals = ws.col_values(slug_col)
    for row_no in range(2, len(col_vals) + 1):
        if (col_vals[row_no - 1] or "").strip() == slug_value:
            ws.update_cell(row_no, status_col, status)
            return

    raise RuntimeError(f"Slug not found in sheet: {slug_value}")


def fetch_rows_from_sheet():
    ws = _open_worksheet()
    values = ws.get_all_values()
    if not values:
        return []

    headers = [(h or "").strip() for h in values[0]]
    rows = []

    for row_no, cells in enumerate(values[1:], start=2):
        padded = list(cells) + [""] * max(0, len(headers) - len(cells))
        row = {
            headers[i]: padded[i]
            for i in range(len(headers))
            if headers[i]
        }
        row["_row"] = row_no
        rows.append(row)

    return rows


def fetch_rows():
    # Single source of truth: Google Sheets API.
    # CSV remains a compatibility fallback only.
    if SHEET_ID and os.environ.get("GSERVICE_ACCOUNT_JSON", "").strip():
        return fetch_rows_from_sheet()

    if not SHEET_CSV_URL:
        raise RuntimeError(
            "Sheet access unavailable: SHEET_ID/GSERVICE_ACCOUNT_JSON "
            "or SHEET_CSV_URL required"
        )

    r = requests.get(SHEET_CSV_URL, timeout=30)
    r.raise_for_status()

    data = r.content.decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(data))
    rows = []

    for row_no, row in enumerate(reader, start=2):
        row["_row"] = row_no
        rows.append(row)

    return rows


# ----------------------------
# Selection
# ----------------------------
def parse_retry_slugs(raw: str):
    seen = set()
    ordered = []
    for item in (raw or "").split(","):
        slug = item.strip()
        if not slug or slug in seen:
            continue
        seen.add(slug)
        ordered.append(slug)
    return ordered


def row_slug(row):
    title = (row.get("title") or "").strip()
    return (
        (row.get("slug") or "").strip()
        or (slugify(title, lowercase=True) if title else "")
    )


def pick_ready(rows, limit=3, retry_slugs=None):
    retry_slugs = list(retry_slugs or [])

    # Manual recovery mode is deliberately exact: only the slugs explicitly
    # supplied in workflow_dispatch are retried, regardless of current status.
    if retry_slugs:
        by_slug = {}
        for row in rows:
            slug = row_slug(row)
            if slug and slug not in by_slug:
                by_slug[slug] = row

        picked = []
        for slug in retry_slugs:
            row = by_slug.get(slug)
            if row is None:
                print(f"[warn] Retry slug not found in sheet: {slug}")
                continue
            picked.append(row)
            if len(picked) >= limit:
                break

        print(
            "Manual retry selection:",
            ",".join(row_slug(row) for row in picked),
        )
        return picked

    picked = []
    seen_slugs = set()

    for row in rows:
        if (row.get(STATUS_COL_NAME, "").strip().upper() != READY_STATUS):
            continue

        title = (row.get("title") or "").strip()
        if not title:
            continue

        slug = row_slug(row)

        if not slug or slug in seen_slugs:
            continue

        seen_slugs.add(slug)
        picked.append(row)

        if len(picked) >= limit:
            break

    return picked


# ----------------------------
# Markdown
# ----------------------------
def frontmatter(title, desc, date, slug, tags):
    tags_list = [
        t.strip()
        for t in (tags or "").split(",")
        if t.strip()
    ]
    tags_yaml = (
        "["
        + ", ".join([f'"{t}"' for t in tags_list])
        + "]"
    )

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


def strip_markdown_for_description(text: str) -> str:
    out = re.sub(r"(?m)^#{1,6}\s+", "", text or "")
    out = re.sub(r"[`*_>\[\]\(\)]", " ", out)
    out = re.sub(r"\s+", " ", out).strip()
    return out


def build_description(text, fallback=""):
    s = strip_markdown_for_description(text)
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
# Price safety without corrupting km/year values
# ----------------------------
_PRICE_CONTEXT_WORDS = (
    "fiyat",
    "fiyatı",
    "fiyatlar",
    "bedel",
    "değer",
    "piyasa",
    "satış",
)

_CURRENCY_PATTERNS = [
    r"(?:₺|TL)\s*\d[\d\.\,\s]*",
    r"\b\d[\d\.\,\s]*\s*(?:₺|TL)\b",
    r"\b\d+(?:[\.,]\d+)?\s*(?:bin|k)\s*(?:TL|₺|lira)\b",
    r"\b\d+(?:[\.,]\d+)?\s*(?:milyon)\s*(?:TL|₺|lira)\b",
]


def _has_price_context(text: str, start: int, end: int) -> bool:
    left = max(0, start - 70)
    right = min(len(text), end + 70)
    window = text[left:right].lower()

    # Explicit technical units must not be treated as prices.
    suffix = text[end:end + 20].lower()
    if re.match(r"\s*(?:km|kilometre|cc|hp|bg|model)\b", suffix):
        return False

    return any(word in window for word in _PRICE_CONTEXT_WORDS)


def sanitize_prices(md: str) -> str:
    if not md:
        return md

    out = md

    # Currency-tagged values are unambiguously price-like.
    for pat in _CURRENCY_PATTERNS:
        out = re.sub(
            pat,
            "piyasaya göre değişebilir",
            out,
            flags=re.IGNORECASE,
        )

    # Plain 150.000 may be kilometre. Replace only with nearby price context.
    formatted = re.compile(
        r"\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b"
    )

    def formatted_repl(match):
        if _has_price_context(
            out,
            match.start(),
            match.end(),
        ):
            return "piyasaya göre değişebilir"
        return match.group(0)

    out = formatted.sub(formatted_repl, out)

    # "850 bin" may be a price or technical quantity; context decides.
    compact = re.compile(
        r"\b\d{2,4}\s*(?:bin|k)\b",
        flags=re.IGNORECASE,
    )

    def compact_repl(match):
        if _has_price_context(
            out,
            match.start(),
            match.end(),
        ):
            return "piyasaya göre değişebilir"
        return match.group(0)

    out = compact.sub(compact_repl, out)

    out = re.sub(
        r"fiyat aralığı",
        "fiyat seviyesi",
        out,
        flags=re.IGNORECASE,
    )
    out = re.sub(
        r"ortalama fiyat",
        "genel fiyat seviyesi",
        out,
        flags=re.IGNORECASE,
    )
    return out


def word_count(text: str) -> int:
    if not text:
        return 0

    cleaned = re.sub(
        r"[`*_>#\[\]\(\)\-]",
        " ",
        text,
    )
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return len(cleaned.split()) if cleaned else 0


def explicit_price_leaks(text: str):
    leaks = []

    explicit = re.compile(
        r"(?:₺\s*\d|"
        r"\d[\d\.\,\s]*\s*(?:TL|₺|lira)\b|"
        r"\d+(?:[\.,]\d+)?\s*(?:bin|k|milyon)\s*(?:TL|₺|lira)\b)",
        flags=re.IGNORECASE,
    )

    for match in explicit.finditer(text or ""):
        leaks.append(match.group(0)[:80])

    formatted = re.compile(
        r"\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b"
    )
    for match in formatted.finditer(text or ""):
        if _has_price_context(
            text,
            match.start(),
            match.end(),
        ):
            leaks.append(match.group(0))

    return leaks[:10]


# ----------------------------
# Quality gates
# ----------------------------
_EDER_SECTION = """## EDER ile Değerleme

Araç hakkında topladığın bilgileri tek bir ayrıntıya bakarak değil, kilometre, bakım geçmişi, ekspertiz bulguları, kullanım biçimi ve benzer araçların genel piyasa görünümüyle birlikte değerlendirmek daha sağlıklıdır. EDER üzerinde app/valuation bölümünden araç bilgilerini kullanarak güncel bir değerleme oluşturabilir, /pricing sayfasından da sunulan özelliklerin kapsamını inceleyebilirsin. EDER sonucu kararın tek dayanağı olarak değil, ilan incelemesi, ekspertiz ve bakım kayıtlarını tamamlayan bir referans olarak kullanmak en doğru yaklaşımdır.
"""

_FAQ_SECTION = """## Sık Sorulan Sorular

### Tek bir özellik aracın değerini belirler mi?
Hayır. İkinci el araç değerlendirmesinde kilometre, yaş, bakım geçmişi, donanım, mekanik durum, kaporta geçmişi ve piyasa koşulları birlikte ele alınmalıdır.

### Ekspertiz raporu neden önemlidir?
Ekspertiz raporu, ilandaki anlatımla aracın fiziksel ve mekanik durumunu karşılaştırmaya yardımcı olur. Özellikle bakım kayıtları ve geçmiş işlemlerle birlikte okunduğunda daha anlamlıdır.

### Değerleme sonucunu nasıl kullanmalıyım?
Değerleme sonucunu pazarlık veya satın alma kararında tek başına kesin sonuç olarak değil, ekspertiz, servis kayıtları ve benzer araç incelemeleriyle birlikte bir referans olarak kullanmak daha uygundur.
"""

_DISCLAIMER_SECTION = """## Önemli Not

İkinci el araç fiyatları piyasa koşulları, aracın gerçek durumu, kilometresi, bakım geçmişi, donanımı ve bölgesel arz-talep gibi etkenlerle zaman içinde değişebilir. Bu nedenle içerikteki değerlendirmeler genel bilgilendirme amacı taşır; güncel araç ve piyasa verileri ayrıca kontrol edilmelidir.
"""

_DEPTH_SECTIONS = [
    """## Değerlendirmeyi Güçlendiren Kontroller

Bir aracı değerlendirirken ilandaki tek bir bilgiye odaklanmak yerine verilerin birbiriyle tutarlı olup olmadığına bakmak faydalıdır. Kilometre bilgisini bakım kayıtlarıyla, kaporta durumunu ekspertiz raporuyla, kullanım izlerini ise aracın yaşı ve kullanım amacıyla birlikte değerlendirmek daha gerçekçi bir tablo verir. Test sürüşünde motorun çalışma karakteri, direksiyon tepkileri, fren hissi, süspansiyon sesleri ve gösterge panelindeki uyarılar not edilebilir. Böylece satın alma kararı yalnızca ilan açıklamasına değil, birden fazla bağımsız gözleme dayanır.
""",
    """## Bakım ve Kullanım Geçmişini Birlikte Okuyun

Düzenli bakım kayıtları aracın geçmişi hakkında önemli bağlam sağlar. Servis faturaları, periyodik bakım tarihleri, değişen sarf parçaları ve önceki ekspertiz kayıtları mümkünse kronolojik olarak karşılaştırılmalıdır. Uzun süreli kullanımda ortaya çıkabilecek masrafları değerlendirirken sadece mevcut görünümü değil, yaklaşan bakım ihtiyaçlarını da hesaba katmak gerekir. Aynı modelde iki araç benzer görünse bile kullanım biçimi ve bakım disiplini farklı olduğunda genel kondisyonları da farklı olabilir.
""",
    """## İlan Bilgilerini Yerinde Doğrulayın

İlanda belirtilen donanım, kilometre, hasar geçmişi ve bakım bilgileri aracı görmeden önce bir ön çerçeve sunar. Aracı incelerken bu bilgilerin mümkün olduğunca belge, servis kaydı ve fiziksel kontrol ile doğrulanması önemlidir. Şasi ve gövde birleşim noktaları, lastiklerin eşit aşınması, iç mekândaki kullanım izleri ve elektronik ekipmanların çalışması gibi detaylar genel kondisyon hakkında ek ipuçları verir. Belirsiz kalan noktalar için satıcıdan açıklama istemek ve gerekirse bağımsız uzman görüşü almak daha güvenli bir süreç oluşturur.
""",
    """## Karar Verirken Bütün Resme Bakın

İkinci el araç seçiminde amaç yalnızca kusursuz görünen aracı bulmak değildir; bilinen durumu, bakım geçmişi ve kullanım ihtiyacınla uyumu anlaşılır olan aracı seçmektir. Küçük kozmetik kusurlar ile mekanik veya yapısal riskleri aynı ağırlıkta değerlendirmemek gerekir. Aracın günlük kullanım, uzun yol, şehir içi veya aile kullanımı gibi planlanan senaryoya uygunluğu da kararın parçasıdır. Toplanan bilgileri birlikte değerlendirmek, tek bir olumlu ya da olumsuz ayrıntının kararı gereğinden fazla etkilemesini önler.
""",
]


def _has_faq(body: str) -> bool:
    match = re.search(
        r"(?im)^##\s+.*s[ıi]k\s+sorulan\s+sorular.*$",
        body or "",
    )
    if not match:
        return False
    return (body or "")[match.start():].count("?") >= 3


def _has_eder_section(body: str) -> bool:
    return bool(
        re.search(
            r"(?im)^##\s+.*EDER.*Değerleme.*$",
            body or "",
        )
    )


def _has_price_disclaimer(body: str) -> bool:
    lowered = (body or "").lower()
    tail = lowered[-3500:]
    return (
        "fiyat" in tail
        and (
            "değiş" in tail
            or "güncel" in tail
            or "piyasa koşul" in tail
        )
    )


def ensure_required_sections(body: str) -> str:
    out = (body or "").strip()

    if not _has_eder_section(out):
        out += "\n\n" + _EDER_SECTION.strip()

    lowered = out.lower()
    if "app/valuation" not in lowered or "/pricing" not in lowered:
        out += (
            "\n\nEDER bağlantıları: araç değerleme için app/valuation, "
            "özellik kapsamını incelemek için /pricing."
        )

    if not _has_faq(out):
        out += "\n\n" + _FAQ_SECTION.strip()

    if not _has_price_disclaimer(out):
        out += "\n\n" + _DISCLAIMER_SECTION.strip()

    return sanitize_prices(out).strip()


def append_depth_until_minimum(body: str) -> str:
    out = (body or "").strip()
    existing = out.lower()

    for section in _DEPTH_SECTIONS:
        if word_count(out) >= MIN_WORDS:
            break

        heading = section.splitlines()[0].strip().lower()
        if heading in existing:
            continue

        out += "\n\n" + section.strip()
        existing = out.lower()

    return out


def validate_quality(body: str):
    issues = []
    wc = word_count(body)

    if wc < MIN_WORDS or wc > MAX_WORDS:
        issues.append(
            f"word_count={wc} outside {MIN_WORDS}-{MAX_WORDS}"
        )

    h2_count = len(
        re.findall(
            r"(?m)^##\s+[^#].+$",
            body or "",
        )
    )
    if h2_count < 4:
        issues.append(f"h2_count={h2_count} < 4")

    if not _has_faq(body):
        issues.append("faq_section_missing_or_incomplete")

    if not _has_eder_section(body):
        issues.append("eder_degerleme_section_missing")

    lowered = (body or "").lower()
    if "app/valuation" not in lowered:
        issues.append("app/valuation_missing")
    if "/pricing" not in lowered:
        issues.append("/pricing_missing")

    if not _has_price_disclaimer(body):
        issues.append("price_disclaimer_missing")

    leaks = explicit_price_leaks(body)
    if leaks:
        issues.append(
            "price_leak=" + " | ".join(leaks[:3])
        )

    return issues


def call_model(client: OpenAI, user_prompt: str, temperature: float):
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
    )
    return (resp.choices[0].message.content or "").strip()


def expand_to_range(
    client: OpenAI,
    title: str,
    kw: str,
    draft_md: str,
    tries: int = 3,
) -> str:
    out = ensure_required_sections(draft_md)
    best = out
    best_wc = word_count(out)

    for _ in range(max(1, tries)):
        if best_wc >= 1080:
            break

        prompt = f"""
Aşağıdaki mevcut Markdown yazıyı tamamen yeniden yazma.
Mevcut başlıkları, paragrafları ve özellikle şu literal metinleri KORU:
- ## EDER ile Değerleme
- app/valuation
- /pricing
- ## Sık Sorulan Sorular
- ## Önemli Not

Yalnızca konuya gerçekten değer katacak yeni açıklamalar ekleyerek toplam metni
1100-1300 kelime aralığına yaklaştır. Fiyat veya TL/₺ tutarı ekleme.
Yıl, kilometre ve motor hacmi gibi teknik sayıları bozma.

Başlık: {title}
Ana anahtar kelime: {kw}

Mevcut taslak:
{best}
"""
        candidate = call_model(
            client,
            prompt,
            temperature=0.35,
        )

        if not candidate:
            continue

        candidate = ensure_required_sections(
            sanitize_prices(candidate)
        )
        candidate_wc = word_count(candidate)

        # Never accept a repair that makes an under-length draft even shorter.
        if candidate_wc > best_wc:
            best = candidate
            best_wc = candidate_wc

    if best_wc < MIN_WORDS:
        best = append_depth_until_minimum(best)

    return ensure_required_sections(best)


def trim_to_range(
    client: OpenAI,
    title: str,
    kw: str,
    draft_md: str,
) -> str:
    out = ensure_required_sections(draft_md)
    if word_count(out) <= MAX_WORDS:
        return out

    prompt = f"""
Aşağıdaki Markdown yazıyı 1150-1300 kelime aralığına indir.
Tekrarlanan veya gereksiz cümleleri kısalt; faydalı bilgiyi koru.

Şunları AYNEN koru:
- ## EDER ile Değerleme
- app/valuation
- /pricing
- ## Sık Sorulan Sorular ve en az 3 soru
- ## Önemli Not

Fiyat veya TL/₺ tutarı ekleme. Yıl, kilometre ve motor hacmi gibi teknik sayıları bozma.

Başlık: {title}
Ana anahtar kelime: {kw}

Mevcut taslak:
{out}
"""
    candidate = call_model(
        client,
        prompt,
        temperature=0.25,
    )

    candidate = ensure_required_sections(
        sanitize_prices(candidate or out)
    )

    return candidate


def repair_quality(
    client: OpenAI,
    title: str,
    kw: str,
    draft_md: str,
    issues,
) -> str:
    # Deterministic structure repair first; model is only used to add/trim
    # substantive depth. This prevents a repair pass from deleting mandatory
    # EDER links/headings that were already present.
    out = ensure_required_sections(draft_md)

    if word_count(out) < MIN_WORDS:
        out = expand_to_range(
            client,
            title,
            kw,
            out,
            tries=3,
        )

    out = ensure_required_sections(out)

    if word_count(out) < MIN_WORDS:
        out = append_depth_until_minimum(out)

    if word_count(out) > MAX_WORDS:
        out = trim_to_range(
            client,
            title,
            kw,
            out,
        )

    out = ensure_required_sections(out)

    if word_count(out) < MIN_WORDS:
        out = append_depth_until_minimum(out)

    return sanitize_prices(out).strip()


# ----------------------------
# Tweet text, generated now but sent only after Sanity publish
# ----------------------------
def extract_intro(md: str, max_chars: int = 210) -> str:
    if not md:
        return ""

    parts = [
        p.strip()
        for p in md.split("\n\n")
        if p.strip()
    ]

    intro_parts = []
    for part in parts:
        if (
            part.startswith("#")
            or part.startswith("```")
            or part.startswith("- ")
            or part.startswith("* ")
        ):
            continue

        intro_parts.append(part)
        if len(intro_parts) >= 2:
            break

    intro = " ".join(intro_parts)
    intro = re.sub(r"\s+", " ", intro).strip()

    if len(intro) > max_chars:
        intro = (
            intro[:max_chars]
            .rsplit(" ", 1)[0]
            .rstrip()
            + "…"
        )

    return intro


def build_tweet_text(title: str, slug: str, body_md: str) -> str:
    link = f"https://ederapp.com/blog/{slug}"
    safe_title = (title or "").strip()

    if len(safe_title) > 88:
        safe_title = (
            safe_title[:88]
            .rsplit(" ", 1)[0]
            + "…"
        )

    intro = extract_intro(
        sanitize_prices(body_md),
        max_chars=185,
    )

    if intro:
        text = (
            f"{safe_title}\n\n"
            f"{intro}\n\n"
            f"{link}"
        )
    else:
        text = f"{safe_title}\n\n{link}"

    while len(text) > 280 and intro:
        intro = (
            intro[:-20]
            .rsplit(" ", 1)[0]
            .rstrip()
            + "…"
        )
        text = (
            f"{safe_title}\n\n"
            f"{intro}\n\n"
            f"{link}"
        )

    if len(text) > 280:
        text = f"{safe_title}\n\n{link}"

    return text[:280]


def write_manifest(data):
    os.makedirs(
        os.path.dirname(RUN_MANIFEST_PATH),
        exist_ok=True,
    )
    with open(
        RUN_MANIFEST_PATH,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2,
        )


# ----------------------------
# Main
# ----------------------------
def main():
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY missing")

    ensure_dir()

    max_posts = int(
        os.environ.get(
            "MAX_POSTS_PER_RUN",
            "3",
        )
    )

    rows = fetch_rows()
    retry_slugs = parse_retry_slugs(RETRY_SLUGS_RAW)
    selected = pick_ready(
        rows,
        limit=max_posts,
        retry_slugs=retry_slugs,
    )

    manifest = {
        "version": 2,
        "generated_at": (
            datetime.utcnow().isoformat()
            + "Z"
        ),
        "openai_model": OPENAI_MODEL,
        "posts": [],
        "errors": [],
    }

    if not selected:
        write_manifest(manifest)
        if retry_slugs:
            print("No matching retry slugs found.")
        else:
            print("No READY rows found.")
        return

    client = OpenAI(
        api_key=OPENAI_API_KEY
    )

    for row in selected:
        title = (
            row.get("title")
            or ""
        ).strip()

        if not title:
            continue

        kw = (
            row.get("primary_keyword")
            or ""
        ).strip() or title

        tags = (
            row.get("tags")
            or ""
        ).strip()

        date = (
            row.get("date")
            or ""
        ).strip() or datetime.now().strftime(
            "%Y-%m-%d"
        )

        slug = (
            (row.get("slug") or "").strip()
            or slugify(
                title,
                lowercase=True,
            )
        )

        notes = (
            row.get("notes")
            or ""
        ).strip()

        try:
            user_prompt = PROMPT.format(
                title=title,
                kw=kw,
            )

            if notes:
                user_prompt += (
                    "\nExtra notes: "
                    + notes
                    + "\n"
                )

            body = call_model(
                client,
                user_prompt,
                temperature=0.7,
            )

            if not body:
                raise RuntimeError(
                    "OpenAI returned empty content"
                )

            body = ensure_required_sections(
                sanitize_prices(body)
            )

            if word_count(body) < MIN_WORDS:
                body = expand_to_range(
                    client,
                    title,
                    kw,
                    body,
                    tries=3,
                )

            if word_count(body) < MIN_WORDS:
                body = append_depth_until_minimum(body)

            if word_count(body) > MAX_WORDS:
                body = trim_to_range(
                    client,
                    title,
                    kw,
                    body,
                )

            body = ensure_required_sections(body)

            if word_count(body) < MIN_WORDS:
                body = append_depth_until_minimum(body)

            issues = validate_quality(body)

            if issues:
                print(
                    "[quality] repair requested "
                    f"slug={slug}: "
                    + "; ".join(issues)
                )
                body = repair_quality(
                    client,
                    title,
                    kw,
                    body,
                    issues,
                )
                issues = validate_quality(body)

            if issues:
                raise RuntimeError(
                    "QUALITY_GATE_FAILED: "
                    + "; ".join(issues)
                )

            wc_final = word_count(body)

            desc = build_description(
                body,
                fallback=(
                    f"{title} hakkında rehber "
                    "ve piyasa değerlendirmesi."
                ),
            )

            fm = frontmatter(
                title,
                desc,
                date,
                slug,
                tags,
            )

            md = fm + "\n" + body + "\n"
            path = write_post(
                md,
                slug,
                date,
            )

            post = {
                "row_index": row.get("_row"),
                "title": title,
                "slug": slug,
                "date": date,
                "path": path.replace("\\", "/"),
                "url": (
                    f"https://ederapp.com/blog/{slug}"
                ),
                "tweet_text": build_tweet_text(
                    title,
                    slug,
                    body,
                ),
                "word_count": wc_final,
                "quality": {
                    "h2_count": len(
                        re.findall(
                            r"(?m)^##\s+[^#].+$",
                            body,
                        )
                    ),
                    "faq": True,
                    "price_leaks": 0,
                },
            }

            manifest["posts"].append(post)

            print(
                "Generated + quality PASS:",
                path,
                "| words:",
                wc_final,
            )

            # IMPORTANT:
            # Do not mark DONE and do not tweet here.
            # READY remains recoverable until Sanity succeeds.

        except Exception as exc:
            error_text = (
                f"{type(exc).__name__}: {exc}"
            )

            manifest["errors"].append(
                {
                    "title": title,
                    "slug": slug,
                    "row_index": row.get("_row"),
                    "error": error_text,
                }
            )

            try:
                mark_status_in_sheet_by_slug(
                    slug,
                    ERROR_STATUS,
                )
                print(
                    f"Sheet updated: slug {slug} "
                    f"-> {ERROR_STATUS}"
                )
            except Exception as sheet_exc:
                print(
                    "[warn] Failed to mark ERROR "
                    f"for {slug}: {sheet_exc}"
                )

            print(
                "[error] Generation failed for",
                slug,
                error_text,
            )
            # Continue with the next row.

    write_manifest(manifest)

    print(
        "Generation summary:",
        f"passed={len(manifest['posts'])}",
        f"failed={len(manifest['errors'])}",
        f"model={OPENAI_MODEL}",
    )

    if selected and not manifest["posts"]:
        raise RuntimeError(
            "No selected post passed generation "
            "and quality gates."
        )


if __name__ == "__main__":
    main()

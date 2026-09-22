import json
import os
import sys
import time
from datetime import datetime

import gspread
import requests
from google.oauth2.service_account import Credentials


SHEET_ID = os.environ.get("SHEET_ID", "").strip()
SHEET_WORKSHEET = os.environ.get(
    "SHEET_WORKSHEET",
    "Sheet1",
).strip()

TWEET_WEBHOOK_URL = os.environ.get(
    "TWEET_WEBHOOK_URL",
    "",
).strip()
TWEET_WEBHOOK_TOKEN = os.environ.get(
    "TWEET_WEBHOOK_TOKEN",
    "",
).strip()

ENABLE_TWEET = (
    os.environ.get(
        "ENABLE_TWEET",
        "1",
    ).strip()
    != "0"
)

SYNCED_MANIFEST_PATH = os.path.join(
    "content_pipeline",
    "synced_manifest.json",
)

STATUS_COL_NAME = "status"
DONE_STATUS = "DONE"
TWEET_PENDING_STATUS = "TWEET_PENDING"


def get_sheet_client():
    raw = os.environ.get(
        "GSERVICE_ACCOUNT_JSON",
        "",
    ).strip()

    if not raw:
        raise RuntimeError(
            "GSERVICE_ACCOUNT_JSON missing"
        )

    info = json.loads(raw)
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]

    creds = Credentials.from_service_account_info(
        info,
        scopes=scopes,
    )
    return gspread.authorize(creds)


def open_worksheet():
    if not SHEET_ID:
        raise RuntimeError("SHEET_ID missing")

    gc = get_sheet_client()
    return (
        gc.open_by_key(SHEET_ID)
        .worksheet(SHEET_WORKSHEET)
    )


def header_map(ws):
    headers = ws.row_values(1)
    mapping = {
        (value or "").strip(): idx + 1
        for idx, value in enumerate(headers)
        if (value or "").strip()
    }

    for required in (
        "slug",
        STATUS_COL_NAME,
    ):
        if required not in mapping:
            raise RuntimeError(
                f"Sheet column missing: {required}"
            )

    return headers, mapping


def find_row_by_slug(
    ws,
    mapping,
    slug,
):
    values = ws.col_values(
        mapping["slug"]
    )

    for row_no in range(
        2,
        len(values) + 1,
    ):
        if (
            values[row_no - 1]
            or ""
        ).strip() == slug:
            return row_no

    return None


def set_status(
    ws,
    mapping,
    slug,
    status,
):
    row_no = find_row_by_slug(
        ws,
        mapping,
        slug,
    )

    if not row_no:
        raise RuntimeError(
            f"Slug not found in sheet: {slug}"
        )

    ws.update_cell(
        row_no,
        mapping[STATUS_COL_NAME],
        status,
    )


def read_rows(ws):
    values = ws.get_all_values()
    if not values:
        return []

    headers = [
        (h or "").strip()
        for h in values[0]
    ]

    rows = []
    for row_no, cells in enumerate(
        values[1:],
        start=2,
    ):
        padded = list(cells) + [""] * max(
            0,
            len(headers) - len(cells),
        )
        row = {
            headers[i]: padded[i]
            for i in range(len(headers))
            if headers[i]
        }
        row["_row"] = row_no
        rows.append(row)

    return rows


def load_synced_manifest():
    if not os.path.exists(
        SYNCED_MANIFEST_PATH
    ):
        return {
            "version": 1,
            "results": [],
        }

    with open(
        SYNCED_MANIFEST_PATH,
        "r",
        encoding="utf-8",
    ) as f:
        return json.load(f)


def simple_tweet_text(
    title,
    slug,
):
    url = (
        f"https://ederapp.com/blog/{slug}"
    )
    title = (title or slug).strip()

    if len(title) > 220:
        title = (
            title[:220]
            .rsplit(" ", 1)[0]
            + "…"
        )

    text = f"{title}\n\n{url}"
    return text[:280]


def webhook_request(payload):
    if not (
        TWEET_WEBHOOK_URL
        and TWEET_WEBHOOK_TOKEN
    ):
        raise RuntimeError(
            "Tweet webhook env missing"
        )

    headers = {
        "Authorization": (
            f"Bearer {TWEET_WEBHOOK_TOKEN}"
        ),
        "Content-Type": "application/json",
        "User-Agent": (
            "EDERBlogAutomation/2.0 "
            "(+https://ederapp.com)"
        ),
    }

    response = requests.post(
        TWEET_WEBHOOK_URL,
        headers=headers,
        json=payload,
        timeout=45,
    )

    if response.status_code >= 400:
        snippet = (
            response.text
            or ""
        )[:500].replace("\n", " ")

        error = RuntimeError(
            "Webhook tweet failed: "
            f"{response.status_code} "
            f"{snippet}"
        )
        error.status_code = (
            response.status_code
        )
        raise error

    if not response.text:
        return {"ok": True}

    data = response.json()

    if data.get("ok") is False:
        raise RuntimeError(
            "Webhook returned ok=false: "
            + str(data)[:500]
        )

    return data


def tweet_with_retry(
    title,
    slug,
    tweet_text,
):
    payload = {
        "source": "blog-automation",
        "title": title,
        "slug": slug,
        "url": (
            f"https://ederapp.com/blog/{slug}"
        ),
        "tweet_text": (
            tweet_text
            or simple_tweet_text(
                title,
                slug,
            )
        )[:280],
        "idempotency_key": (
            f"blog:{slug}"
        ),
        "created_at": (
            datetime.utcnow().isoformat()
            + "Z"
        ),
    }

    delays = [0, 5, 15]

    for attempt, delay in enumerate(
        delays,
        start=1,
    ):
        if delay:
            time.sleep(delay)

        try:
            return webhook_request(payload)
        except Exception as exc:
            status = getattr(
                exc,
                "status_code",
                None,
            )

            retryable = (
                status is None
                or status == 429
                or (
                    isinstance(status, int)
                    and status >= 500
                )
            )

            if (
                not retryable
                or attempt == len(delays)
            ):
                raise

            print(
                "[warn] Tweet retry",
                f"slug={slug}",
                f"attempt={attempt}",
                str(exc)[:300],
            )

    raise RuntimeError(
        "Tweet retry loop exhausted"
    )


def finalize_item(
    ws,
    mapping,
    title,
    slug,
    tweet_text,
):
    # Critical ordering:
    # Sanity success -> TWEET_PENDING -> X -> DONE.
    # Never tweet if we cannot first persist retry state.
    set_status(
        ws,
        mapping,
        slug,
        TWEET_PENDING_STATUS,
    )

    if not ENABLE_TWEET:
        set_status(
            ws,
            mapping,
            slug,
            DONE_STATUS,
        )
        return {
            "ok": True,
            "tweet_skipped": True,
        }

    result = tweet_with_retry(
        title,
        slug,
        tweet_text,
    )

    set_status(
        ws,
        mapping,
        slug,
        DONE_STATUS,
    )

    return result


def main():
    ws = open_worksheet()
    _, mapping = header_map(ws)

    synced = load_synced_manifest()
    successful_syncs = [
        item
        for item in synced.get(
            "results",
            [],
        )
        if item.get("ok") is True
    ]

    attempted = set()
    failures = []
    completed = []

    # 1) Finalize newly published Sanity posts.
    for item in successful_syncs:
        slug = (
            item.get("slug")
            or ""
        ).strip()

        if not slug:
            continue

        title = (
            item.get("title")
            or slug
        ).strip()

        try:
            result = finalize_item(
                ws,
                mapping,
                title,
                slug,
                item.get("tweet_text"),
            )

            attempted.add(slug)
            completed.append(
                {
                    "slug": slug,
                    "tweet_id": (
                        result.get("tweet_id")
                        or result.get("id")
                    ),
                }
            )

            print(
                "Finalize PASS:",
                slug,
                "tweet_id=",
                result.get("tweet_id"),
            )

        except Exception as exc:
            attempted.add(slug)
            failures.append(
                {
                    "slug": slug,
                    "error": str(exc),
                }
            )
            # Status remains TWEET_PENDING
            # when the webhook fails.
            print(
                "[error] Finalize failed:",
                slug,
                str(exc)[:500],
            )

    # 2) Retry previously published rows whose tweet failed.
    # These do not depend on ephemeral Markdown files.
    for row in read_rows(ws):
        status = (
            row.get(STATUS_COL_NAME)
            or ""
        ).strip().upper()

        slug = (
            row.get("slug")
            or ""
        ).strip()

        if (
            status != TWEET_PENDING_STATUS
            or not slug
            or slug in attempted
        ):
            continue

        title = (
            row.get("title")
            or slug
        ).strip()

        try:
            result = finalize_item(
                ws,
                mapping,
                title,
                slug,
                simple_tweet_text(
                    title,
                    slug,
                ),
            )

            completed.append(
                {
                    "slug": slug,
                    "tweet_id": (
                        result.get("tweet_id")
                        or result.get("id")
                    ),
                    "retry": True,
                }
            )

            print(
                "Tweet pending retry PASS:",
                slug,
            )

        except Exception as exc:
            failures.append(
                {
                    "slug": slug,
                    "error": str(exc),
                    "retry": True,
                }
            )
            print(
                "[error] Tweet pending retry failed:",
                slug,
                str(exc)[:500],
            )

    summary = {
        "completed": completed,
        "failures": failures,
        "tweet_enabled": ENABLE_TWEET,
    }

    os.makedirs(
        "content_pipeline",
        exist_ok=True,
    )

    with open(
        os.path.join(
            "content_pipeline",
            "finalize_summary.json",
        ),
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            summary,
            f,
            ensure_ascii=False,
            indent=2,
        )

    print(
        "Finalize summary:",
        f"completed={len(completed)}",
        f"failures={len(failures)}",
    )

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const POSTS_DIR = path.resolve(process.cwd(), "src", "blog", "posts");
const RUN_MANIFEST = path.resolve(
  process.cwd(),
  "content_pipeline",
  "run_manifest.json"
);
const SYNCED_MANIFEST = path.resolve(
  process.cwd(),
  "content_pipeline",
  "synced_manifest.json"
);

function normalizeSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

function writeSyncedManifest(payload) {
  fs.mkdirSync(path.dirname(SYNCED_MANIFEST), { recursive: true });
  fs.writeFileSync(
    SYNCED_MANIFEST,
    JSON.stringify(payload, null, 2),
    "utf-8"
  );
}

function loadRunManifest() {
  if (!fs.existsSync(RUN_MANIFEST)) {
    return { version: 2, posts: [], errors: [] };
  }

  return JSON.parse(fs.readFileSync(RUN_MANIFEST, "utf-8"));
}

async function upsertPostFromFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);

  if (
    resolved !== POSTS_DIR &&
    !resolved.startsWith(POSTS_DIR + path.sep)
  ) {
    throw new Error(`Manifest path escapes POSTS_DIR: ${filePath}`);
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`Generated Markdown missing: ${filePath}`);
  }

  const raw = fs.readFileSync(resolved, "utf-8");
  const { data } = matter(raw);

  const title = data.title || path.basename(resolved, ".md");
  const slug = normalizeSlug(data.slug);
  const description = data.description || "";
  const canonical = data.canonical || "";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const publishedAt = data.date
    ? new Date(data.date).toISOString()
    : new Date().toISOString();

  if (!slug) {
    throw new Error(`Slug missing in frontmatter: ${filePath}`);
  }

  const doc = {
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    description,
    canonical,
    tags,
    publishedAt,
    markdown: raw,
  };

  const existing = await client.fetch(
    `*[_type=="post" && slug.current==$slug][0]{_id}`,
    { slug }
  );

  let documentId;

  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit();
    documentId = existing._id;
    console.log("Updated:", slug);
  } else {
    const created = await client.create(doc);
    documentId = created?._id;
    console.log("Created:", slug);
  }

  const verified = await client.fetch(
    `*[_type=="post" && slug.current==$slug][0]{_id, "slug": slug.current}`,
    { slug }
  );

  if (!verified?._id || verified.slug !== slug) {
    throw new Error(`Sanity verification failed for slug: ${slug}`);
  }

  return {
    documentId: verified._id || documentId,
    slug,
    title,
  };
}

async function main() {
  if (!process.env.SANITY_PROJECT_ID) {
    throw new Error("SANITY_PROJECT_ID missing");
  }

  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN missing");
  }

  const manifest = loadRunManifest();
  const posts = Array.isArray(manifest.posts) ? manifest.posts : [];

  if (posts.length === 0) {
    writeSyncedManifest({
      version: 1,
      generated_at: new Date().toISOString(),
      results: [],
    });
    console.log("No generated posts in run manifest.");
    return;
  }

  const results = [];
  let failures = 0;

  for (const post of posts) {
    try {
      const synced = await upsertPostFromFile(post.path);

      results.push({
        ...post,
        ok: true,
        sanity_document_id: synced.documentId,
      });
    } catch (error) {
      failures += 1;

      results.push({
        ...post,
        ok: false,
        error: String(error?.message || error),
      });

      console.error(
        "Sanity sync failed:",
        post.slug,
        error
      );
    }
  }

  writeSyncedManifest({
    version: 1,
    generated_at: new Date().toISOString(),
    results,
  });

  const successCount = results.filter((x) => x.ok).length;

  console.log(
    `Done. Sanity synced ${successCount}/${posts.length} generated posts.`
  );

  if (failures > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

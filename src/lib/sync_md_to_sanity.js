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

// MD’lerin olduğu klasör (senin örneğe göre)
const POSTS_DIR = path.resolve(process.cwd(), "src", "blog", "posts");


function normalizeSlug(slug) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/^\//, "")
    .replace(/\/$/, "");
}

async function upsertPostFromFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Frontmatter alanları
  const title = data.title || path.basename(filePath, ".md");
  const slug = normalizeSlug(data.slug);
  const description = data.description || "";
  const canonical = data.canonical || "";
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const publishedAt = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

  if (!slug) {
    throw new Error(`Slug missing in frontmatter: ${filePath}`);
  }

  // Sanity doc
  const doc = {
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    description,
    canonical,
    tags,
    publishedAt,
    markdown: raw,     // İstersen sadece content bas: content
  };

  // Aynı slug var mı?
  const existing = await client.fetch(
    `*[_type=="post" && slug.current==$slug][0]{_id}`,
    { slug }
  );

  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit();
    console.log("Updated:", slug);
  } else {
    await client.create(doc);
    console.log("Created:", slug);
  }
}

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(`POSTS_DIR not found: ${POSTS_DIR}`);
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  for (const f of files) {
    const full = path.join(POSTS_DIR, f);
    await upsertPostFromFile(full);
  }

  console.log(`Done. Synced ${files.length} posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

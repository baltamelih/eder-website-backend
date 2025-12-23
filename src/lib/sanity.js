import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  useCdn: false, // test aşamasında false yap (cache olmasın)
});

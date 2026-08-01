/**
 * Quick Supabase connectivity test.
 * Usage: set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, then:
 *   node scripts/test-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = [
  "store_listings",
  "catalog_bundle",
  "projects",
  "house_plans",
  "design_drafts",
  "cart_orders",
  "download_grants",
  "export_jobs",
  "translation_cache",
];

let failed = false;

for (const table of tables) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.error(`FAIL: ${table} -> ${error.message}`);
    failed = true;
  } else {
    console.log(`OK: ${table} (${count ?? 0} rows)`);
  }
}

if (failed) process.exit(1);
console.log("\nAll Supabase tables reachable.");

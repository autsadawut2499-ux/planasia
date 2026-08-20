/**
 * Regenerates `src/lib/geo/th-districts-by-province.json` from the standard
 * nationwide Thai geography dataset:
 *   https://github.com/kongvut/thai-province-data
 *
 * Source files (api/latest):
 *   - province.json  — all 77 provinces (จังหวัด)
 *   - district.json  — all amphoes / Bangkok khets (อำเภอ / เขต)
 *
 * Usage: node scripts/generate-th-districts.cjs
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const PROVINCE_URL =
  "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json";
const DISTRICT_URL =
  "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json";

function get(url) {
  return new Promise((res, rej) =>
    https
      .get(url, (r) => {
        if (r.statusCode && r.statusCode >= 400) {
          rej(new Error(`HTTP ${r.statusCode} for ${url}`));
          return;
        }
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => {
          try {
            res(JSON.parse(d));
          } catch (e) {
            rej(e);
          }
        });
      })
      .on("error", rej),
  );
}

(async () => {
  const [provinces, districts] = await Promise.all([
    get(PROVINCE_URL),
    get(DISTRICT_URL),
  ]);

  if (!Array.isArray(provinces) || provinces.length < 77) {
    throw new Error(
      `Expected >= 77 provinces from thai-province-data, got ${provinces?.length}`,
    );
  }
  if (!Array.isArray(districts) || districts.length < 900) {
    throw new Error(
      `Expected >= 900 districts from thai-province-data, got ${districts?.length}`,
    );
  }

  const src = fs.readFileSync("src/lib/geo/th-provinces.ts", "utf8");
  const ours = [
    ...src.matchAll(/\{\s*id:\s*"([^"]+)",\s*th:\s*"([^"]+)",\s*en:\s*"([^"]+)"/g),
  ].map((m) => ({ id: m[1], th: m[2], en: m[3] }));

  if (ours.length !== 77) {
    throw new Error(`TH_PROVINCES should have 77 entries, found ${ours.length}`);
  }

  const byTh = new Map(provinces.map((p) => [p.name_th, p]));
  const byEn = new Map(provinces.map((p) => [p.name_en.toLowerCase(), p]));

  const out = {};
  const missing = [];
  for (const o of ours) {
    const p = byTh.get(o.th) || byEn.get(o.en.toLowerCase());
    if (!p) {
      missing.push(o);
      out[o.id] = [];
      continue;
    }
    out[o.id] = districts
      .filter((d) => d.province_id === p.id && !d.deleted_at)
      .map((d) => ({
        // Official dataset district id (stable nationwide code)
        id: String(d.id),
        th: String(d.name_th).trim(),
        en: String(d.name_en).trim(),
      }))
      .sort((a, b) => a.th.localeCompare(b.th, "th"));
  }

  if (missing.length) {
    console.error("Unmatched provinces:", missing);
    process.exit(1);
  }

  const total = Object.values(out).reduce((n, a) => n + a.length, 0);
  const empty = Object.entries(out)
    .filter(([, a]) => a.length === 0)
    .map(([id]) => id);
  if (empty.length) {
    console.error("Provinces with zero districts:", empty);
    process.exit(1);
  }

  const dest = path.join("src/lib/geo/th-districts-by-province.json");
  fs.writeFileSync(dest, `${JSON.stringify(out)}\n`);
  console.log(
    JSON.stringify(
      {
        source: "kongvut/thai-province-data",
        wrote: dest,
        provinces: Object.keys(out).length,
        districts: total,
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

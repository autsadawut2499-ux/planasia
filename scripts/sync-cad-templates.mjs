#!/usr/bin/env node
/**
 * Scan templates/cad/ and regenerate index.json metadata.
 * Run: node scripts/sync-cad-templates.mjs
 * Source (optional): set CAD_SOURCE_ROOT env or edit DEFAULT_SOURCE below.
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "templates", "cad");
const INDEX_PATH = path.join(ROOT, "index.json");

const FILENAME_META = [
  { match: /AsBuiltงานสถาปัตย/i, id: "cad-airport-a", discipline: "A", category: "airport-asbuilt", tags: ["as-built", "khon-kaen-airport"] },
  { match: /AsBuiltงานโครงสร/i, id: "cad-airport-s", discipline: "S", category: "airport-asbuilt", tags: ["as-built", "khon-kaen-airport"] },
  { match: /AsBuiltงานระบบสุข/i, id: "cad-airport-sn", discipline: "SN", category: "airport-asbuilt", tags: ["as-built", "khon-kaen-airport"] },
  { match: /AsBuiltระบบไฟฟ/i, id: "cad-airport-e", discipline: "E", category: "airport-asbuilt", tags: ["as-built", "khon-kaen-airport"] },
  { match: /^Plan\.dwg$/i, id: "cad-res-plan", discipline: "A", category: "residential-set", sheetType: "floor-plan", tags: ["residential", "complete-set"] },
  { match: /^Lay-Out\.dwg$/i, id: "cad-res-site", discipline: "A", category: "residential-set", sheetType: "site-plan", tags: ["residential"] },
  { match: /^Elevation\.dwg$/i, id: "cad-res-elevation", discipline: "A", category: "residential-set", sheetType: "elevation", tags: ["residential"] },
  { match: /^Section\.dwg$/i, id: "cad-res-section", discipline: "A", category: "residential-set", sheetType: "section", tags: ["residential"] },
  { match: /Detail-Bacony/i, id: "cad-res-detail-balcony", discipline: "A", category: "residential-set", sheetType: "detail", tags: ["balcony"] },
  { match: /Detail-Stair/i, id: "cad-res-detail-stair", discipline: "A", category: "residential-set", sheetType: "detail", tags: ["stair"] },
  { match: /Detail-Wc/i, id: "cad-res-detail-wc", discipline: "A", category: "residential-set", sheetType: "detail", tags: ["bathroom"] },
  { match: /Detail-Door/i, id: "cad-res-detail-door", discipline: "A", category: "residential-set", sheetType: "detail", tags: ["door", "window"] },
  { match: /titleblockA3/i, id: "cad-res-titleblock", discipline: "A", category: "residential-set", sheetType: "title-block", tags: ["title-block", "a3"] },
  { match: /^Content\.dwg$/i, id: "cad-res-content", discipline: "A", category: "residential-set", sheetType: "content", tags: ["blocks"] },
  { match: /2ชั้น 4นอน3น้ำ/i, id: "cad-house-2f-4b3ba", floors: 2, bedrooms: 4, bathrooms: 3, category: "civil-residential", discipline: "A", tags: ["house", "2-storey"] },
  { match: /3ห้องนอน 1 ห้องน้ำ/i, id: "cad-house-3b1ba", floors: 1, bedrooms: 3, bathrooms: 1, category: "civil-residential", discipline: "A", tags: ["house"] },
  { match: /^5ชั้น/i, id: "cad-building-5f", floors: 5, category: "civil-commercial", discipline: "A", tags: ["multi-storey"] },
  { match: /^6metre/i, id: "cad-module-6m", category: "civil-infrastructure", discipline: "A", tags: ["module"] },
  { match: /Car park/i, id: "cad-carpark-2", category: "civil-infrastructure", discipline: "A", tags: ["parking"] },
  { match: /Guard house/i, id: "cad-guard-house", floors: 1, category: "civil-infrastructure", discipline: "A", tags: ["guard-house"] },
  { match: /^HOME006/i, id: "cad-home-006", category: "civil-residential", discipline: "A", tags: ["house"] },
  { match: /^HOME007/i, id: "cad-home-007", category: "civil-residential", discipline: "A", tags: ["house"] },
  { match: /^Pavilion/i, id: "cad-pavilion", category: "civil-infrastructure", discipline: "A", tags: ["pavilion"] },
  { match: /^TEMPLE/i, id: "cad-temple", category: "civil-religious", discipline: "A", tags: ["temple"] },
  { match: /ศาลาการเปรียญ/i, id: "cad-sermon-hall", category: "civil-religious", discipline: "A", tags: ["temple"] },
  { match: /ร้านอาหาร/i, id: "cad-restaurant", category: "civil-commercial", discipline: "A", tags: ["restaurant"] },
  { match: /โกดัง18x16/i, id: "cad-warehouse-18x16", category: "civil-industrial", discipline: "A", tags: ["warehouse"] },
  { match: /โกดัง และสำนักงาน/i, id: "cad-warehouse-office", category: "civil-industrial", discipline: "A", tags: ["warehouse", "office"] },
  { match: /^toilet/i, id: "cad-toilet-block", category: "civil-infrastructure", discipline: "SN", tags: ["sanitary", "toilet"] },
  { match: /suction-pumps/i, id: "cad-suction-pumps", category: "civil-mep", discipline: "SN", tags: ["pump", "sanitary"] },
  { match: /Sump-Pump/i, id: "cad-sump-pump", category: "civil-mep", discipline: "SN", tags: ["pump", "drainage"] },
  { match: /Fire Exit/i, id: "cad-fire-exit", category: "civil-infrastructure", discipline: "A", tags: ["fire-exit"] },
  { match: /^Symbols/i, id: "cad-symbols", category: "symbols", discipline: "A", tags: ["symbols", "legend"] },
  { match: /^Signboard/i, id: null, category: "symbols", discipline: "A", tags: ["signboard"] },
];

function inferMeta(filename, relPath) {
  const rel = relPath.replace(/\\/g, "/");
  const isGolden = rel.startsWith("smart-a-golden/");

  if (isGolden) {
    const goldenRules = [
      { match: /สารบัญ/i, id: "golden-index", discipline: "A", sheetType: "index", tags: ["golden-standard", "smart-a"] },
      { match: /^Lay out/i, id: "golden-site", discipline: "A", sheetType: "site-plan", tags: ["golden-standard"] },
      { match: /^Plan\.dwg$/i, id: "golden-plan", discipline: "A", sheetType: "floor-plan", tags: ["golden-standard"] },
      { match: /^Elevation/i, id: "golden-elevation", discipline: "A", sheetType: "elevation", tags: ["golden-standard"] },
      { match: /^Section/i, id: "golden-section", discipline: "A", sheetType: "section", tags: ["golden-standard"] },
      { match: /Detail wc/i, id: "golden-detail-wc", discipline: "A", sheetType: "detail", tags: ["golden-standard", "bathroom"] },
      { match: /Detail stair/i, id: "golden-detail-stair", discipline: "A", sheetType: "detail", tags: ["golden-standard", "stair"] },
      { match: /Detail door/i, id: "golden-detail-door", discipline: "A", sheetType: "detail", tags: ["golden-standard", "door"] },
      { match: /Detail fence/i, id: "golden-detail-fence", discipline: "A", sheetType: "detail", tags: ["golden-standard"] },
      { match: /Plan Structure/i, id: "golden-structure-plan", discipline: "S", sheetType: "structure-plan", tags: ["golden-standard", "type-e"] },
      { match: /Detail Structure/i, id: "golden-structure-detail", discipline: "S", sheetType: "detail", tags: ["golden-standard", "type-e"] },
      { match: /Footing&Column/i, id: "golden-footing", discipline: "S", sheetType: "detail", tags: ["golden-standard", "type-e"] },
      { match: /SN-01/i, id: "golden-sn-01", discipline: "SN", tags: ["golden-standard"] },
      { match: /^SN-04/i, id: "golden-sn-04", discipline: "SN", tags: ["golden-standard"] },
      { match: /^SN-05/i, id: "golden-sn-05", discipline: "SN", tags: ["golden-standard"] },
      { match: /^SN-06/i, id: "golden-sn-06", discipline: "SN", tags: ["golden-standard"] },
      { match: /^SN-07/i, id: "golden-sn-07", discipline: "SN", tags: ["golden-standard"] },
      { match: /SN-08/i, id: "golden-sn-rain", discipline: "SN", tags: ["golden-standard", "rainwater"] },
      { match: /^E-01/i, id: "golden-e-01", discipline: "E", tags: ["golden-standard"] },
      { match: /^e-02/i, id: "golden-e-02", discipline: "E", tags: ["golden-standard"] },
      { match: /e-03-06/i, id: "golden-e-sld", discipline: "E", sheetType: "single-line", tags: ["golden-standard"] },
      { match: /^E-07/i, id: "golden-e-07", discipline: "E", tags: ["golden-standard"] },
      { match: /^ME-00/i, id: "golden-me-00", discipline: "ME", tags: ["golden-standard", "mep"] },
      { match: /^ME-01/i, id: "golden-me-01", discipline: "ME", tags: ["golden-standard", "mep"] },
      { match: /^ME-02/i, id: "golden-me-02", discipline: "ME", tags: ["golden-standard", "mep"] },
      { match: /AC-01/i, id: "golden-ac-01", discipline: "AC", tags: ["golden-standard", "hvac"] },
      { match: /^AC-03/i, id: "golden-ac-03", discipline: "AC", tags: ["golden-standard", "hvac"] },
      { match: /^titleblockA3\.dwg$/i, id: "golden-titleblock", discipline: "A", sheetType: "title-block", tags: ["golden-standard", "a3"] },
    ];
    for (const rule of goldenRules) {
      if (rule.match.test(filename)) {
        return {
          id: rule.id,
          file: rel,
          category: "golden-standard",
          discipline: rule.discipline,
          forSale: false,
          tags: rule.tags,
          sheetType: rule.sheetType,
          goldenStandard: true,
        };
      }
    }
    return {
      id: `golden-${filename.replace(/\.dwg$/i, "").replace(/\s+/g, "-").toLowerCase()}`,
      file: rel,
      category: "golden-standard",
      discipline: "A",
      forSale: false,
      tags: ["golden-standard", "smart-a"],
      goldenStandard: true,
    };
  }

  for (const rule of FILENAME_META) {
    if (rule.match.test(filename)) {
      const entry = {
        id: rule.id ?? `cad-${filename.replace(/\.dwg$/i, "").replace(/\s+/g, "-").toLowerCase()}`,
        file: relPath.replace(/\\/g, "/"),
        category: rule.category,
        discipline: rule.discipline,
        forSale: false,
        tags: rule.tags ?? [],
      };
      if (rule.floors) entry.floors = rule.floors;
      if (rule.bedrooms) entry.bedrooms = rule.bedrooms;
      if (rule.bathrooms) entry.bathrooms = rule.bathrooms;
      if (rule.sheetType) entry.sheetType = rule.sheetType;
      return entry;
    }
  }
  return {
    id: `cad-${filename.replace(/\.dwg$/i, "").replace(/\s+/g, "-").toLowerCase()}`,
    file: relPath.replace(/\\/g, "/"),
    category: "civil-other",
    discipline: "A",
    forSale: false,
    tags: [],
  };
}

function walk(dir, base = "") {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (fs.statSync(full).isDirectory()) {
      entries.push(...walk(full, rel));
    } else if (name.toLowerCase().endsWith(".dwg")) {
      const stat = fs.statSync(full);
      entries.push({
        ...inferMeta(name, rel),
        sizeBytes: stat.size,
      });
    }
  }
  return entries;
}

if (!fs.existsSync(ROOT)) {
  console.error("templates/cad/ not found");
  process.exit(1);
}

const patterns = walk(ROOT);
const index = {
  purpose: "INTERNAL CAD REFERENCE ONLY — not for Store sale",
  disclaimer: {
    en: "Professional As-Built and sample DWG files for AI/CAD pattern learning. Never sold on Store.",
    th: "ไฟล์ DWG ตัวอย่างมาตรฐานสำหรับ AI เรียนรู้โครงสร้างและสัดส่วนแบบ ไม่ได้นำไปขายบนสโตร์",
  },
  usage: "reference-cad-pattern",
  storePolicy: "CAD reference files must never be listed as Store products.",
  source: "Smart A Golden Standard + Khon Kaen Airport As-Built + civil/residential sets",
  goldenStandard: "smart-a-golden",
  sheetSize: "A3",
  forSale: false,
  referencePatterns: patterns,
  disciplineSets: {
    goldenStandard: [
      "golden-index", "golden-site", "golden-plan", "golden-elevation", "golden-section",
      "golden-detail-wc", "golden-detail-stair", "golden-detail-door",
      "golden-structure-plan", "golden-structure-detail", "golden-footing",
      "golden-sn-01", "golden-sn-04", "golden-sn-05", "golden-sn-06", "golden-sn-07", "golden-sn-rain",
      "golden-e-01", "golden-e-02", "golden-e-sld", "golden-e-07",
      "golden-me-00", "golden-me-01", "golden-me-02",
      "golden-ac-01", "golden-ac-03", "golden-titleblock",
    ],
    airport: ["cad-airport-a", "cad-airport-s", "cad-airport-sn", "cad-airport-e"],
    residentialComplete: [
      "cad-res-site", "cad-res-plan", "cad-res-elevation", "cad-res-section",
      "cad-res-detail-balcony", "cad-res-detail-stair", "cad-res-detail-wc",
      "cad-res-detail-door", "cad-res-titleblock",
    ],
  },
};

fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
console.log(`Wrote ${patterns.length} CAD patterns to ${INDEX_PATH}`);

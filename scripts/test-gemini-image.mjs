/**
 * Minimal Gemini image-generation probe.
 * Usage: node scripts/test-gemini-image.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[name]) process.env[name] = value;
  }
}

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  console.error("FAIL: GEMINI_API_KEY not set");
  process.exit(1);
}

console.log(`Key prefix: ${key.slice(0, 6)}... (len ${key.length})`);

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
);
const data = await res.json();
if (!res.ok) {
  console.error(`FAIL: ListModels ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  process.exit(1);
}

const names = (data.models ?? [])
  .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
  .map((m) => String(m.name).replace(/^models\//, ""));

const imageish = names.filter((n) => /image|imagen/i.test(n));
console.log(`generateContent models: ${names.length}`);
console.log(`image-named models: ${imageish.length ? imageish.join(", ") : "(none)"}`);

const configured =
  process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
const candidates = [
  configured,
  ...imageish,
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
  "gemini-3-pro-image-preview",
  "gemini-2.0-flash-preview-image-generation",
].filter((n, i, arr) => n && arr.indexOf(n) === i);

const client = new GoogleGenerativeAI(key);
let success = null;

for (const name of candidates) {
  const present = names.includes(name);
  console.log(`\nTRY ${name} (listed=${present})`);
  try {
    const model = client.getGenerativeModel({
      model: name,
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });
    const result = await model.generateContent(
      "Generate a tiny simple flat icon of a red square on white. No text.",
    );
    const parts = result.response?.candidates?.[0]?.content?.parts ?? [];
    const hasImage = parts.some((p) => p.inlineData?.data);
    const textBits = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 120);
    if (hasImage) {
      console.log(`OK: image returned (model: ${name})`);
      success = name;
      break;
    }
    console.log(`FAIL ${name}: no inline image. text=${textBits || "(none)"}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`FAIL ${name}: ${msg.slice(0, 220)}`);
  }
}

if (!success) {
  console.error("\nFAIL: no working image model found for this key");
  process.exit(1);
}

if (!process.env.GEMINI_IMAGE_MODEL || process.env.GEMINI_IMAGE_MODEL !== success) {
  console.log(`\nTip: set GEMINI_IMAGE_MODEL=${success} in .env.local`);
}
process.exit(0);

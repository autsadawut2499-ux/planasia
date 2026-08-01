/**
 * Quick Gemini connectivity test.
 * Usage: npm run test:gemini
 * Loads GEMINI_API_KEY from .env.local if not already in process.env.
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

/** Discover models that support generateContent for this key. */
async function listGenerateModels() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`ListModels failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
  }
  return (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => String(m.name).replace(/^models\//, ""));
}

function pickTestModel(names) {
  const preferred = [
    process.env.GEMINI_TEXT_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
  ].filter(Boolean);
  for (const p of preferred) {
    if (names.includes(p)) return p;
  }
  return names.find((n) => n.includes("2.5-flash")) ?? names.find((n) => n.includes("flash")) ?? names[0];
}

try {
  const available = await listGenerateModels();
  console.log(`Available models: ${available.length}`);
  if (available.length === 0) {
    throw new Error("No generateContent models available for this API key");
  }

  const modelName = pickTestModel(available);
  console.log(`Trying models (preferred first: ${modelName})...`);

  const client = new GoogleGenerativeAI(key);
  const tryOrder = [modelName, ...available.filter((n) => n !== modelName)];
  let lastErr = null;

  for (const name of tryOrder) {
    try {
      const model = client.getGenerativeModel({ model: name });
      const result = await model.generateContent(
        'Reply with JSON only: {"ok":true,"message":"connected"}',
      );
      const text = result.response.text();
      console.log(`OK: Gemini responded (model: ${name})`);
      console.log(text.slice(0, 200));

      if (!process.env.GEMINI_TEXT_MODEL || process.env.GEMINI_TEXT_MODEL !== name) {
        console.log(`\nTip: set GEMINI_TEXT_MODEL=${name} in .env.local`);
      }
      process.exit(0);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL ${name}: ${msg.slice(0, 160)}`);
    }
  }

  throw lastErr ?? new Error("All models failed");
} catch (err) {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exit(1);
}

/**
 * Smoke-test Cloud Vision (API key preferred, else service account).
 * Usage: node scripts/test-vision-ocr.mjs [optional.pdf]
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import vision from "@google-cloud/vision";
import { PDFDocument, StandardFonts } from "pdf-lib";

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

const apiKey =
  process.env.GOOGLE_VISION_API_KEY?.trim() ||
  process.env.GOOGLE_CLOUD_VISION_API_KEY?.trim();

async function makeTinyPdf() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 200]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText("Planasia OCR smoke test", { x: 40, y: 120, size: 14, font });
  return Buffer.from(await doc.save());
}

async function ocrWithApiKey(pdfBytes) {
  const url = `https://vision.googleapis.com/v1/files:annotate?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          inputConfig: {
            content: pdfBytes.toString("base64"),
            mimeType: "application/pdf",
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          pages: [1],
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  const text =
    data.responses?.[0]?.responses?.[0]?.fullTextAnnotation?.text ||
    data.responses?.[0]?.responses?.[0]?.textAnnotations?.[0]?.description ||
    "";
  return { authMode: "api-key", text: String(text).trim() };
}

async function ocrWithServiceAccount(pdfBytes) {
  const keyPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    join(root, "service-account.json");
  if (!existsSync(keyPath)) throw new Error("No service account key");
  const sa = JSON.parse(readFileSync(keyPath, "utf8"));
  const client = new vision.ImageAnnotatorClient({
    projectId: sa.project_id,
    credentials: {
      client_email: sa.client_email,
      private_key: sa.private_key,
    },
  });
  const [response] = await client.batchAnnotateFiles({
    requests: [
      {
        inputConfig: { content: pdfBytes, mimeType: "application/pdf" },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
      },
    ],
  });
  const text =
    response.responses?.[0]?.responses?.[0]?.fullTextAnnotation?.text || "";
  return { authMode: "service-account", text: String(text).trim() };
}

const argPdf = process.argv[2];
const pdfBytes = argPdf
  ? readFileSync(argPdf)
  : await makeTinyPdf();

console.log("GOOGLE_VISION_OCR_ENABLED:", process.env.GOOGLE_VISION_OCR_ENABLED);
console.log("API key set:", Boolean(apiKey), apiKey ? `(…${apiKey.slice(-6)})` : "");
console.log("PDF bytes:", pdfBytes.length);

try {
  const result = apiKey
    ? await ocrWithApiKey(pdfBytes)
    : await ocrWithServiceAccount(pdfBytes);
  console.log("OK authMode=", result.authMode);
  console.log("OCR text sample:", (result.text || "(empty)").slice(0, 200));
  if (!result.text) {
    console.warn("WARN: empty OCR text (ok for blank/image-less test PDF)");
  }
  const out = join(root, "tmp", "vision-ocr-smoke.txt");
  writeFileSync(out, result.text || "(empty)", "utf8");
  console.log("wrote", out);
} catch (err) {
  console.error("FAIL:", err.message || err);
  process.exit(1);
}

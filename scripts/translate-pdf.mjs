/**
 * Test Cloud Translation Document Translation (Advanced v3) on a blueprint PDF.
 *
 * Prerequisites:
 *   1. Place service-account.json at the project root (gitignored).
 *   2. Enable Cloud Translation API on that GCP project.
 *   3. Grant the service account "Cloud Translation API User" (roles/cloudtranslate.user).
 *
 * Usage:
 *   npm run translate:pdf -- path/to/plan.pdf --target km
 *   npm run translate:pdf -- path/to/plan.pdf --target en --source th --out ./out/plan-en.pdf
 *   npm run translate:pdf -- path/to/plan.pdf --target km --location us-central1
 *
 * Env overrides:
 *   GOOGLE_APPLICATION_CREDENTIALS  — absolute path to key JSON (else ./service-account.json)
 *   GOOGLE_CLOUD_PROJECT            — override project_id from the key file
 *   TRANSLATE_LOCATION              — default us-central1 (Document Translation is regional)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, basename, extname, resolve, isAbsolute } from "path";
import { fileURLToPath } from "url";
import translate from "@google-cloud/translate";

const { TranslationServiceClient } = translate.v3;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_KEY = join(root, "service-account.json");

/** Load .env.local into process.env (does not override existing vars). */
function loadEnvLocal() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;
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

loadEnvLocal();

function usage(exitCode = 1) {
  console.log(`Usage:
  node scripts/translate-pdf.mjs <input.pdf> --target <lang> [options]

Options:
  --target, -t <code>     Target language (required), e.g. km, en, th, vi, id
  --source, -s <code>     Source language (optional; auto-detect if omitted)
  --out, -o <path>        Output PDF path (default: <input>.<target>.pdf next to input)
  --location <region>     GCP location (default: us-central1)
  --native-pdf            Set isTranslateNativePdfOnly=true (higher page limit for native PDFs)
  --credentials <path>    Service account JSON (default: ./service-account.json)
  --help, -h              Show this help
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = { positional: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      args.flags.help = true;
      continue;
    }
    if (a === "--native-pdf") {
      args.flags.nativePdf = true;
      continue;
    }
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = a.replace(/^--?/, "");
      const map = {
        t: "target",
        target: "target",
        s: "source",
        source: "source",
        o: "out",
        out: "out",
        location: "location",
        credentials: "credentials",
      };
      const name = map[key];
      if (!name) {
        console.error(`Unknown option: ${a}`);
        usage(1);
      }
      const value = argv[++i];
      if (!value || value.startsWith("-")) {
        console.error(`Missing value for ${a}`);
        usage(1);
      }
      args.flags[name] = value;
      continue;
    }
    args.positional.push(a);
  }
  return args;
}

function resolveKeyPath(cliPath) {
  if (cliPath) return isAbsolute(cliPath) ? cliPath : resolve(process.cwd(), cliPath);
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    return resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS.trim());
  }
  return DEFAULT_KEY;
}

function loadServiceAccount(keyPath) {
  if (!existsSync(keyPath)) {
    console.error(`FAIL: Service account key not found at:\n  ${keyPath}`);
    console.error(
      "Place service-account.json at the project root, or set GOOGLE_APPLICATION_CREDENTIALS / --credentials.",
    );
    process.exit(1);
  }
  let sa;
  try {
    sa = JSON.parse(readFileSync(keyPath, "utf8"));
  } catch (err) {
    console.error(`FAIL: Could not parse service account JSON: ${err.message}`);
    process.exit(1);
  }
  if (!sa.client_email || !sa.private_key) {
    console.error("FAIL: Key file is missing client_email / private_key (not a valid service account JSON).");
    process.exit(1);
  }
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    sa.project_id;
  if (!projectId) {
    console.error("FAIL: No project_id in key file; set GOOGLE_CLOUD_PROJECT.");
    process.exit(1);
  }
  return { sa, projectId, keyPath };
}

function defaultOutPath(inputPath, target) {
  const dir = dirname(inputPath);
  const base = basename(inputPath, extname(inputPath));
  return join(dir, `${base}.${target}.pdf`);
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (flags.help) usage(0);

  const inputArg = positional[0];
  const target = flags.target;
  if (!inputArg || !target) {
    console.error("FAIL: <input.pdf> and --target are required.\n");
    usage(1);
  }

  const inputPath = isAbsolute(inputArg) ? inputArg : resolve(process.cwd(), inputArg);
  if (!existsSync(inputPath)) {
    console.error(`FAIL: Input PDF not found: ${inputPath}`);
    process.exit(1);
  }
  if (!/\.pdf$/i.test(inputPath)) {
    console.warn("WARN: Input does not end with .pdf — continuing with mimeType application/pdf.");
  }

  const keyPath = resolveKeyPath(flags.credentials);
  const { projectId, keyPath: resolvedKey } = loadServiceAccount(keyPath);
  const location = flags.location || process.env.TRANSLATE_LOCATION?.trim() || "us-central1";
  const outPath = flags.out
    ? isAbsolute(flags.out)
      ? flags.out
      : resolve(process.cwd(), flags.out)
    : defaultOutPath(inputPath, target);

  process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedKey;

  const pdfBytes = readFileSync(inputPath);
  const sizeMb = (pdfBytes.length / (1024 * 1024)).toFixed(2);
  console.log("Cloud Translation — Document Translation (v3)");
  console.log(`  credentials : ${resolvedKey}`);
  console.log(`  project     : ${projectId}`);
  console.log(`  location    : ${location}`);
  console.log(`  input       : ${inputPath} (${sizeMb} MB)`);
  console.log(`  source      : ${flags.source || "(auto-detect)"}`);
  console.log(`  target      : ${target}`);
  console.log(`  output      : ${outPath}`);
  if (flags.nativePdf) console.log("  native PDF  : isTranslateNativePdfOnly=true");

  const client = new TranslationServiceClient({
    keyFilename: resolvedKey,
    projectId,
  });

  const parent = `projects/${projectId}/locations/${location}`;
  const request = {
    parent,
    targetLanguageCode: target,
    documentInputConfig: {
      content: pdfBytes,
      mimeType: "application/pdf",
    },
  };
  if (flags.source) request.sourceLanguageCode = flags.source;
  if (flags.nativePdf) request.isTranslateNativePdfOnly = true;

  const started = Date.now();
  console.log("\nCalling translateDocument...");

  let response;
  try {
    [response] = await client.translateDocument(request);
  } catch (err) {
    console.error("\nFAIL: translateDocument error");
    console.error(`  ${err.message || err}`);
    if (err.code) console.error(`  code: ${err.code}`);
    if (String(err.message || "").includes("global")) {
      console.error("Hint: Document Translation is regional — use --location us-central1 (not global).");
    }
    if (String(err.message || "").includes("PERMISSION_DENIED") || err.code === 7) {
      console.error(
        "Hint: Enable Cloud Translation API and grant roles/cloudtranslate.user to the service account.",
      );
    }
    process.exit(1);
  }

  const outputs = response.documentTranslation?.byteStreamOutputs;
  if (!outputs?.length) {
    console.error("FAIL: Response had no byteStreamOutputs. Full response:");
    console.error(JSON.stringify(response, null, 2).slice(0, 2000));
    process.exit(1);
  }

  const translated = Buffer.isBuffer(outputs[0]) ? outputs[0] : Buffer.from(outputs[0]);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, translated);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log("\nOK");
  console.log(`  wrote        : ${outPath} (${(translated.length / 1024).toFixed(1)} KB)`);
  console.log(`  mime         : ${response.documentTranslation?.mimeType || "application/pdf"}`);
  if (response.documentTranslation?.detectedLanguageCode) {
    console.log(`  detected src : ${response.documentTranslation.detectedLanguageCode}`);
  }
  if (response.model) console.log(`  model        : ${response.model}`);
  console.log(`  elapsed      : ${elapsed}s`);
  console.log(
    "\nOpen the output PDF and check whether dimension strings / CAD labels translated without wrecking linework.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

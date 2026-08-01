/**
 * Resolve Google Cloud service-account credentials for server-side APIs
 * (Cloud Translation Document Translation, etc.).
 *
 * Priority:
 *  1. GOOGLE_SERVICE_ACCOUNT_JSON — full JSON string (preferred on Vercel)
 *  2. GOOGLE_APPLICATION_CREDENTIALS — filesystem path to key JSON
 *  3. ./service-account.json at the project root (local dev)
 */

import "server-only";

import { existsSync, readFileSync } from "fs";
import { join } from "path";

export type GoogleServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
  [key: string]: unknown;
};

export type ResolvedGoogleCloudAuth = {
  projectId: string;
  credentials: GoogleServiceAccountCredentials;
  /** Absolute key path when loaded from disk (for logging / ADC). */
  keyFilename?: string;
  source: "env-json" | "env-path" | "project-root";
};

function parseServiceAccountJson(raw: string, label: string): GoogleServiceAccountCredentials {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid ${label}: not valid JSON`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid ${label}: expected a JSON object`);
  }
  const sa = parsed as GoogleServiceAccountCredentials;
  if (!sa.client_email || !sa.private_key) {
    throw new Error(`Invalid ${label}: missing client_email / private_key`);
  }
  return sa;
}

function projectRootKeyPath(): string {
  return join(process.cwd(), "service-account.json");
}

/** True when Document Translation credentials are available. */
export function isGoogleCloudAuthConfigured(): boolean {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()) return true;
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (path && existsSync(path)) return true;
  return existsSync(projectRootKeyPath());
}

/**
 * Load credentials + project id. Throws a clear error when misconfigured.
 */
export function resolveGoogleCloudAuth(): ResolvedGoogleCloudAuth {
  const envJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (envJson) {
    const credentials = parseServiceAccountJson(envJson, "GOOGLE_SERVICE_ACCOUNT_JSON");
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
      process.env.GCLOUD_PROJECT?.trim() ||
      credentials.project_id;
    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT is required when project_id is missing from the key JSON");
    }
    return { projectId, credentials, source: "env-json" };
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const keyFilename = envPath && existsSync(envPath) ? envPath : projectRootKeyPath();
  if (!existsSync(keyFilename)) {
    throw new Error(
      "Google Cloud credentials not found. Set GOOGLE_SERVICE_ACCOUNT_JSON, or GOOGLE_APPLICATION_CREDENTIALS, or place service-account.json at the project root.",
    );
  }

  const credentials = parseServiceAccountJson(
    readFileSync(keyFilename, "utf8"),
    keyFilename,
  );
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    credentials.project_id;
  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT is required when project_id is missing from the key JSON");
  }

  return {
    projectId,
    credentials,
    keyFilename,
    source: envPath && existsSync(envPath) ? "env-path" : "project-root",
  };
}

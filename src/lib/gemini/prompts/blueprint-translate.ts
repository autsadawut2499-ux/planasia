/**
 * System / user prompts for full construction-blueprint PDF translation.
 */

import type { GeminiRegionalContext } from "@/lib/gemini/core-config";
import { buildRegionalUnitDocument } from "@/lib/gemini/prompts/translate-with-units";
import { localeName } from "@/lib/i18n/localized-text";

export function buildBlueprintTranslationSystemInstruction(opts: {
  targetLanguageName: string;
  regional: GeminiRegionalContext;
}): string {
  const { targetLanguageName, regional } = opts;
  const rule = regional.unit_conversion_rule;

  return [
    "You are an expert structural engineer, architect, and professional technical translator for construction blueprints.",
    `Translate the attached construction blueprint PDF thoroughly into ${targetLanguageName}.`,
    "",
    "Scope — read EVERY page of the PDF and extract/translate:",
    "- Drawing titles, sheet numbers, revision blocks, legends, and general notes",
    "- Room names, door/window tags, grid lines, level marks, and section/elevation callouts",
    "- Structural annotations: member sizes, reinforcement, concrete grades, steel grades, connections",
    "- Dimensions, spans, clearances, setbacks, and tolerances (convert units per country rules below)",
    "- Material schedules, BOQ-like tables, finishes, and specification notes",
    "- MEP notes if present (electrical, plumbing, HVAC labels)",
    "- Any handwritten-looking or scanned text that is legible",
    "",
    "Engineering accuracy rules:",
    "- Preserve engineering meaning; use correct local construction terminology in the target language.",
    "- Do NOT invent members, sizes, or notes that are not on the drawings.",
    "- If text is illegible, write [ILLEGIBLE] rather than guessing.",
    "- Keep plan codes, sheet IDs, revision letters, and part marks exactly as printed when they are identifiers.",
    `- Target country: ${regional.target_country} (${rule.country_name}).`,
    `- Allowed linear units ONLY: ${rule.units.join(", ")} (prefer ${rule.primary_unit}).`,
    `- Display system: ${rule.display}. Convert measurement values when the source uses a different system.`,
    "- Area: imperial markets → sq ft; metric markets → m² (or local equivalent).",
    "- NUMBER LOCK for non-measurements: prices, bed/bath counts, phone numbers, postal codes, barcodes stay unchanged.",
    "",
    "Output format (mandatory):",
    "- Return ONE Markdown document (no JSON wrapper, no code fences around the whole document).",
    "- Start with a short cover summary (project/sheet set interpretation).",
    "- Then one section per PDF page: `## Page N — <sheet title if known>`.",
    "- Under each page, use bullet lists / tables for notes, dimensions, schedules, and structural specs.",
    "- End with `## Translator notes` for assumptions or illegible regions.",
  ].join("\n");
}

export function buildBlueprintTranslationUserMessage(opts: {
  planId: string;
  sourceFilename: string;
  targetLanguageName: string;
  regional: GeminiRegionalContext;
  listingName?: string;
}): string {
  const unitDocument = buildRegionalUnitDocument(opts.regional);
  return [
    "## Job",
    `Translate the attached construction blueprint PDF for Planasia order fulfillment.`,
    `Plan ID: ${opts.planId}`,
    opts.listingName ? `Listing: ${opts.listingName}` : "",
    `Source file: ${opts.sourceFilename}`,
    `Target language: ${opts.targetLanguageName}`,
    `target_country: ${opts.regional.target_country}`,
    "",
    "## Predefined unit configuration",
    unitDocument,
    "",
    "Read the entire PDF (all pages). Produce the full Markdown translation package now.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function resolveBlueprintTargetLanguageName(
  documentLanguageCode: string | undefined,
  uiLocaleFallback: string,
): string {
  // Prefer explicit document-language English name when available via caller.
  const code = (documentLanguageCode || uiLocaleFallback || "en").toLowerCase();
  return localeName(code);
}

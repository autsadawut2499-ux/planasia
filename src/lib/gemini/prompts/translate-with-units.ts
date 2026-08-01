/**
 * System prompt + regional unit document for Gemini translate requests.
 */

import type { UiLocale } from "@/lib/geo/countries";
import type { GeminiRegionalContext } from "@/lib/gemini/core-config";
import { localeName, aiRespondInLocale } from "@/lib/i18n/localized-text";

/** Predefined configuration document attached to every translate+units request. */
export function buildRegionalUnitDocument(context: GeminiRegionalContext): string {
  const rule = context.unit_conversion_rule;
  return [
    "### Predefined regional unit configuration (authoritative)",
    `target_country: ${context.target_country}`,
    `country_name: ${rule.country_name}`,
    `unit_conversion_rule.id: ${rule.id}`,
    `unit_conversion_rule.display: ${rule.display}`,
    `unit_conversion_rule.canonical_storage: ${rule.canonical} (metres / m² internally)`,
    `allowed_linear_units: ${JSON.stringify(rule.units)}`,
    `primary_unit: ${rule.primary_unit}`,
    "",
    "Only these linear units may appear in the translated output for measurements.",
    "Do not introduce yards, centimetres, metres, feet, inches, or millimetres unless they appear in allowed_linear_units.",
  ].join("\n");
}

/**
 * Full user prompt sent to Gemini with the regional document.
 * Core instruction (product): translate + strictly convert units for target country.
 */
export function buildTranslateWithUnitsPrompt(params: {
  context: GeminiRegionalContext;
  texts: string[];
  targetLocale: UiLocale;
  sourceLocale?: UiLocale;
}): string {
  const { context, texts, targetLocale, sourceLocale } = params;
  const target = localeName(targetLocale);
  const source = sourceLocale ? localeName(sourceLocale) : "auto-detect";
  const document = buildRegionalUnitDocument(context);

  return `You are a professional architectural and real-estate translator for an Asian house-plan marketplace.

${aiRespondInLocale(targetLocale)}

## Task
Translate the text and strictly convert all measurement units to match the specific units designated for the target country according to our predefined configuration.

## Document (must obey)
${document}

## Languages
- Source language hint: ${source}
- Target language: ${target}

## Rules
1. Translate each string into fluent ${target}.
2. STRICT UNIT CONVERSION: every length / width / height / depth / thickness / clearance measurement must use ONLY the allowed_linear_units for ${context.target_country} (${context.unit_conversion_rule.country_name}). Prefer primary_unit (${context.unit_conversion_rule.primary_unit}) unless another allowed unit is clearly more precise (e.g. detail dimensions).
3. When converting systems (metric ↔ imperial), recalculate the numeric value correctly. Example: 3 m → equivalent feet/inches if feet/inches are designated; 10 ft → metres/millimetres if those are designated.
4. Area: if the target uses imperial linear units, express area in square feet (sq ft); if metric linear units, use square metres (m² / ตร.ม. as appropriate for ${target}).
5. NUMBER LOCK for non-measurements: do not change prices, currency amounts, bedroom/bathroom/floor counts, plan codes, SKUs, phone numbers, or postal codes.
6. Do not invent units outside the predefined configuration.
7. If a string has no measurements, translate language only.
8. If already fluent ${target} and units already match the configuration, return it unchanged (aside from fixing wrong units).

## Input
JSON array of ${texts.length} strings:
${JSON.stringify(texts)}

## Output
Return ONLY a JSON array of exactly ${texts.length} translated strings in the same order. No markdown, no commentary.`;
}

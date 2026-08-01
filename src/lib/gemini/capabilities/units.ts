/**
 * Unit conversion capability for storefront / drawings.
 *
 * Canonical values stay metric. Display follows the coupled
 * `context.unit_conversion_rule` (never a free-floating unitSystem arg).
 *
 * Structure only — full wiring lands on the next instruction.
 */

import type { GeminiUnitConvertRequest, GeminiUnitConvertResult } from "@/lib/gemini/types";
import {
  displayUnitSystemOf,
  isGeminiRegionalContext,
} from "@/lib/gemini/core-config";
import { formatArea, formatDimension } from "@/lib/units/format";

export function isUnitConversionReady(): boolean {
  return true;
}

/**
 * Planned entry point for locale-aware unit display (+ future AI assist).
 * TODO(next): batch convert listing specs, PDF labels, checkout preview.
 */
export async function convertUnitsWithGeminiCapability(
  request: GeminiUnitConvertRequest,
): Promise<GeminiUnitConvertResult> {
  if (!isGeminiRegionalContext(request.context)) {
    throw new Error(
      "[gemini] units require coupled context { target_country, unit_conversion_rule }",
    );
  }

  const unitSystem = displayUnitSystemOf(request.context);
  const locale = request.locale === "th" ? "th" : "en";

  const values = request.values.map((item) => {
    const display =
      item.kind === "area"
        ? formatArea(item.metricValue, { unitSystem, locale })
        : formatDimension(item.metricValue, { unitSystem, locale });
    return {
      id: item.id,
      kind: item.kind,
      metricValue: item.metricValue,
      display,
    };
  });

  return {
    values,
    context: request.context,
    unitSystem,
    mode: "pure",
  };
}

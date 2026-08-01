/**
 * Core Gemini execution config.
 *
 * From now on, `target_country` and `unit_conversion_rule` are always coupled
 * and must travel together as one payload in the same execution context.
 *
 * Country → units table: {@link GEMINI_COUNTRY_UNIT_MAP}.
 */

import { getCountryByCode, type Locale, type UnitSystem } from "@/lib/geo/countries";
import {
  GEMINI_COUNTRY_UNIT_MAP,
  getCountryUnitProfile,
  isGeminiMarketCountryCode,
  isImperialUnitList,
  type CountryUnitProfile,
  type GeminiMarketCountryCode,
  type MarketUnitLabel,
} from "@/lib/gemini/regional-units";

/** ISO country code from the Gemini market table (falls back to TH). */
export type TargetCountryCode = GeminiMarketCountryCode | string;

export type UnitConversionRuleId = "metric" | "imperial" | "metric_mm";

export interface UnitConversionRule {
  id: UnitConversionRuleId;
  /** Canonical storage / drawing geometry unit basis (always metric metres). */
  canonical: "metric";
  /** Coarse display system for existing formatters. */
  display: UnitSystem;
  /** Thai country label from the market table. */
  country_name: string;
  /** Allowed linear units for this market (Thai labels). */
  units: readonly MarketUnitLabel[];
  /** Preferred primary linear unit (first entry in `units`). */
  primary_unit: MarketUnitLabel;
}

/**
 * Coupled regional payload — never split these fields across call sites.
 * Pass this object (or embed it on every Gemini request) as a single argument.
 */
export interface GeminiRegionalContext {
  target_country: GeminiMarketCountryCode;
  unit_conversion_rule: UnitConversionRule;
}

/** Full execution context for one Gemini turn / capability call. */
export interface GeminiExecutionContext extends GeminiRegionalContext {
  /** Optional content locale override; otherwise derived from country defaults. */
  content_locale?: Locale;
}

function ruleIdForUnits(units: readonly MarketUnitLabel[]): UnitConversionRuleId {
  if (isImperialUnitList(units)) return "imperial";
  if (units.length === 1 && units[0] === "มิลลิเมตร") return "metric_mm";
  return "metric";
}

export function unitRuleFromProfile(
  profile: CountryUnitProfile & { code: GeminiMarketCountryCode },
): UnitConversionRule {
  const units = profile.units as readonly MarketUnitLabel[];
  const id = ruleIdForUnits(units);
  return {
    id,
    canonical: "metric",
    display: id === "imperial" ? "imperial" : "metric",
    country_name: profile.country,
    units,
    primary_unit: units[0] ?? "เมตร",
  };
}

/** @deprecated Prefer {@link createGeminiRegionalContext} — keeps country+rule coupled. */
export function unitRuleFromSystem(system: UnitSystem): UnitConversionRule {
  if (system === "imperial") {
    return unitRuleFromProfile({
      code: "IN",
      country: GEMINI_COUNTRY_UNIT_MAP.IN.country,
      units: GEMINI_COUNTRY_UNIT_MAP.IN.units,
    });
  }
  return unitRuleFromProfile({
    code: "TH",
    country: GEMINI_COUNTRY_UNIT_MAP.TH.country,
    units: GEMINI_COUNTRY_UNIT_MAP.TH.units,
  });
}

/**
 * Build the coupled country + unit-rule payload for a single execution context.
 * Units always come from {@link GEMINI_COUNTRY_UNIT_MAP} for that country.
 */
export function createGeminiRegionalContext(
  targetCountry: TargetCountryCode,
  /**
   * Optional override of the coarse display system only.
   * Does not invent units outside the country's allowed list — if override
   * conflicts with the market table, the table wins for `units` labels and
   * the override only flips `display` when the country already supports it.
   */
  unitOverride?: UnitSystem | UnitConversionRuleId | null,
): GeminiRegionalContext {
  const profile = getCountryUnitProfile(targetCountry || "TH");
  let rule = unitRuleFromProfile(profile);

  if (unitOverride === "imperial" || unitOverride === "metric") {
    // Only honor override when the market table already uses that family.
    const tableIsImperial = rule.id === "imperial";
    const wantImperial = unitOverride === "imperial";
    if (tableIsImperial === wantImperial) {
      rule = { ...rule, display: unitOverride };
    }
  }

  return {
    target_country: profile.code,
    unit_conversion_rule: rule,
  };
}

export function createGeminiExecutionContext(
  targetCountry: TargetCountryCode,
  options?: {
    unitOverride?: UnitSystem | UnitConversionRuleId | null;
    content_locale?: Locale;
  },
): GeminiExecutionContext {
  const regional = createGeminiRegionalContext(targetCountry, options?.unitOverride);
  const country = getCountryByCode(regional.target_country);
  return {
    ...regional,
    content_locale: options?.content_locale ?? country.defaultLocale,
  };
}

/** Type guard — both halves of the couple must be present and table-backed. */
export function isGeminiRegionalContext(value: unknown): value is GeminiRegionalContext {
  if (!value || typeof value !== "object") return false;
  const v = value as GeminiRegionalContext;
  if (!isGeminiMarketCountryCode(v.target_country)) return false;
  const rule = v.unit_conversion_rule;
  if (!rule || rule.canonical !== "metric") return false;
  if (rule.display !== "metric" && rule.display !== "imperial") return false;
  if (!Array.isArray(rule.units) || rule.units.length === 0) return false;
  if (typeof rule.country_name !== "string" || !rule.country_name) return false;
  if (typeof rule.primary_unit !== "string" || !rule.primary_unit) return false;
  return true;
}

/** Convenience: pull display UnitSystem from a coupled context. */
export function displayUnitSystemOf(ctx: GeminiRegionalContext): UnitSystem {
  return ctx.unit_conversion_rule.display;
}

/** List every coupled payload from the market table (for admin / docs). */
export function listGeminiRegionalContexts(): GeminiRegionalContext[] {
  return (Object.keys(GEMINI_COUNTRY_UNIT_MAP) as GeminiMarketCountryCode[]).map((code) =>
    createGeminiRegionalContext(code),
  );
}

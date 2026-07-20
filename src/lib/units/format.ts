import type { UnitSystem } from "@/lib/geo/countries";
import { getCountryByCode } from "@/lib/geo/countries";

/** Canonical geometry stays in meters — only display strings convert. */
export const METERS_TO_FEET = 3.280839895;
export const SQM_TO_SQFT = 10.7639104167;

export interface UnitFormatOptions {
  unitSystem: UnitSystem;
  /** Metric decimal places for linear dims (default 1 for drawings, 2 for tables). */
  metricDecimals?: number;
}

function metricDecimals(opts: UnitFormatOptions): number {
  return opts.metricDecimals ?? 1;
}

/** Linear dimension label — geometry unchanged. */
export function formatDimension(valueMeters: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    const d = metricDecimals(opts);
    return `${valueMeters.toFixed(d)} m`;
  }
  const feet = valueMeters * METERS_TO_FEET;
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  const adjFeet = inches === 12 ? wholeFeet + 1 : wholeFeet;
  const adjInches = inches === 12 ? 0 : inches;
  return `${adjFeet}'-${adjInches}"`;
}

/** Area label — geometry unchanged. */
export function formatArea(valueSqM: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    return `${valueSqM.toFixed(1)} m²`;
  }
  return `${(valueSqM * SQM_TO_SQFT).toFixed(0)} sq ft`;
}

/** Room width × depth for plan labels. */
export function formatRoomSize(widthM: number, depthM: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    const d = metricDecimals(opts);
    return `${widthM.toFixed(d)}×${depthM.toFixed(d)} m`;
  }
  const w = formatDimension(widthM, opts);
  const dep = formatDimension(depthM, opts);
  return `${w} × ${dep}`;
}

/** Plot / building footprint pair. */
export function formatSizePair(widthM: number, depthM: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    const d = metricDecimals(opts);
    return `${widthM.toFixed(d)}×${depthM.toFixed(d)} m`;
  }
  return `${formatDimension(widthM, opts)} × ${formatDimension(depthM, opts)}`;
}

/** Compact setback label (single value). */
export function formatSetback(valueM: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    return `${valueM}m`;
  }
  return formatDimension(valueM, opts);
}

/** Elevation / height above datum. */
export function formatElevation(valueM: number, opts: UnitFormatOptions): string {
  if (opts.unitSystem === "metric") {
    return `${valueM.toFixed(2)} m`;
  }
  return formatDimension(valueM, { ...opts, metricDecimals: 2 });
}

/** Structural span in meters (size in mm stays metric for engineering). */
export function formatSpan(valueM: number, opts: UnitFormatOptions): string {
  return formatDimension(valueM, opts);
}

/** DXF: keep model space in meters so polyline alignment is stable. */
export const DXF_INSUNITS_METERS = 6;

/** DXF text height in model units (meters) — independent of display unit. */
export const DXF_LABEL_TEXT_HEIGHT = 0.3;

/** Room label for DXF TEXT entity — coords unchanged, text only. */
export function dxfRoomLabel(roomName: string, widthM: number, depthM: number, opts: UnitFormatOptions): string {
  return `${roomName} (${formatRoomSize(widthM, depthM, { ...opts, metricDecimals: 1 })})`;
}

/** PDF font sizes are screen points — not scaled with unit system. */
export const PDF_LABEL_SIZE = 7;
export const PDF_NOTE_SIZE = 8;
export const PDF_BODY_SIZE = 9;

export function resolveUnitSystem(
  explicit?: UnitSystem | null,
  countryCode?: string | null,
): UnitSystem {
  if (explicit === "metric" || explicit === "imperial") return explicit;
  if (countryCode) {
    return getCountryByCode(countryCode).unitSystem;
  }
  return "metric";
}

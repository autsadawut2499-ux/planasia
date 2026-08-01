import type { PlanFilterSpec } from "@/lib/seo/programmatic";

/**
 * Dynamic URL Matrix parser — the "landing-page factory".
 *
 * Turns an arbitrary keyword slug into structured filters so a single
 * /plans/[slug] route can serve tens of thousands of long-tail combinations
 * without hand-authoring each page, e.g.:
 *   /plans/modern-2-stories-width-10m-budget-2m
 *   /plans/tropical-single-storey-3-beds
 *   /plans/baan-na-khaeb-8-metre        (Thai preset style also parses)
 *
 * Returns null when nothing recognisable is found (→ 404), which prevents
 * junk/thin pages from being indexed.
 */

export const KNOWN_STYLES = [
  "modern",
  "tropical",
  "minimal",
  "contemporary",
  "loft",
  "nordic",
  "classic",
  "muji",
] as const;

const STYLE_LABEL_TH: Record<string, string> = {
  modern: "โมเดิร์น",
  tropical: "ทรอปิคอล",
  minimal: "มินิมอล",
  contemporary: "คอนเทมโพรารี",
  loft: "ลอฟท์",
  nordic: "นอร์ดิก",
  classic: "คลาสสิก",
  muji: "มูจิ",
};

export interface MatrixVariables {
  style?: string;
  floors?: number;
  widthMeters?: number;
  beds?: number;
  baths?: number;
  budgetMax?: number;
  budgetLabel?: string;
}

export interface ParsedMatrix {
  filter: PlanFilterSpec & { beds?: number; baths?: number };
  variables: MatrixVariables;
}

/** Parse "2m" / "1.5m" / "800k" / "2lan" → THB number. */
function parseBudget(token: string): number | null {
  const m = token.match(/^(\d+(?:\.\d+)?)(m|k|lan|l)$/i);
  if (!m) return null;
  const value = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit === "m") return value * 1_000_000;
  if (unit === "k") return value * 1_000;
  if (unit === "lan" || unit === "l") return value * 1_000_000; // ล้าน
  return null;
}

export function parsePlanSlug(slug: string): ParsedMatrix | null {
  const raw = slug.toLowerCase();
  const tokens = raw.split("-").filter(Boolean);
  const vars: MatrixVariables = {};

  // Style: first known style token anywhere in the slug.
  for (const token of tokens) {
    if ((KNOWN_STYLES as readonly string[]).includes(token)) {
      vars.style = token;
      break;
    }
  }

  // Floors: "single-storey", "1-storey", "2-stories", "song-chan", "chan-diao".
  if (/(?:^|-)(single|1)-store(?:y|ys|ies)?(?:-|$)/.test(raw) || /chan-diao/.test(raw)) {
    vars.floors = 1;
  } else if (/(?:^|-)(\d+)-store(?:y|ys|ies)?(?:-|$)/.test(raw)) {
    vars.floors = Number(RegExp.$1);
  } else if (/song-chan/.test(raw)) {
    vars.floors = 2;
  }

  // Width / frontage: "width-10m", "10m-width", "na-khaeb-8-metre".
  const widthMatch =
    raw.match(/width-(\d+(?:\.\d+)?)m(?:-|$)/) ||
    raw.match(/(?:^|-)(\d+(?:\.\d+)?)m-width/) ||
    raw.match(/na-khaeb-(\d+)-metre/);
  if (widthMatch) vars.widthMeters = Number(widthMatch[1]);

  // Bedrooms / bathrooms: "3-beds", "3-bedroom", "2-baths".
  const bedMatch = raw.match(/(\d+)-(?:beds?|bedrooms?)/);
  if (bedMatch) vars.beds = Number(bedMatch[1]);
  const bathMatch = raw.match(/(\d+)-(?:baths?|bathrooms?)/);
  if (bathMatch) vars.baths = Number(bathMatch[1]);

  // Budget: "budget-2m", "ngop-1-lan", "under-2m".
  const budgetTokenIdx = tokens.findIndex((t) => t === "budget" || t === "under" || t === "ngop");
  if (budgetTokenIdx >= 0) {
    // ngop-1-lan (number then unit as separate tokens)
    const next = tokens[budgetTokenIdx + 1];
    const after = tokens[budgetTokenIdx + 2];
    if (next && after && /^\d+$/.test(next) && /^(lan|l)$/.test(after)) {
      vars.budgetMax = Number(next) * 1_000_000;
      vars.budgetLabel = `งบ ${next} ล้าน`;
    } else if (next) {
      const b = parseBudget(next);
      if (b) {
        vars.budgetMax = b;
        vars.budgetLabel = `งบไม่เกิน ${(b / 1_000_000).toLocaleString("th-TH")} ล้าน`;
      }
    }
  }

  const hasSignal =
    vars.style || vars.floors || vars.widthMeters || vars.beds || vars.baths || vars.budgetMax;
  if (!hasSignal) return null;

  return {
    filter: {
      style: vars.style,
      floors: vars.floors,
      widthMeters: vars.widthMeters,
      budgetMax: vars.budgetMax,
      beds: vars.beds,
      baths: vars.baths,
    },
    variables: vars,
  };
}

export function styleLabelTh(style?: string): string | undefined {
  if (!style) return undefined;
  return STYLE_LABEL_TH[style] ?? style;
}

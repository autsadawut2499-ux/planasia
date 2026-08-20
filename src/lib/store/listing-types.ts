import type { StoreListingSource } from "@/lib/templates/policy";
import type { ProjectInput } from "@/lib/ai/types";
import type { StorePriceBreakdown } from "@/lib/store/pricing";

/** Public byline for the draftsman behind a listing, resolved from `ownerId`. */
export interface ListingCreator {
  ownerKey: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  /** False when derived from listing activity only (no vendor profile row). */
  hasProfile: boolean;
}

/** Result of AI auto-verification on upload (persisted in ai_screening). */
export interface ListingAiScreening {
  approved: boolean;
  provider: "gemini" | "rules";
  checkedAt: string;
  completeness: { ok: boolean; missing: string[] };
  security: { ok: boolean; flags: string[] };
  suitability: { ok: boolean; score: number; notes: string[] };
  reasons: string[];
}

/** @deprecated Prefer `ListingAiScreening`. */
export type ListingAiScreeningResult = ListingAiScreening;

export interface StoreListing {
  id: string;
  slug: string;
  /**
   * Public marketplace code (MOD-001). Prefer this for display / invoices.
   */
  planCode: string;
  /**
   * Optional house_plans document id for generative PDF/CAD downloads.
   * Vendor blueprint listings usually leave this empty.
   */
  planDocumentId?: string;
  /**
   * @deprecated Alias of `planCode` — kept for cart/order/grant JSON compatibility.
   */
  planId: string;
  ownerId: string;
  creatorBrowserId: string;
  creatorSessionUserId?: string;
  creatorIp?: string;
  creatorWorkspaceSessionId?: string;
  name: string;
  description: string;
  /** One-line marketing definition shown under the title. */
  tagline?: string;
  /** The draftsman's personal pitch / story, shown as a signed note to buyers. */
  pitch?: string;
  /** Selling points / highlights (wide porch, ensuite, high ceiling …). */
  highlights?: string[];
  beds: number;
  baths: number;
  /** Living / reception rooms (ห้องรับแขก). */
  livingRooms?: number;
  /** Covered car park spaces. */
  parking?: number;
  floors: 1 | 2;
  area: string;
  style: string;
  /** Collection / building type (e.g. commercial, warehouse, resort). */
  collection?: string;
  /**
   * Supplier / source name (admin product sourcing).
   * Persisted as `supplier_name` — used for LINE OA routing later.
   */
  supplierName?: string;
  /** FK to `suppliers.id`. */
  supplierId?: string;
  /**
   * Marketplace product URL when supplier is Shopee/Lazada.
   */
  productUrl?: string;
  /**
   * Admin note: original house plan code from the supplier / source listing.
   */
  sourcePlanCode?: string;
  /**
   * Supplier cost for the main package (THB). Admin middleman margin =
   * selling `price` − `costPrice`.
   */
  costPrice?: number;
  /**
   * Selling price for the site-plan add-on (แผนผังบริเวณเพื่อยื่นขออนุญาต).
   */
  sitePlanAddonPrice?: number;
  /** @deprecated Prefer `supplierName`. Kept for legacy store location filter rows. */
  province?: string;
  /** Structural footprint in metres (used for ±1m dimension matching). */
  widthMeters?: number;
  lengthMeters?: number;
  /** Estimated construction cost in THB (used for budget matching). */
  constructionCostEstimate?: number;
  /**
   * Optional list price before discount. When higher than `price`, cards show
   * strikethrough + “ลดราคา” sale treatment.
   */
  compareAtPrice?: number;
  image: string;
  /** 3D render gallery (front / angle / interior). image = primary render. */
  renderUrls?: string[];
  floorPlanUrls: string[];
  price: number;
  /**
   * Designer-set BOQ add-on price (THB). When null/undefined, the storefront
   * falls back to the platform default (`BOQ_BUNDLE_PRICE`).
   */
  boqPrice?: number;
  /**
   * Designer-set structural calculation add-on price (THB). When null/undefined,
   * the storefront falls back to the platform default (`CALC_SHEET_PRICE`).
   */
  calcPrice?: number;
  /** True when the seller uploaded optional structural calculation sheets. */
  hasCalcSheets?: boolean;
  /** True when the seller uploaded AutoCAD / DWG delivery files. */
  hasCadFiles?: boolean;
  /** True when the seller uploaded BOQ files (public-safe flag; URLs stay private). */
  hasBoqFiles?: boolean;
  priceBreakdown?: StorePriceBreakdown;
  projectSnapshot?: ProjectInput;
  source: StoreListingSource;
  createdAt: string;
  /** Engagement counters + Smart Ranking cache (public-safe). */
  likesCount?: number;
  viewsCount?: number;
  salesCount?: number;
  rankingScore?: number;
  pinned?: boolean;
  /** Attached at read time from vendor_profiles — never persisted on the row. */
  creator?: ListingCreator;
  /**
   * Marketplace moderation (public-safe):
   * - approved = verified designer + AI pass → live / purchasable (auto-publish)
   * - rejected = AI fail or admin takedown → hidden from store
   * - pending = legacy / pre-KYC backlog (auto-flipped to approved on KYC pass)
   * - null/undefined = legacy rows treated as approved
   */
  moderationStatus?: "pending" | "approved" | "rejected";
  /**
   * Seller hide/unpublish flag (public-safe).
   * false = hidden from the public store without deleting the row.
   * undefined/true = published (legacy rows treated as published).
   */
  isPublished?: boolean;
  /** AI / rules SEO meta title (persisted). */
  seoTitle?: string;
  /** AI / rules SEO meta description (persisted). */
  seoDescription?: string;
  /** Stored Schema.org RealEstateListing fragment (no @context). */
  seoJsonLd?: Record<string, unknown>;
  /** ISO timestamp of last SEO generation. */
  seoGeneratedAt?: string;
  /** gemini | rules */
  seoProvider?: "gemini" | "rules";
}

/**
 * Vendor-only view of a listing that additionally exposes the source blueprint
 * PDF url. Never returned by public store endpoints (would bypass payment).
 */
export interface VendorListing extends StoreListing {
  /** @deprecated Primary blueprint — mirrors `blueprintPdfUrls[0]`. */
  blueprintPdfUrl?: string;
  /**
   * @deprecated Primary BOQ — mirrors `boqFileUrls[0]`.
   * BOQ (bill of quantities) — Excel/PDF, used for quotes & contracts.
   */
  boqFileUrl?: string;
  /** Full blueprint set (architectural / structural / MEP …) — unlimited. */
  blueprintPdfUrls?: string[];
  /** Full BOQ set (per trade, per phase …) — unlimited. */
  boqFileUrls?: string[];
  /** AutoCAD / DWG delivery files (private storage refs). */
  cadFileUrls?: string[];
  /** Optional structural calculation sheets (PDF / spreadsheet). */
  calcSheetUrls?: string[];
  /** Vendor confirmed plans are complete and ready for building-permit submission. */
  permitReady?: boolean;
  /** Vendor confirmed BOQ covers structural and architectural scope. */
  boqComplete?: boolean;
  /** Vendor confirmed original copyright ownership + platform terms consent (required). */
  contractConsent?: boolean;
  /** AI auto-verification audit trail. */
  aiScreening?: ListingAiScreening;
}

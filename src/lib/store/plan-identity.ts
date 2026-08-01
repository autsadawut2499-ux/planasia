/**
 * Marketplace plan identity helpers.
 *
 * - planCode: public running number (MOD-001) shown on cards / invoices
 * - planDocumentId: optional house_plans.id for generative PDF/CAD downloads
 * - planId (deprecated): alias of planCode for cart/grant JSON compatibility
 */

const PLAN_CODE_RE = /^[A-Za-z]{2,5}-\d+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isMarketplacePlanCode(value: string | null | undefined): boolean {
  return Boolean(value && PLAN_CODE_RE.test(value.trim()));
}

export function isPlanDocumentUuid(value: string | null | undefined): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
}

export interface PlanIdentity {
  /** Public marketplace code (MOD-001). */
  planCode: string;
  /** house_plans document id when generative downloads exist. */
  planDocumentId?: string;
  /** @deprecated Alias of planCode — kept for cart/order/grant JSON. */
  planId: string;
}

/** Normalize DB / legacy fields into the split identity model. */
export function resolvePlanIdentity(input: {
  planId?: string | null;
  planCode?: string | null;
  planDocumentId?: string | null;
}): PlanIdentity {
  const legacy = (input.planId ?? "").trim();
  const fromCodeCol = (input.planCode ?? "").trim();
  const fromDocCol = (input.planDocumentId ?? "").trim();

  const planCode =
    fromCodeCol ||
    (isMarketplacePlanCode(legacy) ? legacy.toUpperCase() : legacy) ||
    legacy;

  const planDocumentId =
    fromDocCol ||
    (isPlanDocumentUuid(legacy) ? legacy : undefined) ||
    undefined;

  return {
    planCode,
    planDocumentId: planDocumentId || undefined,
    planId: planCode,
  };
}

/** Document id to pass to loadPlanDocument. */
export function resolvePlanDocumentId(input: {
  planDocumentId?: string | null;
  planId?: string | null;
  planCode?: string | null;
}): string | undefined {
  return resolvePlanIdentity(input).planDocumentId;
}

/** localStorage drafts for Admin listing create/edit form. */

export const LISTING_DRAFT_ACTIVE_KEY = "planasia.admin.listing-draft.active";

export type ListingDraftKey = "new" | (string & {});

export interface ListingFormDraftPayload<T> {
  form: T;
  savedAt: number;
}

export function listingDraftStorageKey(id: ListingDraftKey): string {
  return `planasia.admin.listing-draft.${id}`;
}

export function readListingDraftActive(): ListingDraftKey | null {
  try {
    const v = localStorage.getItem(LISTING_DRAFT_ACTIVE_KEY);
    return v && v.trim() ? (v.trim() as ListingDraftKey) : null;
  } catch {
    return null;
  }
}

export function writeListingDraftActive(id: ListingDraftKey): void {
  try {
    localStorage.setItem(LISTING_DRAFT_ACTIVE_KEY, id);
  } catch {
    /* quota / private mode */
  }
}

export function readListingDraft<T>(id: ListingDraftKey): ListingFormDraftPayload<T> | null {
  try {
    const raw = localStorage.getItem(listingDraftStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingFormDraftPayload<T>;
    if (!parsed || typeof parsed !== "object" || !parsed.form) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeListingDraft<T>(id: ListingDraftKey, form: T): void {
  try {
    const payload: ListingFormDraftPayload<T> = { form, savedAt: Date.now() };
    localStorage.setItem(listingDraftStorageKey(id), JSON.stringify(payload));
    writeListingDraftActive(id);
  } catch {
    /* quota / private mode */
  }
}

export function clearListingDraft(id: ListingDraftKey): void {
  try {
    localStorage.removeItem(listingDraftStorageKey(id));
    const active = readListingDraftActive();
    if (active === id) localStorage.removeItem(LISTING_DRAFT_ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

import type { StoreInteraction } from "@/lib/supabase/interactions";

/**
 * Item-item collaborative filtering.
 *
 * We build a co-occurrence matrix: two listings "co-occur" when the same
 * viewer interacted with both. The strength of a co-occurrence is the product
 * of the two interaction weights (a shared purchase counts far more than a
 * shared view). Scores are normalised per anchor item so a very popular plan
 * doesn't dominate every recommendation.
 */
export class CoOccurrenceModel {
  /** anchorListingId -> (otherListingId -> raw co-occurrence strength). */
  private readonly matrix = new Map<string, Map<string, number>>();

  static build(interactions: StoreInteraction[]): CoOccurrenceModel {
    const model = new CoOccurrenceModel();

    // Group each viewer's strongest weight per listing.
    const byViewer = new Map<string, Map<string, number>>();
    for (const it of interactions) {
      let items = byViewer.get(it.viewerKey);
      if (!items) {
        items = new Map();
        byViewer.set(it.viewerKey, items);
      }
      items.set(it.listingId, Math.max(items.get(it.listingId) ?? 0, it.weight));
    }

    for (const items of byViewer.values()) {
      const entries = [...items.entries()];
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [idA, wA] = entries[i];
          const [idB, wB] = entries[j];
          const strength = wA * wB;
          model.add(idA, idB, strength);
          model.add(idB, idA, strength);
        }
      }
    }

    return model;
  }

  private add(anchor: string, other: string, strength: number): void {
    let row = this.matrix.get(anchor);
    if (!row) {
      row = new Map();
      this.matrix.set(anchor, row);
    }
    row.set(other, (row.get(other) ?? 0) + strength);
  }

  /** Normalised co-occurrence (0..1) between two listings. */
  score(anchor: string, other: string): number {
    const row = this.matrix.get(anchor);
    if (!row) return 0;
    const raw = row.get(other) ?? 0;
    if (raw <= 0) return 0;
    const max = Math.max(...row.values());
    return max > 0 ? raw / max : 0;
  }

  /**
   * Aggregate collaborative score for `candidate` given a set of anchor items
   * the viewer already engaged with (weighted by engagement strength).
   */
  scoreForAnchors(candidate: string, anchors: Map<string, number>): number {
    if (anchors.size === 0) return 0;
    let total = 0;
    let weightSum = 0;
    for (const [anchorId, anchorWeight] of anchors) {
      if (anchorId === candidate) continue;
      total += this.score(anchorId, candidate) * anchorWeight;
      weightSum += anchorWeight;
    }
    return weightSum > 0 ? total / weightSum : 0;
  }
}

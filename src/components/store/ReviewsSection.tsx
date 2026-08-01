"use client";

import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { useToast } from "@/context/ToastContext";
import type { PlanReview, RatingAggregate } from "@/lib/supabase/reviews";

interface ReviewsSectionProps {
  listingId: string;
  initialReviews: PlanReview[];
  initialRating: RatingAggregate | null;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          style={{ width: size, height: size }}
          className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-border"}
        />
      ))}
    </span>
  );
}

export function ReviewsSection({ listingId, initialReviews, initialRating }: ReviewsSectionProps) {
  const t = useBilingual();
  const viewer = useStoreViewer();
  const { success, error: toastError } = useToast();
  const [reviews, setReviews] = useState<PlanReview[]>(initialReviews);
  const [rating, setRating] = useState<RatingAggregate | null>(initialRating);

  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/store/${listingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...viewer.headers() },
        body: JSON.stringify({ rating: stars, authorName: name, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setReviews(data.reviews ?? []);
      setRating(data.rating ?? null);
      setShowForm(false);
      setTitle("");
      setBody("");
      success(t("Thanks for your review!", "ขอบคุณสำหรับรีวิว!"));
    } catch {
      toastError(t("Could not submit review", "ส่งรีวิวไม่สำเร็จ"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            {t("Reviews from real buyers", "รีวิวจากผู้ซื้อจริง")}
          </h2>
          {rating ? (
            <div className="mt-1 flex items-center gap-2">
              <Stars value={rating.average} />
              <span className="text-sm font-semibold text-text-primary">{rating.average.toFixed(1)}</span>
              <span className="text-sm text-text-muted">
                ({rating.count} {t("reviews", "รีวิว")})
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-text-muted">
              {t("No reviews yet — be the first.", "ยังไม่มีรีวิว — มาเป็นคนแรกกัน")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full border border-[#1e40af] px-4 py-2 text-sm font-semibold text-[#1e40af] hover:bg-blue-50"
        >
          {t("Write a review", "เขียนรีวิว")}
        </button>
      </div>

      {showForm && (
        <div className="mt-5 rounded-lg border border-border bg-surface-raised p-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} star`}>
                <Star
                  className={`h-6 w-6 ${n <= stars ? "fill-amber-400 text-amber-400" : "text-border"}`}
                />
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Your name", "ชื่อของคุณ")}
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[#1e40af]"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("Title (optional)", "หัวข้อ (ไม่บังคับ)")}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[#1e40af]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("Share your experience building from this plan…", "เล่าประสบการณ์สร้างจริงจากแบบนี้…")}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-[#1e40af]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="mt-3 rounded-full bg-[#1e40af] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            {submitting ? t("Submitting…", "กำลังส่ง…") : t("Submit review", "ส่งรีวิว")}
          </button>
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-6 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-5 last:border-b-0">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} size={14} />
                <span className="text-sm font-semibold text-text-primary">{r.authorName}</span>
                {r.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                    <BadgeCheck className="h-3 w-3" />
                    {t("Verified purchase", "ซื้อจริง")}
                  </span>
                )}
              </div>
              {r.title && <p className="mt-1 text-sm font-semibold text-text-primary">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-text-secondary">{r.body}</p>}
              {r.photos.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {r.photos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={t("Real build photo", "ภาพหน้างานจริง")}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

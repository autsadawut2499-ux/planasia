"use client";

import {
  Bath,
  BedDouble,
  Car,
  Download,
  FlipHorizontal2,
  Home,
  Layers,
  Printer,
  Ruler,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { useBilingual } from "@/components/landing/useBilingual";
import { StoreCheckoutModal } from "@/components/store/StoreQuickView";
import {
  ListingImageCarousel,
  buildListingGalleryUrls,
} from "@/components/store/ListingImageCarousel";
import { ListingCreatorByline } from "@/components/store/ListingCreatorByline";
import {
  ListingPurchasePanel,
  type ListingPurchaseSelection,
} from "@/components/store/ListingPurchasePanel";
import { ListingSocialShare } from "@/components/store/ListingSocialShare";
import { useApp } from "@/context/AppContext";
import { useStoreBrowseOptional } from "@/context/StoreBrowseContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import { FLOOR_MATERIALS, ROOF_MATERIALS } from "@/lib/ai/types";
import type { StoreListing } from "@/lib/store/db";
import {
  buildPlanCardSpecs,
  parseListingAreaNumber,
  resolveListingSale,
  type PlanCardSpec,
} from "@/lib/store/plan-card-specs";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import {
  forceDownloadMedia,
  guessDownloadFilename,
} from "@/lib/media/force-download";
import { printRemoteImage } from "@/lib/media/print-image";
import type { PlanReview, RatingAggregate } from "@/lib/supabase/reviews";

const RecommendedForYou = dynamic(
  () => import("@/components/store/RecommendedForYou").then((m) => m.RecommendedForYou),
  { ssr: false, loading: () => <div className="h-64" aria-hidden /> },
);
const ReviewsSection = dynamic(
  () => import("@/components/store/ReviewsSection").then((m) => m.ReviewsSection),
  { ssr: false, loading: () => <div className="h-48" aria-hidden /> },
);

interface StoreListingPageClientProps {
  listing: StoreListing;
  initialReviews?: PlanReview[];
  initialRating?: RatingAggregate | null;
}

function labelFromOptions(
  value: string | undefined,
  options: { value: string; label: { en: string; th: string } }[],
  locale: "en" | "th",
): string | null {
  if (!value?.trim()) return null;
  const hit = options.find((o) => o.value === value);
  if (!hit) return value;
  return locale === "th" ? hit.label.th : hit.label.en;
}

function buildDetailSpecRows(
  listing: StoreListing,
  L: (en: string, th: string) => string,
  locale: "en" | "th",
) {
  const snap = listing.projectSnapshot;
  const roof =
    labelFromOptions(snap?.roofMaterial, ROOF_MATERIALS, locale) ||
    listing.highlights?.find((h) => /หลังคา|roof|tile|กระเบื้อง/i.test(h)) ||
    "—";
  const floor =
    labelFromOptions(snap?.floorMaterial, FLOOR_MATERIALS, locale) ||
    listing.highlights?.find((h) => /พื้น|floor|แกรนิต|ไม้/i.test(h)) ||
    "—";
  const decorate =
    listing.highlights
      ?.filter((h) => /ตกแต่ง|บัว|ไม้ฝา|อลู|aluminium|decor/i.test(h))
      .join(" · ") ||
    listing.highlights?.slice(0, 2).join(" · ") ||
    "—";

  const budget =
    listing.constructionCostEstimate != null && listing.constructionCostEstimate > 0
      ? `ประมาณ ฿${listing.constructionCostEstimate.toLocaleString("th-TH")}`
      : snap?.budget?.trim() || "—";

  const land =
    listing.widthMeters != null && listing.lengthMeters != null
      ? `${listing.widthMeters} × ${listing.lengthMeters} ม.`
      : snap && "landSize" in snap && String((snap as { landSize?: string }).landSize || "").trim()
        ? String((snap as { landSize?: string }).landSize)
        : "—";

  const left = [
    { label: L("Total area", "พื้นที่ใช้สอย"), value: `${parseListingAreaNumber(listing.area)} ตร.ม.` },
    { label: L("Stories", "จำนวนชั้น"), value: String(listing.floors) },
    { label: L("Bedrooms", "ห้องนอน"), value: String(listing.beds) },
    { label: L("Bathrooms", "ห้องน้ำ"), value: String(listing.baths) },
    {
      label: L("Parking", "ที่จอดรถ"),
      value: listing.parking != null ? String(listing.parking) : "—",
    },
    { label: L("Style", "สไตล์"), value: listing.style || "—" },
  ];

  const right = [
    { label: L("Roof", "หลังคา"), value: roof },
    { label: L("Floor", "พื้น"), value: floor },
    { label: L("Decorate", "การตกแต่ง"), value: decorate },
    { label: L("Budget", "งบประมาณก่อสร้าง"), value: budget },
    { label: L("Land", "ขนาดที่ดินสำหรับแบบบ้าน"), value: land },
    {
      label: L("Width × Depth", "ความกว้าง × ความลึก"),
      value:
        listing.widthMeters != null && listing.lengthMeters != null
          ? `${listing.widthMeters} × ${listing.lengthMeters} ม.`
          : "—",
    },
  ];

  return { left, right };
}

export default function StoreListingPageClient({
  listing: initialListing,
  initialReviews = [],
  initialRating = null,
}: StoreListingPageClientProps) {
  const router = useRouter();
  const L = useBilingual();
  const { formatMoney, translate, locale } = useApp();
  const { success: toastSuccess, error: toastError } = useToast();
  const { addItem, isInCart } = useStoreCart();
  const browse = useStoreBrowseOptional();
  const viewer = useStoreViewer();
  const { track } = useInteractionTracker();

  const [listing, setListing] = useState(initialListing);
  useEffect(() => {
    setListing(initialListing);
  }, [initialListing]);
  const copy = useStoreListingCopy(listing);

  const [floorIndex, setFloorIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [floorDownloading, setFloorDownloading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [purchaseSelection, setPurchaseSelection] =
    useState<ListingPurchaseSelection | null>(null);
  const [hidden, setHidden] = useState(false);

  const floorUrls = listing.floorPlanUrls?.length ? listing.floorPlanUrls : [];
  const galleryUrls = useMemo(() => buildListingGalleryUrls(listing), [listing]);
  const favorited = browse ? browse.isFavorite(listing.id) : false;
  const sale = resolveListingSale(listing);
  const quickSpecs = buildPlanCardSpecs(listing);
  const detailSpecs = useMemo(
    () => buildDetailSpecRows(listing, L, locale === "th" ? "th" : "en"),
    [listing, L, locale],
  );
  const shareDescription = [
    listing.tagline?.trim() ||
      copy.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100),
    L(
      `${listing.beds} beds · ${listing.baths} baths · ${listing.area || "—"}`,
      `${listing.beds} ห้องนอน · ${listing.baths} ห้องน้ำ · ${listing.area || "—"}`,
    ),
  ]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 160);

  const handleFavorite = () => {
    if (!browse) return;
    if (!favorited) track(listing.id, "wishlist", { source: "detail" });
    browse.toggleFavorite(listing.id);
  };

  /** Pull latest images + moderationStatus so Approve unlocks Buy without a hard reload. */
  const refreshListing = useCallback(async () => {
    if (!viewer.ready) return;
    const res = await fetch(`/api/store/${initialListing.id}`, {
      headers: viewer.headers(),
      cache: "no-store",
    });
    if (res.status === 403 || res.status === 404) {
      setHidden(true);
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { listing?: StoreListing };
    if (data.listing) setListing(data.listing);
  }, [initialListing.id, viewer]);

  useEffect(() => {
    void refreshListing();
  }, [refreshListing]);

  useEffect(() => {
    const onFocus = () => {
      void refreshListing();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshListing]);

  useEffect(() => {
    if (viewer.ready) track(listing.id, "view", { source: "detail" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer.ready, listing.id]);

  useEffect(() => {
    if (!viewer.ready) return;
    const start = Date.now();
    const send = () => {
      const durationMs = Date.now() - start;
      if (durationMs < 3000) return;
      const payload = JSON.stringify({
        listingId: listing.id,
        eventType: "view",
        browserId: viewer.browserId,
        sessionUserId: viewer.sessionUserId,
        metadata: { source: "detail-dwell", durationMs },
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/interactions", new Blob([payload], { type: "application/json" }));
      }
    };
    window.addEventListener("pagehide", send);
    return () => {
      send();
      window.removeEventListener("pagehide", send);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer.ready, listing.id]);

  const inCart = isInCart(listing.id);
  const canPurchase = isListingPurchasable(listing);

  const handleAddToCart = (selection: ListingPurchaseSelection) => {
    if (!canPurchase) {
      toastError(
        L(
          "This plan is not available for purchase yet.",
          "แบบบ้านนี้ยังไม่เปิดให้ซื้อในขณะนี้",
        ),
      );
      return;
    }
    addItem(listing, {
      price: selection.linePrice,
      format: selection.format,
      addons: selection.addons,
    });
    track(listing.id, "cart", { source: "detail" });
    toastSuccess(translate("store.cartAdded"));
  };

  const openCheckout = (selection: ListingPurchaseSelection) => {
    if (!canPurchase) {
      toastError(
        L(
          "This plan is not available for purchase yet.",
          "แบบบ้านนี้ยังไม่เปิดให้ซื้อในขณะนี้",
        ),
      );
      return;
    }
    setPurchaseSelection(selection);
    setCheckoutOpen(true);
  };

  const handlePurchaseSuccess = (downloadToken: string) => {
    track(listing.id, "purchase", { source: "detail" });
    setCheckoutOpen(false);
    toastSuccess(translate("store.purchaseSuccess"));
    const fmt = purchaseSelection?.format ?? "pdf";
    window.open(`/api/download?token=${downloadToken}&format=${fmt}`, "_blank");
  };

  const activeFloorUrl = floorUrls[floorIndex] || "";

  function printFloorPlan() {
    if (!activeFloorUrl) {
      toastError(L("No floor plan available", "ยังไม่มีภาพแปลน"));
      return;
    }
    const opened = printRemoteImage({
      url: activeFloorUrl,
      title: copy.name,
      flipX: flipped,
    });
    if (!opened) {
      toastError(L("Could not open print window", "เปิดหน้าต่างพิมพ์ไม่สำเร็จ"));
    }
  }

  async function downloadFloorPlan() {
    if (!activeFloorUrl) {
      toastError(L("No floor plan available", "ยังไม่มีภาพแปลน"));
      return;
    }
    if (floorDownloading) return;

    const filename = guessDownloadFilename(
      activeFloorUrl,
      `${listing.slug || listing.id}-floor-${floorIndex + 1}`,
    );

    setFloorDownloading(true);
    try {
      await forceDownloadMedia(activeFloorUrl, filename, { flipX: flipped });
    } catch {
      toastError(
        L(
          "Could not download the image. Please try again.",
          "ดาวน์โหลดรูปไม่สำเร็จ กรุณาลองอีกครั้ง",
        ),
      );
    } finally {
      setFloorDownloading(false);
    }
  }

  if (hidden) {
    return (
      <>
        <LandingHeader />
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-text-muted">{translate("store.empty")}</p>
          <Link href="/store" className="mt-4 inline-block text-[#1e40af] underline">
            {translate("nav.store")}
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <LandingHeader />
      <main className="page-canvas listing-detail-main min-h-screen">
        <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <button
            type="button"
            onClick={() => router.push("/store")}
            className="mb-4 inline-flex min-h-10 items-center text-sm font-medium text-[#1e40af] hover:underline sm:mb-6"
          >
            ← {translate("nav.store")}
          </button>

          {/* Title (left) + social share (right) on one visual plane above hero / config */}
          <header className="mb-4 grid items-end gap-3 sm:mb-6 sm:gap-4 lg:mb-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)] lg:gap-8">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e40af]">
                {translate("store.communityBadge")}
              </p>
              <h1 className="mt-1 text-[1.35rem] font-bold leading-snug tracking-tight text-[#1e3a5f] sm:mt-1.5 sm:text-3xl lg:text-[2rem]">
                {copy.name}
              </h1>
            </div>

            <div className="flex min-w-0 flex-col items-start justify-end lg:items-start">
              <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
                <ListingSocialShare
                  listing={listing}
                  title={copy.name}
                  description={shareDescription}
                  hideLabel={false}
                  favorite={
                    browse
                      ? {
                          active: favorited,
                          onToggle: handleFavorite,
                          labelSave: translate("store.aria.save"),
                          labelRemove: translate("store.aria.removeFavorite"),
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </header>

          {/* Hero: large media + package purchase panel */}
          <section className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)] lg:gap-8">
            <div className="min-w-0">
              <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm sm:rounded-2xl">
                <ListingImageCarousel
                  images={galleryUrls}
                  alt={copy.name}
                  frameClassName="relative aspect-[4/3] touch-pan-y bg-slate-50 p-2 sm:aspect-[16/10] sm:p-4 lg:aspect-[4/3]"
                />
              </div>

              {/* Specs bar — icon + value row under the hero image */}
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mt-4">
                <div className="grid grid-cols-4 gap-px bg-slate-100 sm:grid-cols-7">
                  {quickSpecs.map((spec) => {
                    const Icon = specIconFor(spec);
                    return (
                      <div
                        key={spec.labelEn}
                        className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 bg-white px-1 py-2.5 text-center sm:min-h-[4.5rem] sm:py-3"
                      >
                        <Icon className="h-4 w-4 text-[#1e40af]" strokeWidth={1.75} aria-hidden />
                        <p className="text-[13px] font-bold tabular-nums leading-none text-[#1e3a5f] sm:text-sm">
                          {spec.value}
                        </p>
                        <p className="line-clamp-2 text-[9px] font-medium leading-tight text-gray-500 sm:text-[10px]">
                          {L(spec.labelEn, spec.labelTh)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {listing.creator && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:mt-4 sm:px-5 sm:py-4">
                  <ListingCreatorByline creator={listing.creator} size="minimal" />
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24">
              <ListingPurchasePanel
                listing={listing}
                canPurchase={canPurchase}
                inCart={inCart}
                onAddToCart={handleAddToCart}
                onBuyNow={openCheckout}
              />

              {listing.highlights && listing.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  {listing.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-[#1e40af]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </aside>
          </section>

          {/* Floorplan drawings */}
          <section className="mt-10 sm:mt-12 lg:mt-16">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-lg font-bold text-[#1e40af] sm:text-2xl">
                {L("Floor Plan Drawings", "ภาพวาดแปลนพื้น")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {L(
                  "View uploaded floor plans — reverse, print, or download",
                  "ดูแปลนที่อัปโหลด — กลับด้าน พิมพ์ หรือดาวน์โหลด",
                )}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1e40af]/20 bg-white shadow-sm sm:rounded-2xl">
              {floorUrls.length > 0 ? (
                <>
                  <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/80 p-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
                    {floorUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFloorIndex(i);
                          setFlipped(false);
                        }}
                        className={`min-h-11 shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                          floorIndex === i
                            ? "bg-[#1e40af] text-white"
                            : "bg-white text-gray-600 ring-1 ring-slate-200 hover:text-[#1e40af]"
                        }`}
                      >
                        {floorUrls.length === 1
                          ? L("Floor plan", "แปลนพื้น")
                          : L(`Floor ${i + 1}`, `ชั้นที่ ${i + 1}`)}
                      </button>
                    ))}
                  </div>

                  <div className="flex min-h-[240px] items-center justify-center bg-[#f8fafc] p-3 sm:min-h-[420px] sm:p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeFloorUrl}
                      alt={L(`Floor plan ${floorIndex + 1}`, `แปลนชั้นที่ ${floorIndex + 1}`)}
                      className="max-h-[70vh] w-full max-w-4xl object-contain transition-transform duration-300 sm:max-h-[560px]"
                      style={{ transform: flipped ? "scaleX(-1)" : undefined }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 p-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 sm:px-4 sm:py-3">
                    <button
                      type="button"
                      onClick={() => setFlipped((v) => !v)}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 hover:text-[#1e40af] sm:gap-2 sm:bg-transparent sm:px-3 sm:text-sm sm:font-medium"
                    >
                      <FlipHorizontal2 className="h-4 w-4 shrink-0" />
                      {L("Reverse", "กลับด้าน")}
                    </button>
                    <button
                      type="button"
                      onClick={printFloorPlan}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 hover:text-[#1e40af] sm:gap-2 sm:bg-transparent sm:px-3 sm:text-sm sm:font-medium"
                    >
                      <Printer className="h-4 w-4 shrink-0" />
                      {L("Print", "พิมพ์")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadFloorPlan()}
                      disabled={floorDownloading}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 text-xs font-semibold text-gray-700 hover:bg-slate-100 hover:text-[#1e40af] disabled:cursor-wait disabled:opacity-60 sm:gap-2 sm:bg-transparent sm:px-3 sm:text-sm sm:font-medium"
                    >
                      <Download className="h-4 w-4 shrink-0" />
                      {floorDownloading
                        ? L("Downloading…", "กำลังดาวน์โหลด…")
                        : L("Download", "ดาวน์โหลด")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 px-6 py-12 text-center sm:min-h-[200px] sm:py-16">
                  <Home className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-gray-500">
                    {L("No floor plan drawings uploaded yet", "ยังไม่มีภาพวาดแปลนสำหรับแบบนี้")}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Specifications matrix */}
          <section className="mt-10 sm:mt-12 lg:mt-16">
            <h2 className="mb-4 text-lg font-bold text-[#1e3a5f] sm:mb-5 sm:text-2xl">
              {L("Details", "รายละเอียด")}
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
              <div className="grid md:grid-cols-2">
                <SpecColumn rows={detailSpecs.left} />
                <SpecColumn rows={detailSpecs.right} bordered />
              </div>

              {listing.pitch && (
                <div className="border-t border-slate-100 px-4 py-4 sm:px-8 sm:py-5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#1e40af]">
                    {L("From the designer", "จากสถาปนิกและนักออกแบบ")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {listing.pitch}
                  </p>
                  {listing.creator && (
                    <ListingCreatorByline creator={listing.creator} className="mt-3" size="sm" />
                  )}
                </div>
              )}
            </div>
          </section>

          <ReviewsSection
            listingId={listing.id}
            initialReviews={initialReviews}
            initialRating={initialRating}
          />

          <RecommendedForYou
            className="mt-12 sm:mt-14 md:mt-16"
            seedListingId={listing.id}
            excludeIds={[listing.id]}
            limit={8}
          />
        </div>

        <div className="listing-sticky-buy-bar lg:hidden">
          <div className="mx-auto flex max-w-7xl items-stretch gap-2 sm:gap-3">
            <div className="min-w-0 flex-[0.95] self-center pl-0.5 sm:flex-1">
              <p className="truncate text-[10px] text-gray-500 sm:text-xs">
                {translate("store.startingAt")}
              </p>
              <p
                className={`font-price truncate text-base font-bold tabular-nums leading-tight sm:text-lg ${
                  sale.price <= 0 ? "text-emerald-700" : "text-[#1e40af]"
                }`}
              >
                {sale.price <= 0 ? L("Free", "ฟรี") : formatMoney(sale.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("listing-purchase-panel")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="relative z-10 flex min-h-12 min-w-0 flex-[1.35] items-center justify-center gap-1.5 rounded-xl bg-[#1e40af] px-3 text-[11px] font-semibold leading-tight text-white active:bg-[#1d4ed8] sm:px-5 sm:text-sm"
            >
              <Download className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">
                {!canPurchase ? L("Unavailable", "ยังไม่เปิดขาย") : L("Choose package", "เลือกแพ็กเกจ")}
              </span>
            </button>
          </div>
        </div>
      </main>

      <StoreCheckoutModal
        listing={listing}
        open={checkoutOpen && canPurchase}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handlePurchaseSuccess}
        viewerHeaders={viewer.headers}
        buyerId={viewer.primaryId}
        initialFormat={purchaseSelection?.format ?? "pdf"}
        initialHardcopy={purchaseSelection?.addons.includes("hardcopy-3sets") ?? false}
        initialBoq={purchaseSelection?.addons.includes("boq-bundle") ?? false}
        initialCalcSheet={purchaseSelection?.addons.includes("calc-sheet") ?? false}
        basePlanPrice={purchaseSelection?.linePrice ?? listing.price}
      />
    </>
  );
}

function specIconFor(spec: PlanCardSpec) {
  const key = `${spec.labelEn} ${spec.labelTh}`.toLowerCase();
  if (/sq|ตร|area|ม\./.test(key) && !/กว้าง|ลึก|width|depth/.test(key)) return Square;
  if (/bed|นอน/.test(key)) return BedDouble;
  if (/bath|น้ำ/.test(key)) return Bath;
  if (/park|จอด|car/.test(key)) return Car;
  if (/flr|floor|ชั้น|stor/.test(key)) return Layers;
  if (/w\b|กว้าง|width/.test(key)) return Ruler;
  if (/d\b|ลึก|depth/.test(key)) return Ruler;
  return Home;
}

function SpecColumn({
  rows,
  bordered,
}: {
  rows: { label: string; value: string }[];
  bordered?: boolean;
}) {
  return (
    <dl
      className={`divide-y divide-slate-100 ${bordered ? "md:border-l md:border-slate-100" : ""}`}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 px-4 py-3.5 sm:grid sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:gap-3 sm:px-8 sm:py-4"
        >
          <dt className="flex items-start gap-2 text-[13px] font-semibold text-[#1e3a5f] sm:text-sm">
            <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" strokeWidth={1.75} />
            {row.label}
          </dt>
          <dd className="pl-5 text-sm leading-relaxed text-gray-600 sm:pl-0">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

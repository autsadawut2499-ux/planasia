import { NextRequest, NextResponse } from "next/server";
import { findValidGrant } from "@/lib/payments/tokens";
import { fetchAssetBytes } from "@/lib/supabase/private-assets";
import { findCartOrderByStripeSession } from "@/lib/store/cart-orders";
import {
  filenameFromUrl,
  findListingIdByPlanCode,
  getListingAssetUrls,
  type ListingFileKind,
} from "@/lib/store/listing-assets";
import {
  parseDocumentLanguage,
  resolveTranslatedBlueprintForGrant,
  shouldAttemptTranslatedDownload,
} from "@/lib/store/translated-blueprints";
import { loadPlanDocument } from "@/lib/plans/store";
import { generatePlanPdf } from "@/lib/pdf/generator";
import { stampBuyerPdf } from "@/lib/pdf/buyer-stamp";
import { generatePlanDxf } from "@/lib/cad/generator";
import { resolveUnitSystem } from "@/lib/units/format";
import { isUiLocale, type UnitSystem, type UiLocale } from "@/lib/geo/countries";
import { isPlanDocumentUuid } from "@/lib/store/plan-identity";

function resolveFileKind(grant: {
  fileKind?: ListingFileKind;
  format: "pdf" | "cad";
}): ListingFileKind {
  if (
    grant.fileKind === "blueprint" ||
    grant.fileKind === "cad" ||
    grant.fileKind === "boq" ||
    grant.fileKind === "calc"
  ) {
    return grant.fileKind;
  }
  return grant.format === "cad" ? "cad" : "blueprint";
}

/**
 * Post-payment download (vendor-first):
 *   paid grant → fetch vendor-uploaded asset by file_kind → stream to buyer
 *
 * Legacy generative house_plans PDFs are only used when a listing has no
 * uploaded blueprints (old AI-workspace path).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const format = request.nextUrl.searchParams.get("format") as "pdf" | "cad" | null;
  const unitSystem = resolveUnitSystem(
    request.nextUrl.searchParams.get("unitSystem") as UnitSystem | null,
    request.nextUrl.searchParams.get("countryCode"),
  );
  const localeParam = request.nextUrl.searchParams.get("locale");
  const uiLocale: UiLocale = isUiLocale(localeParam) ? localeParam : "en";
  const buyerLabel = request.nextUrl.searchParams.get("buyer")?.trim() || undefined;
  const docLang = parseDocumentLanguage(request.nextUrl.searchParams.get("docLang"));
  const variant = request.nextUrl.searchParams.get("variant");

  if (!token || !format || (format !== "pdf" && format !== "cad")) {
    return NextResponse.json({ error: "Missing token or format" }, { status: 400 });
  }

  const grant = await findValidGrant(token);
  if (!grant) {
    return NextResponse.json({ error: "Invalid or expired download token" }, { status: 403 });
  }
  if (grant.format !== format) {
    return NextResponse.json({ error: "Token format mismatch" }, { status: 403 });
  }

  const fileKind = resolveFileKind(grant);
  const listingId =
    grant.listingId || (await findListingIdByPlanCode(grant.planId)) || undefined;
  const assetUrls = listingId ? await getListingAssetUrls(listingId, fileKind) : [];

  // ── Primary path: vendor / architect uploaded assets ─────────────────────
  if (assetUrls.length > 0) {
    const index = Math.min(
      Math.max(0, grant.fileIndex ?? 0),
      assetUrls.length - 1,
    );
    const sourceUrl = assetUrls[index];
    const fallbackExt = format === "cad" ? "dwg" : "pdf";
    const filename = filenameFromUrl(
      sourceUrl,
      `${grant.planId}-${fileKind}-${index + 1}.${fallbackExt}`,
    );

    if (
      fileKind === "blueprint" &&
      shouldAttemptTranslatedDownload({
        format,
        docLang,
        variant,
      }) &&
      grant.stripeSessionId
    ) {
      try {
        const order = await findCartOrderByStripeSession(grant.stripeSessionId);
        const translated = resolveTranslatedBlueprintForGrant({
          order,
          grant,
          sourceUrl,
          sourceFilename: filename,
        });
        if (translated?.translatedStorageRef) {
          const asset = await fetchAssetBytes(translated.translatedStorageRef);
          if (asset?.bytes?.length) {
            console.info("[download] serving translated", {
              planId: grant.planId,
              listingId,
              index,
              fileKind,
              docLang,
              provider: translated.provider,
            });
            return new NextResponse(new Uint8Array(asset.bytes), {
              headers: {
                "Content-Type":
                  asset.contentType || translated.mimeType || "application/pdf",
                "Content-Disposition": `attachment; filename="${translated.translatedFilename}"`,
                "Cache-Control": "no-store",
                "X-Planasia-Source": "translated-upload",
                "X-Planasia-File-Kind": fileKind,
                "X-Planasia-File-Index": String(index),
                "X-Planasia-File-Count": String(assetUrls.length),
              },
            });
          }
          console.warn("[download] translated file fetch failed; falling back", {
            planId: grant.planId,
            listingId,
            index,
            translatedStorageRef: translated.translatedStorageRef,
          });
        }
      } catch (err) {
        console.error("[download] translated lookup error; falling back", err);
      }
    }

    try {
      const asset = await fetchAssetBytes(sourceUrl);
      if (!asset) {
        console.error(
          `[download] vendor file fetch failed for ${grant.planId}#${fileKind}#${index}`,
        );
        return NextResponse.json(
          { error: "Could not retrieve the uploaded plan file" },
          { status: 502 },
        );
      }

      console.info("[download] serving original", {
        planId: grant.planId,
        listingId,
        index,
        fileKind,
        requestedDocLang: docLang,
        variant,
      });
      return new NextResponse(new Uint8Array(asset.bytes), {
        headers: {
          "Content-Type":
            asset.contentType ||
            (format === "cad" ? "application/acad" : "application/pdf"),
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
          "X-Planasia-Source": "vendor-upload",
          "X-Planasia-File-Kind": fileKind,
          "X-Planasia-File-Index": String(index),
          "X-Planasia-File-Count": String(assetUrls.length),
        },
      });
    } catch (err) {
      console.error("[download] vendor file fetch error", err);
      return NextResponse.json(
        { error: "Could not retrieve the uploaded plan file" },
        { status: 502 },
      );
    }
  }

  // CAD / BOQ / calc with no uploaded assets cannot fall back to generative CAD.
  if (fileKind !== "blueprint") {
    return NextResponse.json(
      {
        error: `No ${fileKind} files are linked to this purchase. Ask the seller to upload the files.`,
      },
      { status: 404 },
    );
  }

  // ── Legacy fallback: generative house_plans document ─────────────────────
  let documentId =
    grant.planDocumentId ||
    (isPlanDocumentUuid(grant.planId) ? grant.planId : undefined);

  if (!documentId) {
    return NextResponse.json(
      {
        error:
          "No vendor-uploaded blueprint PDFs are linked to this purchase. Ask the seller to upload plan files.",
      },
      { status: 404 },
    );
  }

  const plan = await loadPlanDocument(documentId);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const filename = `${plan.project.projectName || "house-plan"}-${grant.planId}`;
  const opts = { unitSystem };

  if (format === "pdf") {
    let pdfBytes = await generatePlanPdf(plan, opts);
    pdfBytes = await stampBuyerPdf(pdfBytes, {
      buyerLabel: buyerLabel || grant.userId || "Licensed buyer",
      uiLocale,
      orderId: grant.stripeSessionId?.slice(0, 12),
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
        "X-Planasia-Source": "legacy-generative",
      },
    });
  }

  const dxf = generatePlanDxf(plan, opts);
  return new NextResponse(dxf, {
    headers: {
      "Content-Type": "application/dxf",
      "Content-Disposition": `attachment; filename="${filename}.dxf"`,
      "Cache-Control": "no-store",
      "X-Planasia-Source": "legacy-generative",
    },
  });
}

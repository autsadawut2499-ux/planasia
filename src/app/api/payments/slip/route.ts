import { NextRequest, NextResponse } from "next/server";
import { finalizePaidCartSale, dispatchPostPaymentNotifications } from "@/lib/commerce/finalize-sale";
import { verifyBankSlip } from "@/lib/payments/slip-verify";
import { isSlipmateConfigured } from "@/lib/payments/slipmate-config";
import {
  getCartOrder,
  updateCartOrderSlip,
} from "@/lib/store/cart-orders";
import { uploadPrivateBytesDetailed } from "@/lib/supabase/private-assets";
import { requireBuyerSession } from "@/lib/auth/buyer-session";
import { getListingById } from "@/lib/store/db";
import { listingSupplierName } from "@/lib/store/listing-supplier";

/** Customer-facing copy when auto-verify is unavailable (never mention env vars). */
const MANUAL_REVIEW_TH =
  "รับสลิปแล้ว — เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 24 ชั่วโมง";
const MANUAL_REVIEW_EN =
  "Slip received — our team will review and contact you within 24 hours";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Phone camera slips are often larger than desktop screenshots. */
const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Content-Type sent to Supabase storage only.
 * Always use an allow-listed type so .JPG / empty MIME / mobile oddities never fail storage.
 * SlipMate verification uses raw bytes — storage MIME does not matter for QR decode.
 */
function storageContentTypeForSlip(_file: File): string {
  return "image/jpeg";
}

function storageExtForSlip(file: File, contentType: string): string {
  const name = file.name || "";
  const fromName = name.includes(".")
    ? name.slice(name.lastIndexOf(".") + 1).toLowerCase()
    : "";
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("heic") || contentType.includes("heif")) return "heic";
  return "jpg";
}

/**
 * Upload slip → SlipMate verify → on Success: paid + confirm email + order PDF.
 * On failure: return SlipMate error and do NOT change order status.
 * Guest checkouts (no Google session) are allowed when the caller knows the orderId.
 */
export async function POST(request: NextRequest) {
  try {
    const buyer = await requireBuyerSession();

    const form = await request.formData();
    const orderId = String(form.get("orderId") ?? "").trim();
    const file = form.get("slip");
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาอัปโหลดไฟล์สลิป" }, { status: 400 });
    }

    console.info("[payments/slip] received file", {
      orderId,
      name: file.name,
      type: file.type || "(empty)",
      size: file.size,
    });

    if (file.size <= 0 || file.size > MAX_BYTES) {
      const error = `ไฟล์สลิปต้องไม่เกิน ${Math.round(MAX_BYTES / (1024 * 1024))}MB (ขนาดที่ส่งมา ${file.size} bytes)`;
      console.error("[payments/slip] size rejected", { size: file.size, max: MAX_BYTES });
      return NextResponse.json({ error, detail: error }, { status: 400 });
    }

    // No MIME / extension rejection — accept any uploaded image blob.
    const contentType = storageContentTypeForSlip(file);

    const order = await getCartOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }
    // Only enforce ownership when a signed-in buyer mismatches a known account-bound order.
    if (
      buyer &&
      order.buyerUserId &&
      order.buyerUserId !== buyer.userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (order.status === "paid") {
      try {
        await dispatchPostPaymentNotifications(order);
      } catch (err) {
        console.error("[payments/slip] already-paid notify retry failed", err);
      }
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId,
        status: "paid",
        message:
          "การสั่งซื้อสำเร็จ เจ้าหน้าที่ จะติดต่อกลับภายใน 24 ชั่วโมง เอกสารของคุณจะถูกส่งภายใน 3-5 วัน",
        successMessage:
          "การสั่งซื้อสำเร็จ เจ้าหน้าที่ จะติดต่อกลับภายใน 24 ชั่วโมง เอกสารของคุณจะถูกส่งภายใน 3-5 วัน",
      });
    }
    if (
      order.status !== "awaiting_payment" &&
      order.status !== "failed" &&
      order.status !== "pending"
    ) {
      return NextResponse.json(
        { error: `สถานะคำสั่งซื้อไม่รองรับการอัปโหลดสลิป (${order.status})` },
        { status: 409 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = storageExtForSlip(file, contentType);
    const storagePath = `payment-slips/${orderId}-${Date.now()}.${ext}`;

    let uploaded = await uploadPrivateBytesDetailed({
      path: storagePath,
      bytes,
      contentType,
      upsert: true,
    });

    // If storage MIME allow-list rejects an exotic type, retry as octet-stream.
    if (!uploaded.ref && uploaded.error?.toLowerCase().includes("mime")) {
      console.warn("[payments/slip] MIME rejected by storage — retrying as octet-stream", {
        contentType,
        storageError: uploaded.error,
      });
      uploaded = await uploadPrivateBytesDetailed({
        path: storagePath,
        bytes,
        contentType: "application/octet-stream",
        upsert: true,
      });
    }

    if (!uploaded.ref) {
      const detail = uploaded.error || "storage upload returned null";
      console.error("[payments/slip] storage upload failed", detail);
      return NextResponse.json(
        {
          ok: false,
          error: "อัปโหลดสลิปไม่สำเร็จ",
          detail,
          reason: detail,
          message: `อัปโหลดสลิปไม่สำเร็จ: ${detail}`,
        },
        { status: 500 },
      );
    }

    // Keep order awaiting_payment while verifying (do not flip to failed on reject).
    await updateCartOrderSlip(orderId, {
      slipImagePath: storagePath,
      slipVerifyStatus: "pending",
      status: "awaiting_payment",
      paymentFailureReason: null,
    });

    // SlipMate key missing on host (common on Vercel) — keep slip, queue manual review.
    // Never surface env-var instructions to buyers; UI already handles pendingReview.
    if (!isSlipmateConfigured()) {
      console.error(
        "[payments/slip] SLIPMATE_API_KEY missing — slip queued for manual review",
        { orderId, storagePath },
      );
      await updateCartOrderSlip(orderId, {
        slipVerifyStatus: "pending",
        slipVerifyPayload: {
          manualReview: true,
          reason: "slipmate_not_configured",
        },
        status: "awaiting_payment",
        paymentFailureReason: null,
      });
      return NextResponse.json({
        ok: true,
        pendingReview: true,
        orderId,
        status: "awaiting_payment",
        message: MANUAL_REVIEW_TH,
        successMessage: MANUAL_REVIEW_TH,
        detail: MANUAL_REVIEW_EN,
      });
    }

    const verified = await verifyBankSlip({
      imageBytes: bytes,
      expectedAmountThb: order.total,
    });

    if (!verified.ok) {
      // Missing key race / config — same graceful path as above.
      if (verified.code === "missing_api_key") {
        console.error(
          "[payments/slip] SlipMate missing_api_key — slip queued for manual review",
          { orderId },
        );
        await updateCartOrderSlip(orderId, {
          slipVerifyStatus: "pending",
          slipVerifyPayload: {
            manualReview: true,
            reason: "slipmate_not_configured",
          },
          status: "awaiting_payment",
          paymentFailureReason: null,
        });
        return NextResponse.json({
          ok: true,
          pendingReview: true,
          orderId,
          status: "awaiting_payment",
          message: MANUAL_REVIEW_TH,
          successMessage: MANUAL_REVIEW_TH,
          detail: MANUAL_REVIEW_EN,
        });
      }

      // Network / transport error — leave status unchanged; show generic failure.
      console.error("[payments/slip] SlipMate transport error", verified.error);
      await updateCartOrderSlip(orderId, {
        slipVerifyStatus: "error",
        slipVerifyPayload: { error: verified.error },
        paymentFailureReason: verified.error,
      });
      const transportMsg =
        "ระบบตรวจสอบสลิปขัดข้องชั่วคราว — กรุณาลองใหม่อีกครั้ง หรือติดต่อแอดมิน";
      return NextResponse.json(
        {
          ok: false,
          orderId,
          status: order.status === "failed" ? "awaiting_payment" : order.status,
          error: transportMsg,
          reason: transportMsg,
          message: transportMsg,
          detail: verified.error,
        },
        { status: 502 },
      );
    }

    if (!verified.verified) {
      // SlipMate rejected — return their message; do NOT change order status.
      console.error("[payments/slip] SlipMate rejected slip", verified.reason, verified.raw);
      await updateCartOrderSlip(orderId, {
        slipVerifyStatus: "invalid",
        slipVerifyPayload:
          typeof verified.raw === "object" && verified.raw
            ? (verified.raw as Record<string, unknown>)
            : { reason: verified.reason },
        paymentFailureReason: verified.reason,
        status: "awaiting_payment",
      });
      return NextResponse.json({
        ok: false,
        orderId,
        status: "awaiting_payment",
        reason: verified.reason,
        message: verified.reason,
        error: verified.reason,
        detail: verified.reason,
      });
    }

    const paymentRef =
      verified.transRef || `slip_${orderId}_${Date.now().toString(36)}`;

    await updateCartOrderSlip(orderId, {
      slipVerifyStatus: "verified",
      slipVerifiedAt: new Date().toISOString(),
      slipVerifyPayload:
        typeof verified.raw === "object" && verified.raw
          ? (verified.raw as Record<string, unknown>)
          : { verified: true },
      paymentRef,
      paymentFailureReason: null,
    });

    const result = await finalizePaidCartSale({
      cartOrderId: orderId,
      stripeSessionId: paymentRef,
      buyerUserId: buyer?.userId ?? order.buyerUserId,
    });

    const paidOrder = result?.order ?? (await getCartOrder(orderId));
    const summaryLines = await Promise.all(
      (paidOrder?.items ?? order.items).map(async (item) => {
        const listing = await getListingById(item.listingId);
        return {
          housePlanId: item.planId || listing?.planId || item.listingId,
          supplierName: listingSupplierName(listing) || "—",
          planName: item.name,
        };
      }),
    );

    const SUCCESS_TH =
      "การสั่งซื้อสำเร็จ เจ้าหน้าที่ จะติดต่อกลับภายใน 24 ชั่วโมง เอกสารของคุณจะถูกส่งภายใน 3-5 วัน";

    console.info("[payments/slip] order paid summary", {
      orderId,
      customerName: paidOrder?.buyerName ?? order.buyerName,
      customerPhone: paidOrder?.buyerPhone ?? order.buyerPhone,
      lines: summaryLines,
      orderSummaryPdfPath: result?.orderSummaryPdfPath,
      pdfAdminUrl: `/api/admin/orders/pdf?id=${encodeURIComponent(orderId)}`,
      emailSent: result?.emailSent,
    });

    return NextResponse.json({
      ok: true,
      verified: true,
      orderId,
      status: "paid",
      message: SUCCESS_TH,
      successMessage: SUCCESS_TH,
      emailSent: result?.emailSent ?? false,
      orderSummary: {
        customerName: paidOrder?.buyerName ?? order.buyerName ?? null,
        customerPhone: paidOrder?.buyerPhone ?? order.buyerPhone ?? null,
        lines: summaryLines,
        orderSummaryPdfPath: result?.orderSummaryPdfPath ?? null,
      },
      downloadToken: result?.grants[0]?.token,
      downloads: result?.grants.map((g) => ({
        token: g.token,
        planId: g.planId,
        format: g.format,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "อัปโหลดสลิปไม่สำเร็จ";
    console.error("[payments/slip] exception", err);
    return NextResponse.json(
      { ok: false, error: message, detail: message, message },
      { status: 500 },
    );
  }
}

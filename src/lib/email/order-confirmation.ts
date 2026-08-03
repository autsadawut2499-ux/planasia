import "server-only";

import type { CartOrder } from "@/lib/store/cart-orders";
import type { DownloadGrant } from "@/lib/payments/tokens";
import type { PostPaymentTranslationResult } from "@/lib/gemini/post-payment-translation";
import {
  documentLanguageToStampLocale,
  getDocumentLanguage,
} from "@/lib/store/document-languages";
import {
  findListingIdByPlanCode,
  filenameFromUrl,
  getListingBlueprintUrls,
} from "@/lib/store/listing-assets";
import { fetchAssetBytes, parsePrivateAssetRef } from "@/lib/supabase/private-assets";
import { getSiteUrl } from "@/lib/seo/site-url";

/** Resend total payload limit is ~40MB; keep headroom for HTML/headers. */
const MAX_ATTACHMENT_BYTES_TOTAL = 28 * 1024 * 1024;
/** Skip individual files that would dominate the message alone. */
const MAX_ATTACHMENT_BYTES_EACH = 20 * 1024 * 1024;

export type OrderEmailAttachment = {
  filename: string;
  content: string; // base64
  contentType?: string;
};

/**
 * Buyer payment receipt + house-plan delivery email (Resend).
 * Attaches vendor blueprint PDFs when size allows; always includes download links.
 */
export async function sendOrderConfirmationEmail(
  order: CartOrder,
  grants: DownloadGrant[] = [],
  translation?: PostPaymentTranslationResult,
): Promise<boolean> {
  const email = order.buyerEmail?.trim();
  if (!email) return false;

  const thai = (order.documentLanguage ?? "th") === "th";
  const lang = order.documentLanguage
    ? getDocumentLanguage(order.documentLanguage)
    : getDocumentLanguage("th");
  const stampLocale = documentLanguageToStampLocale(order.documentLanguage ?? "th");
  const baseUrl = getSiteUrl().replace(/\/$/, "");
  const buyerLabel = order.buyerName?.trim() || (thai ? "ผู้ซื้อที่ได้รับอนุญาต" : "Licensed buyer");
  const buyer = encodeURIComponent(buyerLabel);
  const paidAt = new Date().toLocaleString(thai ? "th-TH" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const amount = `฿${Number(order.total).toLocaleString("th-TH")}`;
  const targetCountry = order.targetCountry ?? translation?.target_country ?? "TH";
  const blueprintPacks = translation?.blueprints?.length
    ? translation.blueprints
    : (translation?.listings ?? []).flatMap((L) => L.blueprints ?? []);
  const localizationReady =
    translation?.status === "completed" &&
    (blueprintPacks.length > 0 || (translation.listings?.length ?? 0) > 0);

  const downloadEntries = grants.map((g) => {
    const url = `${baseUrl}/api/download?token=${g.token}&format=${g.format}&locale=${stampLocale}&buyer=${buyer}&docLang=${order.documentLanguage ?? "th"}`;
    const label = `${g.planId} (${g.format.toUpperCase()})${
      typeof g.fileIndex === "number" && g.fileIndex > 0 ? ` · file ${g.fileIndex + 1}` : ""
    }`;
    return { label, url, grant: g };
  });

  const attachments = await buildPlanAttachments(grants);
  const translationAttachments = await buildTranslationAttachments(translation);
  for (const att of translationAttachments) {
    attachments.push(att);
  }

  const addonNotes = [
    order.addons.includes("boq-bundle")
      ? thai
        ? "แพ็ค BOQ เสริม: รวมอยู่ในคำสั่งซื้อนี้"
        : "BOQ bundle add-on: included in this order"
      : null,
    order.addons.includes("hardcopy-3sets")
      ? thai
        ? "รับเอกสารรูปเล่ม 3 ชุด: รวมอยู่ในคำสั่งซื้อ — ทีมงานจะติดต่อจัดส่ง"
        : "Hard-copy documents (3 sets): included — our team will contact you for delivery"
      : null,
  ].filter(Boolean) as string[];

  const itemLines = order.items.map((item) => {
    const price = `฿${Number(item.price).toLocaleString("th-TH")}`;
    return thai
      ? `• ${item.planId} — ${item.name} (${price})`
      : `• ${item.planId} — ${item.name} (${price})`;
  });

  const subject = thai
    ? `Planasia — ใบยืนยันการชำระเงินและไฟล์แบบบ้าน · ${order.id}`
    : `Planasia — Payment receipt & house plan files · ${order.id}`;

  const attachmentNote =
    attachments.length > 0
      ? thai
        ? `ไฟล์แบบบ้านที่แนบมาด้วย (${attachments.length} ไฟล์): ${attachments.map((a) => a.filename).join(", ")}`
        : `Attached house-plan file(s) (${attachments.length}): ${attachments.map((a) => a.filename).join(", ")}`
      : thai
        ? "ไฟล์แนบมีขนาดใหญ่เกินไปสำหรับอีเมล — ใช้ลิงก์ดาวน์โหลดด้านล่างแทน"
        : "Attachments were too large for email — use the download links below instead";

  const linkBlockText =
    downloadEntries.length > 0
      ? downloadEntries.map((d) => `• ${d.label}\n  ${d.url}`).join("\n")
      : thai
        ? "ลิงก์ดาวน์โหลดจะเปิดในเบราว์เซอร์หลังชำระเงินสำเร็จ"
        : "Download links open in your browser after payment succeeds";

  const localizationTextBlock: Array<string | null> = localizationReady
    ? [
        "",
        thai
          ? `—— แบบบ้านแปลภาษา (Google Cloud Document Translation · ${targetCountry}${translation?.target_language ? ` · ${translation.target_language}` : ""}) ——`
          : `—— Localized blueprint PDF (Google Cloud Document Translation · ${targetCountry}${translation?.target_language ? ` · ${translation.target_language}` : ""}) ——`,
        ...(blueprintPacks.length > 0
          ? blueprintPacks.map(
              (b) =>
                `• ${b.sourceFilename} → ${b.translatedFilename} (${Math.round((b.translatedBytes || b.sourceBytes) / 1024)} KB)`,
            )
          : translation!.listings.map((L) => `• ${L.planId} — ${L.name}`)),
        translationAttachments.length > 0
          ? thai
            ? `\nไฟล์แปลแนบ (PDF): ${translationAttachments.map((a) => a.filename).join(", ")}`
            : `\nTranslated PDF(s) attached: ${translationAttachments.map((a) => a.filename).join(", ")}`
          : null,
        thai
          ? "หมายเหตุ: ไฟล์ PDF ต้นฉบับยังดาวน์โหลดได้ตามลิงก์ด้านล่าง — ไฟล์แปลเป็น PDF ที่รักษาเลย์เอาต์"
          : "Note: Original blueprint PDFs remain available via the download links below — translated files are layout-preserving PDFs.",
      ]
    : targetCountry !== "TH"
      ? [
          "",
          thai
            ? `ประเทศเป้าหมาย: ${targetCountry} — แพ็กแปลแบบบ้าน PDF อาจยังกำลังประมวลผล หรือยังไม่พร้อมในอีเมลนี้`
            : `Target country: ${targetCountry} — full blueprint PDF translation may still be processing or was unavailable for this email`,
        ]
      : [];

  const text = (
    thai
      ? [
          `สวัสดี ${order.buyerName || "ลูกค้า"},`,
          "",
          "ขอบคุณที่สั่งซื้อแบบบ้านกับ Planasia — การชำระเงินของคุณสำเร็จแล้ว",
          "",
          "—— ใบยืนยันการชำระเงิน ——",
          `หมายเลขคำสั่งซื้อ: ${order.id}`,
          `วันที่ชำระเงิน: ${paidAt}`,
          `ภาษาเอกสาร: ${lang.short} — ${lang.nameTh} / ${lang.nameEn}`,
          `ประเทศเป้าหมาย: ${targetCountry}`,
          `ยอดชำระ: ${amount}`,
          order.stripeSessionId ? `รหัสอ้างอิงการชำระเงิน: ${order.stripeSessionId}` : null,
          "",
          "รายการ:",
          ...itemLines,
          ...addonNotes,
          ...localizationTextBlock,
          "",
          attachmentNote,
          "",
          "ดาวน์โหลดไฟล์แบบบ้าน (สำรอง / หมดอายุใน 7 วัน):",
          linkBlockText,
          "",
          "เมื่อดาวน์โหลดแบบแปลนสำเร็จแล้ว จะไม่คืนเงินเพราะเปลี่ยนใจ — ดูนโยบายคืนเงินที่เว็บไซต์",
          "",
          "— Planasia",
          "hello@planasia.com",
        ]
      : [
          `Hello ${order.buyerName || "Customer"},`,
          "",
          "Thank you for purchasing from Planasia — your payment was successful.",
          "",
          "—— Payment receipt ——",
          `Order ID: ${order.id}`,
          `Paid at: ${paidAt}`,
          `Document language: ${lang.short} — ${lang.nameEn} / ${lang.nameTh}`,
          `Target country: ${targetCountry}`,
          `Amount paid: ${amount}`,
          order.stripeSessionId ? `Payment reference: ${order.stripeSessionId}` : null,
          "",
          "Items:",
          ...itemLines,
          ...addonNotes,
          ...localizationTextBlock,
          "",
          attachmentNote,
          "",
          "House-plan downloads (backup / expire in 7 days):",
          linkBlockText,
          "",
          "After a successful blueprint download, refunds are not given for change of mind — see our Refund Policy.",
          "",
          "— Planasia",
          "hello@planasia.com",
        ]
  )
    .filter((line) => line !== null)
    .join("\n");

  const htmlDownloads =
    downloadEntries.length > 0
      ? `<ul style="padding-left:18px;margin:8px 0">${downloadEntries
          .map(
            (d) =>
              `<li style="margin:6px 0"><a href="${escapeHtml(d.url)}" style="color:#1e40af;font-weight:600">${escapeHtml(d.label)}</a></li>`,
          )
          .join("")}</ul>`
      : `<p>${thai ? "ลิงก์ดาวน์โหลดจะเปิดในเบราว์เซอร์หลังชำระเงินสำเร็จ" : "Download links open in your browser after payment succeeds"}</p>`;

  const htmlItems = `<ul style="padding-left:18px;margin:8px 0">${order.items
    .map(
      (item) =>
        `<li style="margin:4px 0"><strong>${escapeHtml(item.planId)}</strong> — ${escapeHtml(item.name)} <span style="color:#64748b">(฿${Number(item.price).toLocaleString("th-TH")})</span></li>`,
    )
    .join("")}</ul>`;

  const htmlAttached =
    attachments.length > 0
      ? `<p style="margin:12px 0 4px"><strong>${thai ? "ไฟล์แนบในอีเมลนี้" : "Files attached to this email"}</strong></p>
         <ul style="padding-left:18px;margin:4px 0">${attachments
           .map((a) => `<li>${escapeHtml(a.filename)}</li>`)
           .join("")}</ul>`
      : `<p style="color:#64748b;font-size:13px">${escapeHtml(
          thai
            ? "ไม่ได้แนบไฟล์ในอีเมล (ขนาดใหญ่เกินไป) — ใช้ลิงก์ดาวน์โหลดด้านล่าง"
            : "No files attached (too large for email) — use the download links below",
        )}</p>`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.55;color:#0f172a;max-width:560px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#1e3a8a,#1e40af);color:#fff;padding:20px 22px;border-radius:12px 12px 0 0">
        <p style="margin:0;font-size:13px;opacity:.9">${thai ? "ใบยืนยันการชำระเงิน" : "Payment confirmation"}</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:700">Planasia</h1>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:0;padding:22px;border-radius:0 0 12px 12px;background:#fff">
        <p style="margin-top:0">${thai ? "สวัสดี" : "Hello"} <strong>${escapeHtml(order.buyerName || (thai ? "ลูกค้า" : "Customer"))}</strong>,</p>
        <p>${
          thai
            ? "ขอบคุณที่สั่งซื้อแบบบ้านกับ <strong>Planasia</strong> — การชำระเงินของคุณสำเร็จแล้ว ไฟล์แบบบ้านถูกส่งมาพร้อมอีเมลนี้ (และมีลิงก์ดาวน์โหลดสำรองด้านล่าง)"
            : "Thank you for purchasing from <strong>Planasia</strong> — your payment succeeded. Your house-plan file(s) are attached when possible, with backup download links below."
        }</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;background:#f8fafc;border-radius:8px">
          <tr>
            <td style="padding:10px 12px;color:#64748b;width:42%">${thai ? "หมายเลขคำสั่งซื้อ" : "Order ID"}</td>
            <td style="padding:10px 12px;font-family:ui-monospace,monospace">${escapeHtml(order.id)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b">${thai ? "วันที่ชำระเงิน" : "Paid at"}</td>
            <td style="padding:10px 12px">${escapeHtml(paidAt)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b">${thai ? "ภาษาเอกสาร" : "Document language"}</td>
            <td style="padding:10px 12px">${escapeHtml(lang.short)} — ${escapeHtml(thai ? lang.nameTh : lang.nameEn)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b">${thai ? "ประเทศเป้าหมาย" : "Target country"}</td>
            <td style="padding:10px 12px">${escapeHtml(targetCountry)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#64748b">${thai ? "ยอดชำระ" : "Amount paid"}</td>
            <td style="padding:10px 12px;font-size:18px;font-weight:700;color:#1e40af">${escapeHtml(amount)}</td>
          </tr>
        </table>

        <p style="margin-bottom:4px"><strong>${thai ? "รายการที่ซื้อ" : "Items purchased"}</strong></p>
        ${htmlItems}
        ${addonNotes.map((n) => `<p style="margin:6px 0;font-size:13px">${escapeHtml(n)}</p>`).join("")}

        ${htmlAttached}

        ${
          localizationReady
            ? `<div style="margin:18px 0;padding:14px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px">
                <p style="margin:0 0 8px;font-weight:700;color:#1e3a8a">
                  ${
                    thai
                      ? `แบบบ้านแปลภาษา (Google Cloud · ${escapeHtml(targetCountry)}${translation?.target_language ? ` · ${escapeHtml(translation.target_language)}` : ""})`
                      : `Localized blueprint PDF (Google Cloud · ${escapeHtml(targetCountry)}${translation?.target_language ? ` · ${escapeHtml(translation.target_language)}` : ""})`
                  }
                </p>
                <ul style="margin:0;padding-left:18px;font-size:13px">
                  ${(blueprintPacks.length > 0
                    ? blueprintPacks
                    : translation!.listings.map((L) => ({
                        sourceFilename: L.planId,
                        translatedFilename: L.name,
                        sourceBytes: 0,
                      }))
                  )
                    .map(
                      (b) =>
                        `<li style="margin:4px 0"><strong>${escapeHtml(b.sourceFilename)}</strong>${
                          "translatedFilename" in b && b.translatedFilename
                            ? ` → ${escapeHtml(String(b.translatedFilename))}`
                            : ""
                        }</li>`,
                    )
                    .join("")}
                </ul>
                ${
                  translationAttachments.length > 0
                    ? `<p style="margin:10px 0 0;font-size:12px;color:#475569">${
                        thai
                          ? "ไฟล์แปลแนบในอีเมลนี้ (PDF)"
                          : "Translated PDF(s) attached to this email"
                      }: ${escapeHtml(translationAttachments.map((a) => a.filename).join(", "))}</p>`
                    : ""
                }
                <p style="margin:8px 0 0;font-size:12px;color:#64748b">
                  ${
                    thai
                      ? "PDF ต้นฉบับยังดาวน์โหลดได้จากลิงก์ด้านล่าง"
                      : "Original blueprint PDFs remain available from the download links below"
                  }
                </p>
              </div>`
            : targetCountry !== "TH"
              ? `<p style="margin:14px 0;font-size:13px;color:#64748b">${
                  thai
                    ? `ประเทศเป้าหมาย: ${escapeHtml(targetCountry)} — แพ็กแปลแบบบ้าน PDF อาจยังประมวลผลอยู่`
                    : `Target country: ${escapeHtml(targetCountry)} — full blueprint PDF translation may still be processing`
                }</p>`
              : ""
        }

        <p style="margin:18px 0 4px"><strong>${thai ? "ลิงก์ดาวน์โหลดสำรอง" : "Backup download links"}</strong></p>
        ${htmlDownloads}
        <p style="color:#64748b;font-size:12px;margin-top:8px">
          ${
            thai
              ? "ลิงก์หมดอายุภายใน 7 วัน — กรุณาบันทึกไฟล์ไว้ในเครื่อง เมื่อดาวน์โหลดสำเร็จแล้วจะไม่คืนเงินเพราะเปลี่ยนใจ"
              : "Links expire in 7 days — please save the files locally. After a successful download, refunds are not given for change of mind."
          }
        </p>

        <p style="margin:24px 0 0;font-size:13px;color:#64748b">— Planasia · <a href="mailto:hello@planasia.com" style="color:#1e40af">hello@planasia.com</a></p>
      </div>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Planasia <noreply@planasia.com>";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] skipped — set RESEND_API_KEY to send confirmations", {
        orderId: order.id,
        downloads: grants.length,
        attachments: attachments.length,
      });
    } else {
      console.warn(
        "[email] RESEND_API_KEY missing in production — order confirmation not sent",
        { orderId: order.id },
      );
    }
    return false;
  }

  try {
    const payload: Record<string, unknown> = {
      from,
      to: [email],
      subject,
      text,
      html,
    };
    if (attachments.length > 0) {
      payload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        content_type: a.contentType || "application/pdf",
      }));
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[email] resend failed", await res.text());
      return false;
    }
    console.info("[email] confirmation sent", {
      orderId: order.id,
      to: email,
      attachments: attachments.length,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed", err);
    return false;
  }
}

async function buildTranslationAttachments(
  translation?: PostPaymentTranslationResult,
): Promise<OrderEmailAttachment[]> {
  if (translation?.status !== "completed") return [];

  const packs =
    translation.blueprints?.length
      ? translation.blueprints
      : (translation.listings ?? []).flatMap((L) => L.blueprints ?? []);

  const out: OrderEmailAttachment[] = [];
  const used = new Set<string>();
  let total = 0;

  if (packs.length > 0) {
    for (const pack of packs) {
      if (pack.error) continue;

      let contentB64 = pack.pdfBase64;
      let byteLength = pack.translatedBytes || 0;

      if (!contentB64 && pack.translatedStorageRef) {
        const asset = await fetchAssetBytes(pack.translatedStorageRef);
        if (asset?.bytes?.length) {
          contentB64 = asset.bytes.toString("base64");
          byteLength = asset.bytes.length;
        }
      }

      // Legacy Gemini markdown packs (older orders)
      if (!contentB64 && (pack.markdownBase64 || pack.markdown)) {
        let filename = pack.translatedFilename || `translated-${translation.target_country}.md`;
        if (!filename.toLowerCase().endsWith(".md")) filename = `${filename}.md`;
        filename = uniquifyFilename(filename, used);
        used.add(filename.toLowerCase());
        out.push({
          filename,
          content: pack.markdownBase64 || Buffer.from(pack.markdown!, "utf8").toString("base64"),
          contentType: "text/markdown; charset=utf-8",
        });
        continue;
      }

      if (!contentB64) continue;
      if (byteLength > MAX_ATTACHMENT_BYTES_EACH) {
        console.warn("[email] skip oversized translated file", {
          file: pack.translatedFilename,
          bytes: byteLength,
        });
        continue;
      }
      if (total + byteLength > MAX_ATTACHMENT_BYTES_TOTAL) {
        console.warn("[email] translation attachment budget reached", {
          file: pack.translatedFilename,
        });
        break;
      }

      const isMarkdown =
        pack.mode === "ocr-text-translation" ||
        (pack.mimeType?.includes("markdown") ?? false) ||
        (pack.translatedFilename?.toLowerCase().endsWith(".md") ?? false);

      let filename =
        pack.translatedFilename ||
        `translated-${translation.target_country}.${isMarkdown ? "md" : "pdf"}`;
      if (isMarkdown) {
        if (!filename.toLowerCase().endsWith(".md")) filename = `${filename}.md`;
      } else if (!filename.toLowerCase().endsWith(".pdf")) {
        filename = `${filename}.pdf`;
      }
      filename = uniquifyFilename(filename, used);
      used.add(filename.toLowerCase());
      out.push({
        filename,
        content: contentB64,
        contentType:
          pack.mimeType ||
          (isMarkdown ? "text/markdown; charset=utf-8" : "application/pdf"),
      });
      total += byteLength;
    }
    return out;
  }

  // Legacy fallback: listing document_translation text packs
  for (const listing of translation.listings ?? []) {
    if (!listing.document_translation?.trim()) continue;
    let filename = `translated-${listing.planId}-${translation.target_country}.md`;
    filename = uniquifyFilename(filename, used);
    used.add(filename.toLowerCase());
    out.push({
      filename,
      content: Buffer.from(listing.document_translation, "utf8").toString("base64"),
      contentType: "text/markdown; charset=utf-8",
    });
  }
  return out;
}

async function buildPlanAttachments(
  grants: DownloadGrant[],
): Promise<OrderEmailAttachment[]> {
  const pdfGrants = grants.filter((g) => g.format === "pdf");
  const attachments: OrderEmailAttachment[] = [];
  let total = 0;
  const usedNames = new Set<string>();

  for (const grant of pdfGrants) {
    const listingId =
      grant.listingId || (await findListingIdByPlanCode(grant.planId)) || undefined;
    if (!listingId) continue;

    const urls = await getListingBlueprintUrls(listingId);
    const index = Math.min(Math.max(0, grant.fileIndex ?? 0), Math.max(0, urls.length - 1));
    const sourceUrl = urls[index];
    if (!sourceUrl) continue;

    const asset = await fetchAssetBytes(sourceUrl);
    if (!asset?.bytes?.length) {
      console.warn("[email] attachment fetch failed", { planId: grant.planId, index });
      continue;
    }
    if (asset.bytes.length > MAX_ATTACHMENT_BYTES_EACH) {
      console.warn("[email] skip oversized attachment", {
        planId: grant.planId,
        bytes: asset.bytes.length,
      });
      continue;
    }
    if (total + asset.bytes.length > MAX_ATTACHMENT_BYTES_TOTAL) {
      console.warn("[email] attachment budget reached — remaining files via download links", {
        planId: grant.planId,
      });
      break;
    }

    const fallback = `${grant.planId}-${index + 1}.pdf`;
    let filename = safeAttachmentFilename(sourceUrl, fallback);
    if (!filename.toLowerCase().endsWith(".pdf")) filename = `${filename}.pdf`;
    filename = uniquifyFilename(filename, usedNames);
    usedNames.add(filename.toLowerCase());

    attachments.push({
      filename,
      content: asset.bytes.toString("base64"),
      contentType: asset.contentType || "application/pdf",
    });
    total += asset.bytes.length;
  }

  return attachments;
}

function safeAttachmentFilename(sourceUrl: string, fallback: string): string {
  const privateParsed = parsePrivateAssetRef(sourceUrl);
  if (privateParsed) {
    const base = privateParsed.path.split("/").pop() || fallback;
    return decodeURIComponent(base).replace(/[^\w.\-()+ ]+/g, "_") || fallback;
  }
  return filenameFromUrl(sourceUrl, fallback);
}

function uniquifyFilename(name: string, used: Set<string>): string {
  if (!used.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let i = 2;
  while (used.has(`${stem}-${i}${ext}`.toLowerCase())) i += 1;
  return `${stem}-${i}${ext}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

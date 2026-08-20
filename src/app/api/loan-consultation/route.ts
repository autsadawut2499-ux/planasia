import { NextRequest, NextResponse } from "next/server";
import { generateLoanConsultationPdf } from "@/lib/loan-consultation/pdf";
import { sendLoanConsultationToLineExpert } from "@/lib/loan-consultation/line-deliver";
import {
  normalizeLoanConsultationInput,
  saveLoanConsultation,
  updateLoanConsultationDelivery,
} from "@/lib/supabase/loan-consultations";
import { loadLoanConsultationSettings } from "@/lib/supabase/loan-consultation-settings";
import {
  createPrivateSignedReadUrl,
  uploadPrivateBytes,
} from "@/lib/supabase/private-assets";

export const runtime = "nodejs";

/** Public form submission — save, generate PDF, notify expert LINE. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = normalizeLoanConsultationInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const saved = await saveLoanConsultation(parsed.data);

    let pdfOk = false;
    let lineOk = false;
    let lineError: string | undefined;

    try {
      const pdfBytes = await generateLoanConsultationPdf(saved);
      const storagePath = `loan-consultations/${saved.id}.pdf`;
      const ref = await uploadPrivateBytes({
        path: storagePath,
        bytes: Buffer.from(pdfBytes),
        contentType: "application/pdf",
        upsert: true,
      });

      if (!ref) {
        await updateLoanConsultationDelivery(saved.id, {
          lineNotifyError: "อัปโหลด PDF ไม่สำเร็จ",
        });
      } else {
        pdfOk = true;
        await updateLoanConsultationDelivery(saved.id, {
          pdfStoragePath: storagePath,
        });

        const settings = await loadLoanConsultationSettings();
        const pdfUrl = await createPrivateSignedReadUrl(storagePath, 60 * 60 * 24 * 7);
        if (!pdfUrl) {
          lineError = "สร้างลิงก์ดาวน์โหลด PDF ไม่สำเร็จ";
          await updateLoanConsultationDelivery(saved.id, {
            lineNotifyError: lineError,
          });
        } else {
          const delivered = await sendLoanConsultationToLineExpert({
            consultation: saved,
            settings,
            pdfUrl,
          });
          if (delivered.ok) {
            lineOk = true;
            await updateLoanConsultationDelivery(saved.id, {
              lineNotifiedAt: new Date().toISOString(),
              lineNotifyError: null,
            });
          } else {
            lineError = delivered.error || "ส่ง LINE ไม่สำเร็จ";
            await updateLoanConsultationDelivery(saved.id, {
              lineNotifyError: lineError,
            });
          }
        }
      }
    } catch (err) {
      lineError = err instanceof Error ? err.message : "สร้าง/ส่ง PDF ไม่สำเร็จ";
      console.error("[loan-consultation] pdf/line", err);
      try {
        await updateLoanConsultationDelivery(saved.id, {
          lineNotifyError: lineError,
        });
      } catch {
        /* ignore secondary failure */
      }
    }

    return NextResponse.json({
      ok: true,
      id: saved.id,
      pdfGenerated: pdfOk,
      lineNotified: lineOk,
      lineError: lineOk ? undefined : lineError,
      message:
        "รับข้อมูลแล้ว — ทีมที่ปรึกษาจะติดต่อกลับเพื่อช่วยวางแผนสินเชื่อบ้าน",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

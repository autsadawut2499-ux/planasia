import "server-only";

import { publicBankDetails } from "@/lib/payments/settings";
import { loadPaymentSettings } from "@/lib/supabase/payment-settings";

/** Shared bank-transfer checkout payload after creating an awaiting_payment order. */
export async function bankTransferCheckoutResponse(opts: {
  orderId: string;
  amountThb: number;
  currency: string;
  documentLanguage?: string;
  planId?: string;
  planDocumentId?: string | null;
}) {
  const settings = await loadPaymentSettings();
  const bank = publicBankDetails(settings);

  if (!bank.configured) {
    return {
      error: true as const,
      status: 503,
      body: {
        error:
          "ยังไม่ได้ตั้งค่าบัญชีรับโอน — แอดมินกรอกได้ที่ การตั้งค่าการชำระเงิน",
        orderId: opts.orderId,
      },
    };
  }

  return {
    error: false as const,
    body: {
      requiresBankTransfer: true,
      orderId: opts.orderId,
      amount: opts.amountThb,
      amountThb: opts.amountThb,
      currency: opts.currency,
      documentLanguage: opts.documentLanguage,
      planId: opts.planId,
      planDocumentId: opts.planDocumentId,
      bank: {
        bankName: bank.bankName,
        accountName: bank.accountName,
        accountNumber: bank.accountNumber,
        promptPayId: bank.promptPayId,
        qrCodeImageUrl: bank.qrCodeImageUrl,
        transferNote: bank.transferNote,
      },
      message:
        "โอนเงินตามยอดด้านล่าง แล้วอัปโหลดสลิปเพื่อยืนยันอัตโนมัติ",
    },
  };
}

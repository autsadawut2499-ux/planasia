/** Admin-managed bank transfer display settings (SlipMate key lives in env only). */

export interface PaymentBankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  /** Optional PromptPay ID (phone / national ID / e-wallet). */
  promptPayId: string;
  /** Public URL of the PromptPay / bank QR image shown at checkout. */
  qrCodeImageUrl: string;
  /** Optional instructions shown to buyers. */
  transferNote: string;
}

export interface PaymentSettings {
  bank: PaymentBankAccount;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bank: {
    bankName: "",
    accountName: "",
    accountNumber: "",
    promptPayId: "",
    qrCodeImageUrl: "",
    transferNote:
      "โอนตามยอดที่แสดงในหน้าชำระเงิน แล้วอัปโหลดสลิปเพื่อยืนยันอัตโนมัติ",
  },
};

export function normalizePaymentSettings(raw: unknown): PaymentSettings {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const bank = (o.bank && typeof o.bank === "object" ? o.bank : {}) as Record<
    string,
    unknown
  >;

  return {
    bank: {
      bankName: String(bank.bankName ?? "").trim().slice(0, 120),
      accountName: String(bank.accountName ?? "").trim().slice(0, 120),
      accountNumber: String(bank.accountNumber ?? "")
        .replace(/\s+/g, "")
        .trim()
        .slice(0, 40),
      promptPayId: String(bank.promptPayId ?? bank.promptpayId ?? "")
        .replace(/\s+/g, "")
        .trim()
        .slice(0, 40),
      qrCodeImageUrl: String(
        bank.qrCodeImageUrl ?? bank.qrCodeUrl ?? bank.qrImageUrl ?? "",
      )
        .trim()
        .slice(0, 800),
      transferNote: String(
        bank.transferNote ?? DEFAULT_PAYMENT_SETTINGS.bank.transferNote,
      )
        .trim()
        .slice(0, 500),
    },
  };
}

/** Public-safe bank details (never expose API keys). */
export function publicBankDetails(settings: PaymentSettings): PaymentBankAccount & {
  configured: boolean;
} {
  const { bank } = settings;
  const configured = Boolean(
    bank.accountNumber || bank.promptPayId || bank.accountName,
  );
  return { ...bank, configured };
}

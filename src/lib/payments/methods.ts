import type { Currency } from "@/lib/currency";

export type PaymentMethodId = "promptpay" | "card";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  /** Stripe Checkout payment_method_types value. */
  stripeType: "promptpay" | "card";
  label: string;
  /** Thai label for domestic storefront. */
  labelTh: string;
  available: boolean;
  reasonUnavailable?: string;
  reasonUnavailableTh?: string;
}

/** PromptPay for THB (Thailand); card for domestic + international USD. */
export function availablePaymentMethods(
  currency: Currency,
  countryCode: string,
): PaymentMethodOption[] {
  const isTh = countryCode.toUpperCase() === "TH";
  return [
    {
      id: "promptpay",
      stripeType: "promptpay",
      label: "PromptPay",
      labelTh: "พร้อมเพย์",
      available: currency === "THB" && isTh,
      reasonUnavailable:
        currency !== "THB"
          ? "PromptPay is only available when paying in THB"
          : "PromptPay is only available for Thailand",
      reasonUnavailableTh:
        currency !== "THB"
          ? "พร้อมเพย์ใช้ได้เฉพาะเมื่อชำระเป็นบาท"
          : "พร้อมเพย์ใช้ได้เฉพาะในประเทศไทย",
    },
    {
      id: "card",
      stripeType: "card",
      label: currency === "USD" ? "International card (USD)" : "Card",
      labelTh: currency === "USD" ? "บัตรต่างประเทศ (USD)" : "บัตรเครดิต/เดบิต",
      available: true,
    },
  ];
}

export function defaultPaymentMethod(currency: Currency, countryCode: string): PaymentMethodId {
  const methods = availablePaymentMethods(currency, countryCode);
  const preferred = methods.find((m) => m.available && m.id === "promptpay");
  return preferred?.id ?? "card";
}

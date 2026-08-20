import type { Currency } from "@/lib/currency";

/** Only bank transfer with slip verification is supported. */
export type PaymentMethodId = "bank_transfer";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  labelTh: string;
  available: boolean;
  reasonUnavailable?: string;
  reasonUnavailableTh?: string;
}

export function availablePaymentMethods(
  _currency?: Currency,
  _countryCode?: string,
): PaymentMethodOption[] {
  return [
    {
      id: "bank_transfer",
      label: "Bank transfer + slip",
      labelTh: "โอนเงิน / อัปโหลดสลิป",
      available: true,
    },
  ];
}

export function defaultPaymentMethod(
  _currency?: Currency,
  _countryCode?: string,
): PaymentMethodId {
  return "bank_transfer";
}

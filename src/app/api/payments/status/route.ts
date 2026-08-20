import { NextResponse } from "next/server";
import { loadPaymentSettings } from "@/lib/supabase/payment-settings";
import { publicBankDetails } from "@/lib/payments/settings";
import { isSlipmateConfigured } from "@/lib/payments/slipmate-config";

export const dynamic = "force-dynamic";

/** Public payment stack status (no secrets). */
export async function GET() {
  const settings = await loadPaymentSettings();
  const bank = publicBankDetails(settings);
  const slipmateConfigured = isSlipmateConfigured();

  return NextResponse.json({
    provider: "slipmate",
    stripeRemoved: true,
    bankConfigured: bank.configured,
    autoVerifyEnabled: true,
    slipApiConfigured: slipmateConfigured,
    ready: bank.configured && slipmateConfigured,
    message: !bank.configured
      ? "Configure bank account in Admin → Payment Settings"
      : !slipmateConfigured
        ? "Set SLIPMATE_API_KEY in Vercel Environment Variables (Production), then redeploy — until then slip uploads queue for manual review"
        : "Bank transfer + SlipMate verification ready",
  });
}

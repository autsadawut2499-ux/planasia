import { NextResponse } from "next/server";

/** Stripe Checkout removed — use /api/store/cart/checkout + /api/payments/slip */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Stripe ถูกถอดออกแล้ว — ชำระด้วยโอนธนาคารและอัปโหลดสลิปที่หน้า checkout",
      code: "STRIPE_REMOVED",
    },
    { status: 410 },
  );
}

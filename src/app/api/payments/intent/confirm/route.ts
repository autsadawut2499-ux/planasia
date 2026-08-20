import { NextResponse } from "next/server";

/** Stripe PaymentIntent confirm removed. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe ถูกถอดออกแล้ว — ใช้โอนธนาคาร + อัปโหลดสลิป",
      code: "STRIPE_REMOVED",
    },
    { status: 410 },
  );
}

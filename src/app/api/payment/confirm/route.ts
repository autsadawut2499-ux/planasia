import { NextResponse } from "next/server";

const gone = () =>
  NextResponse.json(
    {
      error: "Stripe ถูกถอดออกแล้ว — ใช้การตรวจสลิปอัตโนมัติ",
      code: "STRIPE_REMOVED",
    },
    { status: 410 },
  );

/** Stripe session confirm removed. */
export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}

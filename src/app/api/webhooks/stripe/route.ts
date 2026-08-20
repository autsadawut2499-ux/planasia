import { NextResponse } from "next/server";

/** Stripe webhooks disabled — payments use slip verification. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe webhook disabled — bank transfer + slip verification only",
      code: "STRIPE_REMOVED",
    },
    { status: 410 },
  );
}

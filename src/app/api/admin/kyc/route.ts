import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { listVendorKyc, reviewVendorKyc, type VerificationStatus } from "@/lib/supabase/vendors";

export const dynamic = "force-dynamic";

const STATUSES: VerificationStatus[] = ["unverified", "pending", "approved", "rejected"];

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam && STATUSES.includes(statusParam as VerificationStatus)
        ? (statusParam as VerificationStatus)
        : undefined;
    const submissions = await listVendorKyc(status);
    return NextResponse.json({ submissions });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = await request.json();
    const ownerKey = String(body.ownerKey ?? "");
    const decision = body.decision === "approved" ? "approved" : body.decision === "rejected" ? "rejected" : null;
    if (!ownerKey || !decision) {
      return NextResponse.json({ error: "ownerKey and decision are required" }, { status: 400 });
    }
    if (decision === "rejected" && !String(body.reason ?? "").trim()) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
    }
    await reviewVendorKyc(ownerKey, decision, admin.email, body.reason ? String(body.reason).trim() : undefined);
    return NextResponse.json({ ok: true, ownerKey, decision });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to review";
    return NextResponse.json({ error: message }, { status: message.includes("Unauthorized") ? 401 : 500 });
  }
}

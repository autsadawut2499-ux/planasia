import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  countListingsForSupplier,
  deleteSupplier,
  getSupplierById,
  updateSupplier,
} from "@/lib/supabase/suppliers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supplier = await getSupplierById(id);
    if (!supplier) {
      return NextResponse.json({ error: "ไม่พบซัพพลายเออร์" }, { status: 404 });
    }
    const listingCount = await countListingsForSupplier(id);
    return NextResponse.json({ supplier, listingCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อซัพพลายเออร์" }, { status: 400 });
    }
    const supplier = await updateSupplier(id, name);
    return NextResponse.json({ supplier });
  } catch (err) {
    const message = err instanceof Error ? err.message : "อัปเดตไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    const status =
      message.includes("อยู่แล้ว") ||
      message.includes("ยาว") ||
      message.includes("ไม่ได้") ||
      message.includes("ไม่พบ")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await deleteSupplier(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ลบไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    const status =
      message.includes("ลบไม่ได้") || message.includes("ไม่พบ") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

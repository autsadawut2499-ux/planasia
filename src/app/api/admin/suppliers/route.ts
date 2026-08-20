import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  createSupplier,
  listSuppliers,
} from "@/lib/supabase/suppliers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const suppliers = await listSuppliers();
    return NextResponse.json({ suppliers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อซัพพลายเออร์" }, { status: 400 });
    }
    const supplier = await createSupplier(name);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "สร้างไม่สำเร็จ";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    const status = message.includes("อยู่แล้ว") || message.includes("ยาว") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

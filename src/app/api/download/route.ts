import { NextRequest, NextResponse } from "next/server";

import { findValidGrant } from "@/lib/payments/tokens";

import { loadPlanDocument } from "@/lib/plans/store";

import { generatePlanPdf } from "@/lib/pdf/generator";

import { generatePlanDxf } from "@/lib/cad/generator";

import { resolveUnitSystem } from "@/lib/units/format";

import type { UnitSystem } from "@/lib/geo/countries";



export async function GET(request: NextRequest) {

  const token = request.nextUrl.searchParams.get("token");

  const format = request.nextUrl.searchParams.get("format") as "pdf" | "cad" | null;

  const unitSystem = resolveUnitSystem(

    request.nextUrl.searchParams.get("unitSystem") as UnitSystem | null,

    request.nextUrl.searchParams.get("countryCode"),

  );



  if (!token || !format || (format !== "pdf" && format !== "cad")) {

    return NextResponse.json({ error: "Missing token or format" }, { status: 400 });

  }



  const grant = await findValidGrant(token);

  if (!grant) {

    return NextResponse.json({ error: "Invalid or expired download token" }, { status: 403 });

  }



  if (grant.format !== format) {

    return NextResponse.json({ error: "Token format mismatch" }, { status: 403 });

  }



  const plan = await loadPlanDocument(grant.planId);

  if (!plan) {

    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  }



  const filename = `${plan.project.projectName || "house-plan"}-${grant.planId}`;

  const opts = { unitSystem };



  if (format === "pdf") {

    const pdfBytes = await generatePlanPdf(plan, opts);

    return new NextResponse(Buffer.from(pdfBytes), {

      headers: {

        "Content-Type": "application/pdf",

        "Content-Disposition": `attachment; filename="${filename}.pdf"`,

        "Cache-Control": "no-store",

      },

    });

  }



  const dxf = generatePlanDxf(plan, opts);

  return new NextResponse(dxf, {

    headers: {

      "Content-Type": "application/dxf",

      "Content-Disposition": `attachment; filename="${filename}.dxf"`,

      "Cache-Control": "no-store",

    },

  });

}


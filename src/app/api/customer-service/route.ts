import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_SERVICE_SLUGS } from "@/lib/content/customer-service";
import {
  loadCustomerServiceArticle,
  loadCustomerServiceArticles,
} from "@/lib/supabase/customer-service";

/** Public read for customer-service articles. */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (slug) {
    if (!CUSTOMER_SERVICE_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const article = await loadCustomerServiceArticle(slug);
    return NextResponse.json({ article });
  }
  const articles = await loadCustomerServiceArticles();
  return NextResponse.json({ articles });
}

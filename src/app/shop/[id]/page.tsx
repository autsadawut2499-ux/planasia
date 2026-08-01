import { notFound, permanentRedirect } from "next/navigation";
import { listingStorePath } from "@/lib/seo/slug";
import { getListingById, getListingBySlug } from "@/lib/store/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Legacy /shop/[id] → permanent redirect to canonical /store/{slug}. */
export default async function ShopListingRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const listing = (await getListingById(id)) ?? (await getListingBySlug(id));
  if (!listing) notFound();
  permanentRedirect(listingStorePath(listing.slug));
}

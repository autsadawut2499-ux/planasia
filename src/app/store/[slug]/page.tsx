import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildListingMetadata } from "@/lib/seo/metadata";
import { buildListingGraph } from "@/lib/seo/json-ld";
import { listingBreadcrumbItems } from "@/lib/seo/breadcrumbs";
import { buildListingFaqs } from "@/lib/seo/faqs";
import { getAllListingsForSitemap, getListingBySlug } from "@/lib/store/db";
import { isListingPubliclyVisible } from "@/lib/store/listing-purchase";
import { getReviewsForListing, aggregateRating } from "@/lib/supabase/reviews";
import { getDraftsmanByKey } from "@/lib/vendors/directory";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import StoreListingPageClient from "./StoreListingPageClient";

export const dynamicParams = true;
/**
 * ISR: prebuild known slugs, serve cached HTML, refresh every 30 minutes.
 * Publish / moderate / vendor edit calls `revalidateStoreSurfaces` for instant bust.
 */
export const revalidate = 1800;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return [];
  const listings = await getAllListingsForSitemap();
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) {
    return { title: "House Plan Not Found | Planasia" };
  }
  return buildListingMetadata(listing);
}

export default async function StoreListingPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || !isListingPubliclyVisible(listing)) notFound();

  const reviews = await getReviewsForListing(listing.id);
  const rating = aggregateRating(reviews);
  const architect = await getDraftsmanByKey(listing.ownerId).catch(() => null);

  return (
    <>
      <JsonLd
        data={buildListingGraph({
          listing,
          rating,
          reviews,
          architect: architect?.card ?? null,
          breadcrumb: listingBreadcrumbItems(listing),
          faqs: buildListingFaqs(listing),
        })}
      />
      <StoreListingPageClient listing={listing} initialReviews={reviews} initialRating={rating} />
    </>
  );
}

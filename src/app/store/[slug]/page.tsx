import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingJsonLd } from "@/components/seo/ListingJsonLd";
import { buildListingMetadata } from "@/lib/seo/metadata";
import { getAllListingsForSitemap, getListingBySlug } from "@/lib/store/db";
import StoreListingPageClient from "./StoreListingPageClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
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
  if (!listing) notFound();

  return (
    <>
      <ListingJsonLd listing={listing} />
      <StoreListingPageClient listing={listing} />
    </>
  );
}

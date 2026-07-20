import type { Metadata } from "next";
import { buildHomeMetadata } from "@/lib/seo/metadata";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = buildHomeMetadata();

export default function HomePage() {
  return <HomePageClient />;
}

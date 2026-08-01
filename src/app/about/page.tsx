import type { Metadata } from "next";
import { AboutIndex } from "./AboutIndex";
import { buildAboutIndexMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildAboutIndexMetadata();
}

export default function AboutPage() {
  return <AboutIndex />;
}

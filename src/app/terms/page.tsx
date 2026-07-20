import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Planasia design tools and store.",
};

export default function TermsPage() {
  return <TermsPageClient />;
}

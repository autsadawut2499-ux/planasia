import type { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Planasia collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

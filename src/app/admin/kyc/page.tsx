import { getAdminSession } from "@/lib/admin/auth";
import KycClient from "./KycClient";

export const metadata = {
  title: "KYC Audit",
  robots: { index: false, follow: false },
};

export default async function AdminKycPage() {
  const admin = await getAdminSession();
  if (!admin) return null;
  return <KycClient />;
}

import { getAdminSession } from "@/lib/admin/auth";
import PayoutsClient from "./PayoutsClient";

export const metadata = {
  title: "โอนเงินผู้ขาย",
  robots: { index: false, follow: false },
};

export default async function AdminPayoutsPage() {
  const admin = await getAdminSession();
  if (!admin) return null;
  return <PayoutsClient />;
}

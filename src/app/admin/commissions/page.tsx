import { getAdminSession } from "@/lib/admin/auth";
import CommissionsClient from "./CommissionsClient";

export const metadata = {
  title: "ส่วนแบ่งรายได้",
  robots: { index: false, follow: false },
};

export default async function AdminCommissionsPage() {
  const admin = await getAdminSession();
  if (!admin) return null;
  return <CommissionsClient />;
}

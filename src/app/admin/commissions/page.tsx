import { getAdminSession } from "@/lib/admin/auth";
import CommissionsClient from "./CommissionsClient";

export const metadata = {
  title: "ต้นทุน / กำไร",
  robots: { index: false, follow: false },
};

export default async function AdminCommissionsPage() {
  const admin = await getAdminSession();
  if (!admin) return null;
  return <CommissionsClient />;
}

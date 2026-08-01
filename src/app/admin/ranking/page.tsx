import { getAdminSession } from "@/lib/admin/auth";
import RankingClient from "./RankingClient";

export const metadata = {
  title: "Smart Ranking",
  robots: { index: false, follow: false },
};

export default async function AdminRankingPage() {
  const admin = await getAdminSession();
  if (!admin) return null;
  return <RankingClient />;
}

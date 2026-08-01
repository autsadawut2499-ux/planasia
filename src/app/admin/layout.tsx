import { getAdminSession } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "แผงผู้ดูแลระบบ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

  if (!admin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar adminEmail={admin.email} />
      <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}

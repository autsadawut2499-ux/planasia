"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  FileText,
  PanelBottom,
  Images,
  TrendingUp,
  ShieldCheck,
  Percent,
  Banknote,
  Flame,
  ExternalLink,
  LogOut,
  BookOpen,
  Home,
  ImageIcon,
  LayoutGrid,
  FolderKanban,
  HardHat,
  Sparkles,
  Wand2,
  Truck,
  Newspaper,
  Landmark,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard, exact: true },
  { href: "/admin/listings", label: "จัดการแบบบ้าน", icon: Home },
  { href: "/admin/suppliers", label: "ซัพพลายเออร์", icon: Truck },
  { href: "/admin/articles", label: "จัดการบทความ", icon: Newspaper },
  {
    href: "/admin/loan-consultations",
    label: "ปรึกษาสินเชื่อบ้าน",
    icon: Landmark,
  },
  {
    href: "/admin/payment-settings",
    label: "การตั้งค่าการชำระเงิน",
    icon: CreditCard,
  },
  { href: "/admin/orders", label: "คำสั่งซื้อ (Paid)", icon: ShoppingBag },
  { href: "/admin/home-builders", label: "รับสร้างบ้าน", icon: HardHat },
  { href: "/admin/hero-cover", label: "ภาพปกหน้าแรก", icon: ImageIcon },
  { href: "/admin/ai-image-tools", label: "รูปการ์ด AI", icon: Sparkles },
  { href: "/admin/ai-render-guide", label: "คู่มือ AI Rendering", icon: Wand2 },
  { href: "/admin/mega-menu-styles", label: "สไตล์ในเมนู", icon: LayoutGrid },
  { href: "/admin/mega-menu-collections", label: "คอลเลกชันในเมนู", icon: FolderKanban },
  { href: "/admin/kyc", label: "KYC (Audit)", icon: ShieldCheck },
  { href: "/admin/commissions", label: "ต้นทุน / กำไร", icon: Percent },
  { href: "/admin/payouts", label: "โอนเงินผู้ขาย", icon: Banknote },
  { href: "/admin/ranking", label: "Smart Ranking", icon: TrendingUp },
  { href: "/admin/popular", label: "แบบบ้านยอดนิยม", icon: Flame },
  { href: "/admin/brand", label: "แบรนด์และส่วนหัว", icon: Palette },
  { href: "/admin/content", label: "เนื้อหาและ UI", icon: FileText },
  { href: "/admin/plan-includes", label: "แบบประกอบด้วยอะไรบ้าง", icon: BookOpen },
  { href: "/admin/gallery", label: "สไตล์แนะนำ", icon: Images },
  { href: "/admin/footer", label: "ส่วนท้ายเว็บ", icon: PanelBottom },
];

interface AdminSidebarProps {
  adminEmail?: string;
}

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          ผู้ดูแลระบบ Planasia
        </p>
        <p className="mt-1 truncate text-sm text-slate-600">{adminEmail}</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          เปิดดูเว็บไซต์
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Trash2, PlusCircle, X, Recycle,
  Ticket, LogOut, Shield, User as UserIcon, MapPin, Tag,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface SidebarUser {
  id: string; name: string; email: string; role: "ADMIN" | "USER"; points?: number;
}

interface SidebarProps {
  user: SidebarUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";

  const links = [
    { href: "/dashboard",                   label: "Dashboard",           icon: LayoutDashboard, show: true },
    { href: "/dashboard/waste",             label: "Data Sampah",         icon: Trash2,          show: true },
    { href: "/dashboard/waste/new",         label: "Tambah Laporan",      icon: PlusCircle,      show: !isAdmin },
    { href: "/dashboard/admin/locations",   label: "Kelola Wilayah",       icon: MapPin,          show: isAdmin },
    { href: "/dashboard/admin/waste-types", label: "Kelola Jenis Sampah", icon: Tag,             show: isAdmin },
    { href: "/dashboard/vouchers",          label: "Kelola Voucher",      icon: Ticket,          show: isAdmin },
    { href: "/dashboard/vouchers",          label: "Tukar Voucher",       icon: Ticket,          show: !isAdmin },
  ].filter((l) => l.show);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 flex flex-col bg-white border-r-2 border-slate-100 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ── Logo ── */}
        <div className="h-20 flex items-center justify-between px-5 border-b-2 border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <Recycle className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="text-xl font-black text-slate-800">
              Pah<span className="text-emerald-500">Sampah</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Role banner ── */}
        <div className="px-4 pt-4 pb-2">
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 ${
            isAdmin
              ? "bg-violet-50 border-violet-100"
              : "bg-emerald-50 border-emerald-100"
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isAdmin ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"
            }`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                isAdmin ? "text-violet-600" : "text-emerald-600"
              }`}>
                {isAdmin ? "Administrator" : "Pengguna"}
              </p>
              <p className="text-xs font-bold text-slate-600 truncate">{user?.name}</p>
            </div>
          </div>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-grow px-4 py-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? isAdmin
                      ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                      : "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Points panel (USER only) ── */}
        {!isAdmin && (
          <div className="px-4 pb-3">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-xl p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Saldo Poin</p>
              <p className="text-xl font-black text-amber-900 mt-0.5">🪙 {user?.points ?? 0}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-0.5">Tukar dengan voucher belanja</p>
            </div>
          </div>
        )}

        {/* ── Logout ── */}
        <div className="px-4 pb-5 pt-2 border-t-2 border-slate-100">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-100 hover:border-red-200 transition-all cursor-pointer focus:outline-none"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar dari Akun</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

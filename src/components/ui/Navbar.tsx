"use client";

import { Menu } from "lucide-react";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    points?: number;
  } | null;
  onMenuClick?: () => void;
}

export default function Navbar({ user, onMenuClick }: NavbarProps) {
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full h-18 flex items-center justify-between px-6 lg:px-8 bg-white border-b-2 border-slate-100 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PahSampah</p>
          <h1 className="text-sm font-black text-slate-700">
            {isAdmin ? "Panel Administrator" : "Portal Pelaporan Sampah"}
          </h1>
        </div>
      </div>

      {/* Right */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Points — User only */}
          {!isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 px-3 py-1.5 rounded-xl">
              <span>🪙</span>
              <span className="text-sm font-black text-amber-800">{user.points ?? 0} Poin</span>
            </div>
          )}

          {/* Role badge */}
          <div className={`hidden sm:block px-3 py-1.5 rounded-xl text-xs font-black border-2 ${
            isAdmin
              ? "bg-violet-50 text-violet-700 border-violet-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            {isAdmin ? "Admin" : "User"}
          </div>

          {/* Name + avatar */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm font-bold text-slate-700">{user.name}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md ${
              isAdmin
                ? "bg-gradient-to-br from-violet-400 to-purple-500"
                : "bg-gradient-to-br from-emerald-400 to-teal-500"
            }`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

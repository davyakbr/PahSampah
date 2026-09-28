"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/50 text-red-500 mb-6 border border-red-200/30">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-theme tracking-tight mb-2">
          403
        </h1>
        <h2 className="text-xl font-bold text-theme mb-4">
          Akses Ditolak / Access Denied
        </h2>
        
        <div className="card-theme rounded-2xl p-6 border border-card-border glass-effect mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Maaf, Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini. Halaman ini hanya dapat diakses oleh pengguna dengan peran <strong>Admin</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-theme font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

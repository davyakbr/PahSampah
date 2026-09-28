"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Trash2, AlertTriangle, ChevronLeft, ChevronRight, MapPin, Scale } from "lucide-react";
import { deleteWasteAction } from "@/app/actions/waste";
import { useToast } from "@/components/providers/ToastProvider";

interface WasteItem {
  id: string;
  deskripsi: string;
  berat: number;
  status: "PENDING" | "DIPROSES" | "SELESAI";
  createdAt: Date;
  user: { nama: string };
  wilayah: { namaWilayah: string };
  jenisSampah: { namaJenis: string; category: "ORGANIK" | "ANORGANIK" | "B3" };
}

interface WasteTableProps {
  wastes: WasteItem[];
  userRole: "ADMIN" | "USER";
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

const CATEGORY_THEMES = {
  ORGANIK:   { label: "Organik",     badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  ANORGANIK: { label: "Non Organik", badge: "bg-blue-100 text-blue-800 border-blue-200",          dot: "bg-blue-500"    },
  B3:        { label: "B3",          badge: "bg-red-100 text-red-800 border-red-200",              dot: "bg-red-500"     },
};

const STATUS_THEMES = {
  PENDING:  { label: "⏳ Menunggu", badge: "bg-amber-100 text-amber-800 border-amber-200"  },
  DIPROSES: { label: "🔄 Diproses", badge: "bg-blue-100 text-blue-800 border-blue-200"    },
  SELESAI:  { label: "✅ Selesai",  badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

export default function WasteTable({
  wastes, userRole, currentPage, totalPages, totalItems, pageSize,
}: WasteTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const startIndex = (currentPage - 1) * pageSize + 1;

  const handleDelete = (id: string) => {
    if (!confirm("Hapus laporan sampah ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeleteId(id);
    startTransition(async () => {
      const res = await deleteWasteAction(id);
      if (res.success) {
        showToast(res.message || "Berhasil dihapus.", "success");
        router.refresh();
      } else {
        showToast(res.error || "Gagal menghapus.", "error");
      }
      setDeleteId(null);
    });
  };

  const goPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(p));
    router.push(`?${sp.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Count info */}
      <p className="text-xs font-bold text-slate-400">
        Menampilkan {Math.min(startIndex, totalItems)}–{Math.min(startIndex + pageSize - 1, totalItems)} dari {totalItems} laporan
      </p>

      {/* Cards layout */}
      {wastes.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-slate-100 p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-400">Tidak ada laporan sampah ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wastes.map((waste, idx) => {
            const cat = CATEGORY_THEMES[waste.jenisSampah.category] ?? CATEGORY_THEMES.ORGANIK;
            const sts = STATUS_THEMES[waste.status] ?? STATUS_THEMES.PENDING;
            const num = startIndex + idx;
            return (
              <div
                key={waste.id}
                className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-200 transition-colors"
              >
                {/* Number + dot */}
                <div className="flex items-center gap-3 sm:w-8 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${cat.dot}`} />
                  <span className="text-xs font-black text-slate-400 hidden sm:block">{num}</span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg border bg-slate-100 text-slate-800 border-slate-200">
                      {waste.jenisSampah.namaJenis}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${sts.badge}`}>
                      {sts.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 line-clamp-2">{waste.deskripsi}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{waste.wilayah.namaWilayah}</span>
                    <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{waste.berat.toFixed(2)} kg</span>
                    <span>oleh {waste.user.nama}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/waste/${waste.id}`}
                    className="p-2 rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                    title="Lihat detail"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {userRole === "ADMIN" && (
                    <button
                      onClick={() => handleDelete(waste.id)}
                      disabled={isPending && deleteId === waste.id}
                      className="p-2 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                      title="Hapus laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </button>
          <span className="text-xs font-black text-slate-500">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

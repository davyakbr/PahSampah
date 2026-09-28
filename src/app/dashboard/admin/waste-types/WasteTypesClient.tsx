"use client";

import React, { useActionState, useEffect, useState } from "react";
import { addWasteTypeAction, deleteWasteTypeAction } from "@/app/actions/wastetype";
import { useToast } from "@/components/providers/ToastProvider";
import { Plus, Trash2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

interface JenisSampahItem {
  id: string;
  namaJenis: string;
  category: "ORGANIK" | "ANORGANIK" | "B3";
  _count: { laporanSampah: number };
}

const CATEGORY_BADGES = {
  ORGANIK:   "bg-emerald-100 text-emerald-800 border-emerald-200",
  ANORGANIK: "bg-blue-100 text-blue-800 border-blue-200",
  B3:        "bg-red-100 text-red-800 border-red-200",
};

export default function WasteTypesClient({ wasteTypes }: { wasteTypes: JenisSampahItem[] }) {
  const [state, formAction, isPending] = useActionState(addWasteTypeAction, null);
  const { showToast } = useToast();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (state?.error) showToast(state.error, "error");
    if (state?.success && state?.message) showToast(state.message, "success");
  }, [state, showToast]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus jenis sampah "${name}"?`)) return;
    setDeletingId(id);
    const res = await deleteWasteTypeAction(id);
    if (res.success) {
      showToast(res.message || "Berhasil dihapus.", "success");
      router.refresh();
    } else {
      showToast(res.error || "Gagal menghapus.", "error");
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">🏷️ Kelola Jenis Sampah</h2>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">
            Secara default tersedia Organik, Non Organik, dan B3. Admin dapat menambahkan jenis baru secara manual.
          </p>
        </div>
      </div>

      {/* Form Tambah */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4">
          + Tambah Jenis Sampah Manual
        </h3>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Nama Jenis Sampah
              </label>
              <input
                name="namaJenis"
                required
                placeholder="Contoh: Organik, Non Organik, B3, Kardus, dll."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Kategori
              </label>
              <select
                name="category"
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors bg-white"
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="ORGANIK">🌿 Organik</option>
                <option value="ANORGANIK">♻️ Non Organik</option>
                <option value="B3">⚠️ B3 (Bahan Berbahaya)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Tambah Jenis Sampah
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Daftar Jenis Sampah ({wasteTypes.length})
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {wasteTypes.length === 0 ? (
            <p className="p-8 text-center text-slate-400 font-bold text-sm">Belum ada jenis sampah.</p>
          ) : (
            wasteTypes.map((wt) => {
              const badgeClass = CATEGORY_BADGES[wt.category] ?? CATEGORY_BADGES.ORGANIK;
              return (
                <div key={wt.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{wt.namaJenis}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeClass}`}>
                          {wt.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {wt._count.laporanSampah} laporan menggunakan jenis ini
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(wt.id, wt.namaJenis)}
                    disabled={deletingId === wt.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

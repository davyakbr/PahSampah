"use client";

import React, { useActionState, useEffect, useState } from "react";
import { addLocationAction, deleteLocationAction } from "@/app/actions/location";
import { useToast } from "@/components/providers/ToastProvider";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface WilayahItem {
  id: string;
  namaWilayah: string;
  _count: { laporanSampah: number };
}

export default function LocationsClient({ locations }: { locations: WilayahItem[] }) {
  const [state, formAction, isPending] = useActionState(addLocationAction, null);
  const { showToast } = useToast();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (state?.error) showToast(state.error, "error");
    if (state?.success && state?.message) showToast(state.message, "success");
  }, [state, showToast]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus wilayah "${name}"?`)) return;
    setDeletingId(id);
    const res = await deleteLocationAction(id);
    if (res.success) {
      showToast(res.message || "Wilayah dihapus.", "success");
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
          <h2 className="text-2xl font-black text-slate-800">📍 Kelola Wilayah</h2>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">
            Admin menentukan pilihan wilayah pengambilan sampah untuk pengguna.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4">
          + Tambah Wilayah Baru
        </h3>
        <form action={formAction} className="flex gap-3">
          <input
            name="namaWilayah"
            required
            placeholder="Contoh: Jakarta Selatan, Depok, dll."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            Daftar Wilayah ({locations.length})
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {locations.length === 0 ? (
            <p className="p-8 text-center text-slate-400 font-bold text-sm">Belum ada wilayah.</p>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{loc.namaWilayah}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {loc._count.laporanSampah} laporan menggunakan wilayah ini
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id, loc.namaWilayah)}
                  disabled={deletingId === loc.id}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

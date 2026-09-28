"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { Save, ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface Wilayah { id: string; namaWilayah: string; }
interface JenisSampah { id: string; namaJenis: string; category: string; }

interface WasteFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
  wilayahList: Wilayah[];
  jenisSampahList: JenisSampah[];
  isEdit?: boolean;
}

export default function WasteForm({ action, wilayahList, jenisSampahList, isEdit = false }: WasteFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const { showToast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state?.error) showToast(state.error, "error");
    if (state?.success && state?.message) showToast(state.message, "success");
  }, [state, showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("File harus berupa gambar (JPG, PNG, WEBP, dll).", "error");
        e.target.value = "";
        setPreviewUrl(null);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-slate-100 bg-emerald-50">
        <h2 className="text-xl font-black text-slate-800">
          {isEdit ? "✏️ Ubah Laporan Sampah" : "📋 Laporan Sampah Baru"}
        </h2>
        <p className="text-sm font-semibold text-slate-500 mt-0.5">
          Pilih jenis sampah, wilayah, upload foto bukti, dan jelaskan detail sampah yang Anda laporkan.
        </p>
      </div>

      <form action={formAction} encType="multipart/form-data" className="p-6 space-y-6">
        {/* Jenis Sampah */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Jenis Sampah <span className="text-red-500">*</span>
          </label>
          <select
            name="jenisSampahId"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          >
            <option value="">-- Pilih Jenis Sampah --</option>
            {jenisSampahList.map((j) => (
              <option key={j.id} value={j.id}>{j.namaJenis}</option>
            ))}
          </select>
        </div>

        {/* Wilayah */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Wilayah Pengambilan <span className="text-red-500">*</span>
          </label>
          <select
            name="wilayahId"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          >
            <option value="">-- Pilih Wilayah --</option>
            {wilayahList.map((w) => (
              <option key={w.id} value={w.id}>{w.namaWilayah}</option>
            ))}
          </select>
        </div>

        {/* Upload Foto Sampah (WAJIB UPLOAD 1 FILE FOTO) */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 flex items-center justify-between">
            <span>
              Upload Foto Sampah <span className="text-red-500">*</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Maksimal 1 Foto
            </span>
          </label>
          <div className="space-y-3">
            {!previewUrl ? (
              <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors group cursor-pointer">
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  multiple={false}
                  required={!isEdit}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    Klik atau seret 1 file foto sampah ke sini
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    Format: JPG, PNG, WEBP, GIF (Maksimal 1 File Bukti)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-100 group shadow-sm">
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  multiple={false}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <img
                  src={previewUrl}
                  alt="Preview Foto Sampah"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> 1 Foto Berhasil Diunggah
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                  }}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Ganti / Hapus Foto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Deskripsi / Penjelasan Sampah <span className="text-red-500">*</span>
          </label>
          <textarea
            name="deskripsi"
            required
            rows={3}
            placeholder="Ketik rincian sampah secara manual (contoh: Botol plastik 500ml 10 buah...)"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 transition-colors resize-none"
          />
        </div>

        {/* Berat */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Berat Sampah (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="berat"
            required
            min="0.01"
            step="0.01"
            placeholder="Contoh: 1.5"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/waste"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Simpan Perubahan" : "Kirim Laporan"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

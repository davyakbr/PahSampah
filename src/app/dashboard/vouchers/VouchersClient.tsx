"use client";

import React, { useState, useTransition, useActionState, useEffect } from "react";
import { redeemVoucherAction, addVoucherAction, deleteVoucherAction } from "@/app/actions/voucher";
import { useToast } from "@/components/providers/ToastProvider";
import { Ticket, Copy, Check, ShoppingBag, Gift, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface VoucherItem {
  id: string;
  judul: string;
  deskripsi?: string;
  kodeVoucher: string;
  biayaPoin: number;
  stok: number;
}

interface RedeemedItem {
  id: string;
  title: string;
  code: string;
  cost: number;
  createdAt: Date;
}

interface VouchersClientProps {
  userRole: "ADMIN" | "USER";
  userPoints: number;
  vouchers: VoucherItem[];
  redeemedVouchers: RedeemedItem[];
}

export default function VouchersClient({
  userRole,
  userPoints,
  vouchers,
  redeemedVouchers,
}: VouchersClientProps) {
  const isAdmin = userRole === "ADMIN";
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [addState, formAction, isAddPending] = useActionState(addVoucherAction, null);

  useEffect(() => {
    if (addState?.error) showToast(addState.error, "error");
    if (addState?.success && addState?.message) showToast(addState.message, "success");
  }, [addState, showToast]);

  const handleRedeem = (voucher: VoucherItem) => {
    if (userPoints < voucher.biayaPoin) {
      showToast(`Poin tidak cukup. Anda butuh ${voucher.biayaPoin} poin.`, "error");
      return;
    }

    if (!confirm(`Tukarkan ${voucher.biayaPoin} poin untuk ${voucher.judul}?`)) return;

    startTransition(async () => {
      const res = await redeemVoucherAction(voucher.id);
      if (res.success) {
        showToast(res.message || "Voucher berhasil ditukarkan!", "success");
        router.refresh();
      } else {
        showToast(res.error || "Gagal menukarkan voucher.", "error");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus voucher "${name}"?`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteVoucherAction(id);
      if (res.success) {
        showToast(res.message || "Voucher berhasil dihapus.", "success");
        router.refresh();
      } else {
        showToast(res.error || "Gagal menghapus voucher.", "error");
      }
      setDeletingId(null);
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast("Kode voucher berhasil disalin!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-sm">
            <Gift className="w-3.5 h-3.5" /> Program Reward PahSampah
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">🎁 {isAdmin ? "Kelola Voucher Belanja" : "Tukar Poin Voucher Belanja"}</h2>
          <p className="text-emerald-50 text-xs sm:text-sm font-semibold max-w-lg">
            {isAdmin
              ? "Kelola item voucher, kode voucher, biaya poin, dan stok yang dapat ditukarkan oleh pengguna."
              : "Kumpulkan poin dari setiap laporan sampah yang selesai dan tukarkan dengan voucher belanja Alfamart, Indomaret, dll."}
          </p>
        </div>
        {!isAdmin && (
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-5 text-center sm:text-right min-w-[180px]">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Saldo Poin Anda</p>
            <p className="text-3xl font-black text-white mt-1">🪙 {userPoints}</p>
          </div>
        )}
      </div>

      {/* Admin Add Voucher Form */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-violet-500" />
            Tambah Voucher Belanja Baru
          </h3>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Judul Voucher <span className="text-red-500">*</span>
                </label>
                <input
                  name="judul"
                  required
                  placeholder="Contoh: Voucher Indomaret Rp 25.000"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Biaya Poin <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="biayaPoin"
                  required
                  min="1"
                  placeholder="Contoh: 250"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Stok Voucher <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stok"
                  required
                  min="1"
                  placeholder="Contoh: 50"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <input
                name="deskripsi"
                placeholder="Contoh: Potongan belanja Rp 25.000 tanpa minimal transaksi"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-800 font-semibold text-sm focus:outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <span className="text-xs font-black text-slate-500">🔑 Kode Voucher:</span>
              <span className="text-xs font-mono font-bold text-violet-600">Dibuat otomatis oleh sistem (contoh: PAH-A1B2-C3D4E)</span>
            </div>

            <button
              type="submit"
              disabled={isAddPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isAddPending ? "Menyimpan..." : "Tambah Voucher"}
            </button>
          </form>
        </div>
      )}

      {/* Available Vouchers */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-500" />
          Pilihan Voucher Belanja ({vouchers.length})
        </h3>

        {vouchers.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 text-center">
            <p className="font-bold text-slate-400 text-sm">Belum ada voucher belanja tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => {
              const canAfford = userPoints >= v.biayaPoin;
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6 flex flex-col justify-between gap-4 hover:border-emerald-200 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                        🪙 {v.biayaPoin} Poin
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          Stok: {v.stok}
                        </span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id, v.judul)}
                            disabled={deletingId === v.id || isPending}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 text-base">{v.judul}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">{v.deskripsi}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-2">Kode: {v.kodeVoucher}</p>
                  </div>

                  {!isAdmin && (
                    <button
                      onClick={() => handleRedeem(v)}
                      disabled={!canAfford || isPending || v.stok <= 0}
                      className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        canAfford && v.stok > 0
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      {v.stok <= 0 ? "Stok Habis" : canAfford ? "Tukarkan Voucher Ini" : `Butuh ${v.biayaPoin - userPoints} Poin Lagi`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redeemed History (User only) */}
      {!isAdmin && (
        <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-teal-500" />
            Voucher Saya Yang Sudah Ditukarkan ({redeemedVouchers.length})
          </h3>

          {redeemedVouchers.length === 0 ? (
            <p className="text-center py-8 text-slate-400 font-bold text-sm">
              Anda belum pernah menukarkan voucher.
            </p>
          ) : (
            <div className="space-y-3">
              {redeemedVouchers.map((rv) => (
                <div
                  key={rv.id}
                  className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-black text-slate-800 text-sm">{rv.title}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      Ditukar pada {new Date(rv.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} · 🪙 {rv.cost} Poin
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-slate-200 font-mono text-sm font-black text-slate-800">
                    <span>{rv.code}</span>
                    <button
                      onClick={() => copyToClipboard(rv.code)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="Salin Kode"
                    >
                      {copiedCode === rv.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

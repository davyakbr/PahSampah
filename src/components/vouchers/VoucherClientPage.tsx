"use client";

import React, { useTransition } from "react";
import { redeemVoucherAction } from "@/app/actions/voucher";
import { VOUCHER_OPTIONS } from "@/lib/vouchers";
import { useToast } from "@/components/providers/ToastProvider";
import { Ticket, Copy, Calendar, CheckCircle2 } from "lucide-react";

interface RedeemedVoucher {
  id: string;
  title: string;
  code: string;
  cost: number;
  createdAt: Date;
}

interface Props {
  initialPoints: number;
  redeemedVouchers: RedeemedVoucher[];
}

export default function VoucherClientPage({ initialPoints, redeemedVouchers }: Props) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleRedeem = (voucherId: string) => {
    startTransition(async () => {
      const res = await redeemVoucherAction(voucherId);
      if (res.success) {
        showToast(res.message ?? "Voucher berhasil ditukarkan!", "success");
      } else {
        showToast(res.error ?? "Gagal menukarkan voucher.", "error");
      }
    });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Kode disalin ke clipboard!", "success");
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800">🎁 Tukar Poin & Voucher</h2>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Tukarkan poin hasil pemilahan sampah Anda dengan voucher belanja.
        </p>
      </div>

      {/* Points balance card */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-amber-700">Saldo Poin Anda</p>
          <p className="text-4xl font-black text-amber-900 mt-1">🪙 {initialPoints}</p>
          <p className="text-xs font-bold text-amber-600 mt-1">1 kg sampah selesai = 10 poin</p>
        </div>
        <div className="bg-white/70 rounded-xl p-4 border border-amber-200 text-sm font-semibold text-amber-800 max-w-xs">
          Kumpulkan poin dengan melaporkan sampah. Setiap laporan yang diselesaikan Admin akan menambah poin Anda.
        </div>
      </div>

      {/* Voucher options */}
      <div>
        <h3 className="text-base font-black text-slate-700 mb-4">🛒 Pilih Voucher Belanja</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VOUCHER_OPTIONS.map((v) => {
            const canRedeem = initialPoints >= v.cost;
            return (
              <div
                key={v.id}
                className={`rounded-2xl p-5 border-2 bg-gradient-to-br ${v.color} flex flex-col gap-4`}
              >
                {/* Top: emoji + title + value */}
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{v.emoji}</span>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-slate-800">{v.title}</h4>
                    <p className="text-xs font-semibold text-slate-500">{v.description}</p>
                  </div>
                  <span className="text-lg font-black text-slate-800 whitespace-nowrap">{v.value}</span>
                </div>

                {/* Cost badge + redeem button */}
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${v.badge}`}>
                    🪙 {v.cost} Poin
                  </span>
                  <button
                    onClick={() => handleRedeem(v.id)}
                    disabled={!canRedeem || isPending}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all cursor-pointer focus:outline-none ${
                      canRedeem
                        ? "bg-slate-800 hover:bg-slate-700 text-white shadow-md"
                        : "bg-white/60 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : canRedeem ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tukar Sekarang</span>
                      </>
                    ) : (
                      <span>Poin Kurang</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My redeemed vouchers */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-100 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-slate-400" />
          <h3 className="text-base font-black text-slate-700">Voucher Saya</h3>
          <span className="ml-auto text-xs font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
            {redeemedVouchers.length} voucher
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {redeemedVouchers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">🎟️</p>
              <p className="text-sm font-bold text-slate-400">Belum ada voucher yang ditukarkan.</p>
              <p className="text-xs text-slate-400 mt-1">Kumpulkan poin dari laporan sampah Anda!</p>
            </div>
          ) : (
            redeemedVouchers.map((rv) => (
              <div key={rv.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-800">{rv.title}</p>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(rv.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    <span className="ml-2 text-amber-600">· {rv.cost} poin digunakan</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl px-4 py-2 font-mono font-black text-sm text-slate-700 tracking-wider">
                    {rv.code}
                  </div>
                  <button
                    onClick={() => copy(rv.code)}
                    title="Salin kode"
                    className="p-2 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

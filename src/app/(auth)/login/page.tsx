"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useToast } from "@/components/providers/ToastProvider";
import { Mail, Lock, LogIn, Recycle } from "lucide-react";
import FallingWasteBackground from "@/components/auth/FallingWasteBackground";

export default function LoginPage() {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state && !state.success && state.error) {
      showToast(state.error, "error");
    }
  }, [state, showToast]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-emerald-50/80 via-teal-50/40 to-slate-50 p-4 overflow-hidden">
      {/* Background Falling Cartoon Waste Animation */}
      <FallingWasteBackground />

      {/* Login Card (Untouched Layout & Position, Elevated z-10) */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border-2 border-emerald-100/80 shadow-xl p-8 space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200">
            <Recycle className="w-6 h-6 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Pah<span className="text-emerald-500">Sampah</span>
          </h1>
          <p className="text-xs font-bold text-slate-400">
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                id="login_email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 font-semibold text-sm focus:outline-none focus:bg-white focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                id="login_password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 font-semibold text-sm focus:outline-none focus:bg-white focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            id="login_submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs font-semibold text-slate-500 pt-2 border-t-2 border-slate-100">
          Belum punya akun?{" "}
          <Link
            href="/register"
            id="goto_register"
            className="font-black text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}

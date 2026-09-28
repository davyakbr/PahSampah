import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Plus, ArrowRight, Clock, Scale, Trash2, Users, CheckCircle2, Hourglass, RefreshCw } from "lucide-react";
import Link from "next/link";
import { WasteCategory } from "@prisma/client";

export const revalidate = 0;

const CATEGORY_THEMES = {
  ORGANIK: {
    label: "Organik",
    cardBg: "bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200",
    badge: "bg-emerald-200 text-emerald-900",
    bullet: "bg-emerald-500",
  },
  ANORGANIK: {
    label: "Non Organik",
    cardBg: "bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200",
    badge: "bg-blue-200 text-blue-900",
    bullet: "bg-blue-500",
  },
  B3: {
    label: "B3",
    cardBg: "bg-gradient-to-br from-rose-50 to-red-100 border-red-200",
    badge: "bg-red-200 text-red-900",
    bullet: "bg-red-500",
  },
};

const STATUS_THEMES = {
  PENDING:  { label: "Menunggu",  badge: "bg-amber-100 text-amber-800 border border-amber-200" },
  DIPROSES: { label: "Diproses",  badge: "bg-blue-100 text-blue-800 border border-blue-200" },
  SELESAI:  { label: "Selesai",   badge: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
};

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  const userFilter = !isAdmin && session ? { userId: session.id } : {};

  const [totalWastes, weightAgg, totalUsers, statusGroup, recentWastes, userPoints] =
    await Promise.all([
      db.laporanSampah.count({ where: userFilter }),
      db.laporanSampah.aggregate({ where: userFilter, _sum: { berat: true } }),
      isAdmin ? db.user.count() : Promise.resolve(0),
      db.laporanSampah.groupBy({
        where: userFilter,
        by: ["status"],
        _count: { id: true },
      }),
      db.laporanSampah.findMany({
        where: userFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user:        { select: { nama: true } },
          wilayah:     { select: { namaWilayah: true } },
          jenisSampah: { select: { namaJenis: true, category: true } },
        },
      }),
      !isAdmin && session
        ? db.user.findUnique({ where: { id: session.id }, select: { points: true } })
        : null,
    ]);

  const totalWeight = weightAgg._sum.berat ?? 0;

  const getStatusCount = (s: string) =>
    statusGroup.find((g) => g.status === s)?._count.id ?? 0;

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* ── Welcome header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            {isAdmin ? "👋 Halo, Admin!" : "👋 Halo, " + session?.name + "!"}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {isAdmin
              ? "Pantau seluruh laporan sampah dan kelola status penanganannya."
              : "Laporkan sampah Anda dan tukarkan poin untuk voucher belanja."}
          </p>
        </div>
        {!isAdmin && (
          <Link
            href="/dashboard/waste/new"
            className="inline-flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-md transition-all text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Tambah Laporan Sampah
          </Link>
        )}
      </div>

      {/* ── Admin top stats ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Laporan",  value: `${totalWastes}`,              icon: Trash2,       color: "from-violet-100 to-purple-100 border-violet-200",  text: "text-violet-800" },
            { label: "Total Berat",    value: `${totalWeight.toFixed(2)} kg`,icon: Scale,        color: "from-blue-100 to-sky-100 border-blue-200",         text: "text-blue-800" },
            { label: "Pengguna",       value: `${totalUsers}`,              icon: Users,        color: "from-pink-100 to-rose-100 border-pink-200",        text: "text-pink-800" },
            { label: "Selesai Diproses",value:`${getStatusCount("SELESAI")}`,icon: CheckCircle2, color: "from-emerald-100 to-green-100 border-emerald-200",  text: "text-emerald-800" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 border-2 shadow-sm`}>
              <div className="flex justify-between items-start mb-3">
                <p className={`text-xs font-black uppercase tracking-wider ${s.text}`}>{s.label}</p>
                <s.icon className={`w-5 h-5 ${s.text} opacity-60`} />
              </div>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── User personal stats ── */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Laporan Saya",   value: `${totalWastes} laporan`, color: "from-teal-50 to-emerald-100 border-emerald-200",  text: "text-emerald-800", icon: Trash2 },
            { label: "Total Berat",    value: `${totalWeight.toFixed(2)} kg`, color: "from-sky-50 to-blue-100 border-blue-200", text: "text-blue-800",    icon: Scale },
            { label: "Saldo Poin",     value: `🪙 ${userPoints?.points ?? 0} Poin`, color: "from-amber-50 to-yellow-100 border-amber-200", text: "text-amber-800",  icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 border-2 shadow-sm`}>
              <div className="flex justify-between items-start mb-3">
                <p className={`text-xs font-black uppercase tracking-wider ${s.text}`}>{s.label}</p>
                <s.icon className={`w-5 h-5 ${s.text} opacity-60`} />
              </div>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Admin: Status summary ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { status: "PENDING",  label: "Menunggu Diproses", color: "from-amber-50 to-yellow-100 border-amber-200",   text: "text-amber-800",   icon: Hourglass },
            { status: "DIPROSES", label: "Sedang Diproses",   color: "from-blue-50 to-sky-100 border-blue-200",        text: "text-blue-800",    icon: RefreshCw },
            { status: "SELESAI",  label: "Selesai",           color: "from-emerald-50 to-green-100 border-emerald-200",text: "text-emerald-800", icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.status} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 border-2 shadow-sm flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center ${s.text}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${s.text}`}>{s.label}</p>
                <p className={`text-2xl font-black mt-0.5 ${s.text}`}>{getStatusCount(s.status)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent reports ── */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Laporan Terbaru
          </h3>
          <Link
            href="/dashboard/waste"
            className={`text-xs font-bold flex items-center gap-1 transition-colors ${
              isAdmin ? "text-violet-600 hover:text-violet-800" : "text-emerald-600 hover:text-emerald-800"
            }`}
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentWastes.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-slate-400 font-bold text-sm">Belum ada laporan sampah.</p>
              {!isAdmin && (
                <Link
                  href="/dashboard/waste/new"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 px-3.5 rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Setor Sampah Pertama Anda
                </Link>
              )}
            </div>
          ) : (
            recentWastes.map((w) => {
              const cat = CATEGORY_THEMES[w.jenisSampah.category] ?? CATEGORY_THEMES.ORGANIK;
              const sts = STATUS_THEMES[w.status] ?? STATUS_THEMES.PENDING;
              return (
                <div key={w.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.bullet}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{w.deskripsi}</p>
                      <p className="text-xs text-slate-400 font-semibold">
                        {w.user.nama} · {w.wilayah.namaWilayah} · {w.jenisSampah.namaJenis}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-black text-slate-700">{w.berat.toFixed(2)} kg</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${sts.badge}`}>
                      {sts.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

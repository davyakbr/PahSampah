import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateWasteStatusAction } from "@/app/actions/waste";
import { ArrowLeft, Calendar, MapPin, Scale, Tag, User, Info, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_MAP = {
  ORGANIK:   { label: "Organik",                    badge: "bg-emerald-100 text-emerald-800 border-emerald-200", bar: "bg-emerald-400", tips: "Olah menjadi kompos atau pakan maggot. Pisahkan dari plastik agar bisa membusuk alami." },
  ANORGANIK: { label: "Non Organik",                badge: "bg-blue-100 text-blue-800 border-blue-200",          bar: "bg-blue-400",    tips: "Kumpulkan dan serahkan ke bank sampah terdekat. Pastikan bersih dan kering sebelum disimpan." },
  B3:        { label: "B3 – Bahan Berbahaya & Beracun", badge: "bg-red-100 text-red-800 border-red-200",        bar: "bg-red-400",     tips: "Jangan dibuang sembarangan! Serahkan ke tempat pengumpulan resmi atau fasilitas B3 pemda." },
};

const STATUS_MAP = {
  PENDING:  { label: "⏳ Menunggu", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  DIPROSES: { label: "🔄 Diproses", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  SELESAI:  { label: "✅ Selesai",  badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

export const revalidate = 0;

export default async function WasteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const waste = await db.laporanSampah.findUnique({
    where: { id },
    include: {
      user:        { select: { nama: true } },
      wilayah:     { select: { namaWilayah: true } },
      jenisSampah: { select: { namaJenis: true, category: true } },
      fotoSampah:  { select: { urlFoto: true } },
    },
  });

  if (!waste) notFound();

  const cat = CATEGORY_MAP[waste.jenisSampah.category] ?? CATEGORY_MAP.ORGANIK;
  const sts = STATUS_MAP[waste.status]   ?? STATUS_MAP.PENDING;
  const points = Math.max(1, Math.round(waste.berat * 10));

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up">
      {/* Back */}
      <Link href="/dashboard/waste" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
        {/* Color bar */}
        <div className={`h-2 w-full ${cat.bar}`} />

        <div className="p-6 space-y-5">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${cat.badge}`}>
              Kategori: {cat.label}
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${sts.badge}`}>
              {sts.label}
            </span>
            <span className="ml-auto text-xs font-bold text-slate-400">
              🪙 {points} poin
            </span>
          </div>

          {/* Title / Jenis Sampah */}
          <h2 className="text-xl font-black text-slate-800">{waste.jenisSampah.namaJenis}</h2>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: Tag,      label: "Jenis Sampah", value: waste.jenisSampah.namaJenis },
              { icon: Scale,    label: "Berat",        value: `${waste.berat.toFixed(2)} kg` },
              { icon: MapPin,   label: "Wilayah",      value: waste.wilayah.namaWilayah },
              { icon: User,     label: "Pelapor",      value: waste.user.nama },
              { icon: Calendar, label: "Tanggal",      value: new Date(waste.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-black text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Foto Sampah (One-to-One) */}
          {waste.fotoSampah && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Foto Sampah (FotoSampah Table)
              </p>
              <div className="rounded-xl overflow-hidden border-2 border-slate-100 max-h-64">
                <img src={waste.fotoSampah.urlFoto} alt="Foto Sampah" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Penjelasan / Deskripsi Sampah</p>
            <p className="text-sm font-semibold text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">
              {waste.deskripsi}
            </p>
          </div>

          {/* Admin status control */}
          {session?.role === "ADMIN" && (
            <div className="bg-violet-50 border-2 border-violet-100 rounded-xl p-4">
              <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-3">🛠️ Ubah Status Laporan</p>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const newStatus = formData.get("status") as any;
                  await updateWasteStatusAction(id, newStatus);
                }}
                className="flex items-center gap-3"
              >
                <select
                  name="status"
                  defaultValue={waste.status}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-violet-200 bg-white text-slate-800 font-bold text-sm focus:outline-none focus:border-violet-400 transition-colors"
                >
                  <option value="PENDING">⏳ Menunggu</option>
                  <option value="DIPROSES">🔄 Diproses</option>
                  <option value="SELESAI">✅ Selesai</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-500 hover:bg-violet-600 text-white font-black text-sm rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Simpan
                </button>
              </form>
              <p className="text-[10px] text-violet-600 font-semibold mt-2">
                ℹ️ Mengubah ke "Selesai" akan memberi {points} poin kepada pelapor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm p-5 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-700 mb-1">Panduan Pengolahan — {cat.label}</p>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">{cat.tips}</p>
        </div>
      </div>
    </div>
  );
}

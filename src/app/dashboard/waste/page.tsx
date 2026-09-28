import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import WasteSearchFilter from "@/components/waste/WasteSearchFilter";
import WasteTable from "@/components/waste/WasteTable";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const revalidate = 0;

export default async function WasteListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  const q = params.q || "";
  const currentPage = parseInt(params.page || "1") || 1;
  const pageSize = 8;

  const where: any = {};

  if (!isAdmin && session) {
    where.userId = session.id;
  }

  if (q) {
    where.OR = [
      { deskripsi: { contains: q, mode: "insensitive" } },
      { wilayah: { namaWilayah: { contains: q, mode: "insensitive" } } },
      { jenisSampah: { namaJenis: { contains: q, mode: "insensitive" } } },
    ];
  }

  const totalItems = await db.laporanSampah.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const skip = Math.max(0, (currentPage - 1) * pageSize);

  const wastes = await db.laporanSampah.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      user:        { select: { nama: true } },
      wilayah:     { select: { namaWilayah: true } },
      jenisSampah: { select: { namaJenis: true, category: true } },
      fotoSampah:  { select: { urlFoto: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">🗑️ Laporan Sampah</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {isAdmin ? "Semua laporan sampah dari pengguna." : "Laporan sampah yang Anda kirimkan."}
          </p>
        </div>
        {!isAdmin && (
          <Link
            href="/dashboard/waste/new"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-emerald-200 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Laporan
          </Link>
        )}
      </div>

      <WasteSearchFilter />

      <WasteTable
        wastes={wastes as any}
        userRole={session?.role || "USER"}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
}

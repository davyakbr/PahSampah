"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { WasteCategory } from "@prisma/client";
import { z } from "zod";

const wasteTypeSchema = z.object({
  namaJenis: z.string().min(2, "Nama jenis sampah minimal 2 karakter.").max(60, "Maksimal 60 karakter."),
  category: z.nativeEnum(WasteCategory, { message: "Pilih kategori yang valid." }),
});

export async function addWasteTypeAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak." };

  const namaJenis = formData.get("namaJenis") as string;
  const category = formData.get("category") as WasteCategory;

  const parsed = wasteTypeSchema.safeParse({ namaJenis, category });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const existing = await db.jenisSampah.findUnique({ where: { namaJenis: parsed.data.namaJenis } });
    if (existing) return { success: false, error: "Nama jenis sampah sudah ada." };

    await db.jenisSampah.create({
      data: {
        namaJenis: parsed.data.namaJenis,
        category:  parsed.data.category,
      },
    });

    revalidatePath("/dashboard/admin/waste-types");
    revalidatePath("/dashboard/waste/new");
    return { success: true, message: "Jenis sampah berhasil ditambahkan." };
  } catch (e) {
    return { success: false, error: "Gagal menambah jenis sampah." };
  }
}

export async function deleteWasteTypeAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak." };

  try {
    const count = await db.laporanSampah.count({ where: { jenisSampahId: id } });
    if (count > 0) {
      return { success: false, error: "Jenis sampah ini sedang digunakan dalam laporan dan tidak dapat dihapus (onDelete: Restrict)." };
    }

    await db.jenisSampah.delete({ where: { id } });
    revalidatePath("/dashboard/admin/waste-types");
    revalidatePath("/dashboard/waste/new");
    return { success: true, message: "Jenis sampah berhasil dihapus." };
  } catch (e) {
    return { success: false, error: "Gagal menghapus jenis sampah." };
  }
}

"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const locationSchema = z.object({
  namaWilayah: z.string().min(2, "Nama wilayah minimal 2 karakter.").max(50, "Maksimal 50 karakter."),
});

export async function addLocationAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak." };

  const namaWilayah = (formData.get("name") || formData.get("namaWilayah")) as string;
  const parsed = locationSchema.safeParse({ namaWilayah });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  try {
    const existing = await db.wilayah.findUnique({ where: { namaWilayah: parsed.data.namaWilayah } });
    if (existing) return { success: false, error: "Nama wilayah sudah ada." };

    await db.wilayah.create({ data: { namaWilayah: parsed.data.namaWilayah } });
    revalidatePath("/dashboard/admin/locations");
    return { success: true, message: "Wilayah berhasil ditambahkan." };
  } catch (e) {
    return { success: false, error: "Gagal menambah wilayah." };
  }
}

export async function deleteLocationAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak." };

  try {
    const count = await db.laporanSampah.count({ where: { wilayahId: id } });
    if (count > 0) return { success: false, error: "Wilayah ini digunakan dalam laporan sampah dan tidak dapat dihapus (onDelete: Restrict)." };

    await db.wilayah.delete({ where: { id } });
    revalidatePath("/dashboard/admin/locations");
    return { success: true, message: "Wilayah berhasil dihapus." };
  } catch (e) {
    return { success: false, error: "Gagal menghapus wilayah." };
  }
}

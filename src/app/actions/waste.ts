"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WasteStatus } from "@prisma/client";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const wasteSchema = z.object({
  jenisSampahId: z.string().min(1, "Pilih jenis sampah."),
  wilayahId:     z.string().min(1, "Pilih lokasi/wilayah."),
  deskripsi:     z.string().min(3, "Deskripsi minimal 3 karakter."),
  berat:         z.coerce.number({ message: "Berat harus berupa angka." }).positive("Berat harus lebih dari 0."),
});

export async function createWasteAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi habis. Silakan login kembali." };

  // Check if session user actually exists in DB (e.g. after DB re-seed)
  const userExists = await db.user.findUnique({ where: { id: session.id } });
  if (!userExists) {
    return { success: false, error: "Sesi tidak valid / akun tidak ditemukan di database. Silakan logout dan login kembali." };
  }

  const parsed = wasteSchema.safeParse({
    jenisSampahId: formData.get("jenisSampahId"),
    wilayahId:     formData.get("wilayahId"),
    deskripsi:     formData.get("deskripsi"),
    berat:         formData.get("berat"),
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const jenisExists = await db.jenisSampah.findUnique({ where: { id: parsed.data.jenisSampahId } });
  if (!jenisExists) return { success: false, error: "Jenis sampah yang dipilih tidak ditemukan." };

  const wilayahExists = await db.wilayah.findUnique({ where: { id: parsed.data.wilayahId } });
  if (!wilayahExists) return { success: false, error: "Wilayah yang dipilih tidak ditemukan." };

  // File Upload Handling
  const fotoFile = formData.get("foto") as File | null;
  if (!fotoFile || !(fotoFile instanceof File) || fotoFile.size === 0) {
    return { success: false, error: "Foto sampah wajib diunggah." };
  }

  if (!fotoFile.type.startsWith("image/")) {
    return { success: false, error: "File yang diunggah harus berupa gambar (JPG, PNG, WEBP, dll)." };
  }

  let photoUrl = "";
  try {
    const bytes = await fotoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(fotoFile.name) || ".jpg";
      const safeExt = ext.substring(0, 5).toLowerCase();
      const filename = `waste-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.writeFile(filePath, buffer);
      photoUrl = `/uploads/${filename}`;
    } catch (diskErr) {
      console.warn("Disk write warning, using Data URL fallback:", diskErr);
      const base64 = buffer.toString("base64");
      photoUrl = `data:${fotoFile.type};base64,${base64}`;
    }
  } catch (err) {
    console.error("Error processing photo:", err);
    return { success: false, error: "Gagal memproses file foto." };
  }

  try {
    await db.$transaction(async (tx) => {
      const laporan = await tx.laporanSampah.create({
        data: {
          deskripsi:     parsed.data.deskripsi,
          berat:         parsed.data.berat,
          userId:        session.id,
          jenisSampahId: parsed.data.jenisSampahId,
          wilayahId:     parsed.data.wilayahId,
        },
      });

      await tx.fotoSampah.create({
        data: {
          urlFoto: photoUrl,
          laporanId: laporan.id,
        },
      });

      await tx.logAktivitas.create({
        data: {
          userId: session.id,
          aktivitas: `Membuat laporan sampah baru (${parsed.data.berat} kg)`,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/waste");
  } catch (e: any) {
    console.error("Database error creating waste:", e);
    return { success: false, error: e?.message || "Gagal menyimpan laporan sampah ke database." };
  }

  redirect("/dashboard/waste");
}

export async function deleteWasteAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi habis." };
  if (session.role !== "ADMIN") return { success: false, error: "Hanya Admin yang dapat menghapus data." };

  try {
    await db.laporanSampah.delete({ where: { id } });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/waste");
    return { success: true, message: "Laporan sampah berhasil dihapus." };
  } catch (e) {
    return { success: false, error: "Gagal menghapus laporan sampah." };
  }
}

export async function updateWasteStatusAction(id: string, newStatus: WasteStatus) {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi habis." };
  if (session.role !== "ADMIN") return { success: false, error: "Hanya Admin yang dapat mengubah status." };

  try {
    const waste = await db.laporanSampah.findUnique({
      where: { id },
      select: { id: true, status: true, berat: true, userId: true },
    });
    if (!waste) return { success: false, error: "Data tidak ditemukan." };

    const oldStatus = waste.status;
    if (oldStatus === newStatus) return { success: true, message: "Status tidak berubah." };

    const points = Math.max(1, Math.round(waste.berat * 10));

    await db.$transaction(async (tx) => {
      await tx.laporanSampah.update({ where: { id }, data: { status: newStatus } });

      if (newStatus === "SELESAI" && oldStatus !== "SELESAI") {
        await tx.user.update({ where: { id: waste.userId }, data: { points: { increment: points } } });
        await tx.logPoin.create({
          data: {
            userId: waste.userId,
            jumlahPoin: points,
            tipe: "MASUK",
            keterangan: `Poin dari laporan sampah yang diselesaikan (${waste.berat} kg)`,
          },
        });
      } else if (oldStatus === "SELESAI" && newStatus !== "SELESAI") {
        const user = await tx.user.findUnique({ where: { id: waste.userId }, select: { points: true } });
        await tx.user.update({
          where: { id: waste.userId },
          data: { points: Math.max(0, (user?.points ?? 0) - points) },
        });
      }

      await tx.logAktivitas.create({
        data: {
          userId: session.id,
          aktivitas: `Mengubah status laporan ${id} menjadi ${newStatus}`,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/waste");
    revalidatePath(`/dashboard/waste/${id}`);
    return { success: true, message: `Status diubah menjadi ${newStatus}.` };
  } catch (e) {
    return { success: false, error: "Gagal memperbarui status." };
  }
}

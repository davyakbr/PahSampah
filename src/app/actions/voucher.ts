"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const voucherSchema = z.object({
  judul:     z.string().min(2, "Judul voucher minimal 2 karakter."),
  deskripsi: z.string().optional(),
  biayaPoin: z.coerce.number().min(1, "Biaya poin minimal 1."),
  stok:      z.coerce.number().min(1, "Stok minimal 1."),
});

function generateKodeVoucher(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PAH-${random(4)}-${random(5)}`;
}

export async function addVoucherAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak. Hanya Admin yang dapat menambah voucher." };

  const parsed = voucherSchema.safeParse({
    judul:     formData.get("judul"),
    deskripsi: formData.get("deskripsi"),
    biayaPoin: formData.get("biayaPoin"),
    stok:      formData.get("stok"),
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  // Auto-generate unique kode voucher
  let kodeVoucher = generateKodeVoucher();
  let attempts = 0;
  while (await db.voucher.findUnique({ where: { kodeVoucher } })) {
    kodeVoucher = generateKodeVoucher();
    if (++attempts > 10) return { success: false, error: "Gagal membuat kode unik, coba lagi." };
  }

  try {
    await db.voucher.create({
      data: {
        judul:       parsed.data.judul,
        kodeVoucher: kodeVoucher,
        deskripsi:   parsed.data.deskripsi || null,
        biayaPoin:   parsed.data.biayaPoin,
        stok:        parsed.data.stok,
      },
    });

    await db.logAktivitas.create({
      data: {
        userId: session.id,
        aktivitas: `Menambahkan voucher baru: ${parsed.data.judul} (${kodeVoucher})`,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vouchers");
    return { success: true, message: `Voucher berhasil ditambahkan! Kode: ${kodeVoucher}` };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menambahkan voucher." };
  }
}

export async function deleteVoucherAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { success: false, error: "Akses ditolak." };

  try {
    const count = await db.penukaranVoucher.count({ where: { voucherId: id } });
    if (count > 0) {
      return { success: false, error: "Voucher ini sudah pernah ditukarkan oleh pengguna dan tidak dapat dihapus (onDelete: Restrict)." };
    }

    await db.voucher.delete({ where: { id } });

    await db.logAktivitas.create({
      data: {
        userId: session.id,
        aktivitas: `Menghapus voucher ID: ${id}`,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vouchers");
    return { success: true, message: "Voucher berhasil dihapus." };
  } catch (e) {
    return { success: false, error: "Gagal menghapus voucher." };
  }
}

export async function redeemVoucherAction(voucherId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Sesi habis. Silakan login kembali." };

  try {
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });

    if (!user) return { success: false, error: "Pengguna tidak ditemukan." };

    const voucher = await db.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) return { success: false, error: "Voucher tidak ditemukan." };

    if (user.points < voucher.biayaPoin) {
      return {
        success: false,
        error: `Poin tidak cukup. Anda membutuhkan ${voucher.biayaPoin} poin (Saldo: ${user.points} poin).`,
      };
    }

    if (voucher.stok <= 0) {
      return { success: false, error: "Stok voucher telah habis." };
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.id },
        data: { points: { decrement: voucher.biayaPoin } },
      });

      await tx.voucher.update({
        where: { id: voucherId },
        data: { stok: { decrement: 1 } },
      });

      await tx.penukaranVoucher.create({
        data: {
          userId: session.id,
          voucherId: voucher.id,
        },
      });

      await tx.logPoin.create({
        data: {
          userId: session.id,
          jumlahPoin: voucher.biayaPoin,
          tipe: "KELUAR",
          keterangan: `Penukaran ${voucher.judul}`,
        },
      });

      await tx.logAktivitas.create({
        data: {
          userId: session.id,
          aktivitas: `Menukarkan voucher: ${voucher.judul}`,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vouchers");
    return {
      success: true,
      message: `Berhasil menukarkan ${voucher.judul}! Kode Voucher: ${voucher.kodeVoucher}`,
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menukarkan voucher." };
  }
}

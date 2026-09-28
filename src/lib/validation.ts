import { z } from "zod";
import { WasteCategory } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(50, "Nama maksimal 50 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  noHp: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(/^[0-9+ -]{9,15}$/, "Format nomor HP tidak valid (contoh: 081234567890)"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const wasteSchema = z.object({
  name: z.string().min(1, "Nama sampah wajib diisi").max(100, "Nama sampah maksimal 100 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  weight: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .pipe(z.number({ message: "Berat harus berupa angka" }).gt(0, "Berat harus lebih dari 0")),
  location: z.string().min(1, "Lokasi wajib diisi").max(100, "Lokasi maksimal 100 karakter"),
  category: z.nativeEnum(WasteCategory, {
    message: "Jenis sampah harus salah satu dari: Organik, Anorganik, B3",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WasteInput = z.infer<typeof wasteSchema>;

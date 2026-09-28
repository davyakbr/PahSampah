"use server";

import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validation";
import { createSession, destroySession } from "@/lib/auth";
import * as bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  let isSuccess = false;
  try {
    const user = await db.user.findUnique({
      where: { email: result.data.email },
    });

    if (!user) {
      return {
        success: false,
        error: "Email atau password salah.",
      };
    }

    const isValid = await bcrypt.compare(result.data.password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Email atau password salah.",
      };
    }

    await createSession({
      id: user.id,
      name: user.nama,
      email: user.email,
      role: user.role,
    });
    isSuccess = true;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server.",
    };
  }

  if (isSuccess) {
    redirect("/dashboard");
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const noHp = formData.get("noHp") as string;
  const password = formData.get("password") as string;

  const result = registerSchema.safeParse({ name, email, noHp, password });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  let isSuccess = false;
  try {
    const existingEmail = await db.user.findUnique({
      where: { email: result.data.email },
    });
    if (existingEmail) {
      return {
        success: false,
        error: "Email sudah terdaftar.",
      };
    }

    const existingPhone = await db.user.findUnique({
      where: { noHp: result.data.noHp },
    });
    if (existingPhone) {
      return {
        success: false,
        error: "Nomor HP sudah terdaftar.",
      };
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const user = await db.user.create({
      data: {
        nama: result.data.name,
        email: result.data.email,
        noHp: result.data.noHp,
        password: hashedPassword,
        role: "USER",
      },
    });

    await createSession({
      id: user.id,
      name: user.nama,
      email: user.email,
      role: user.role,
    });
    isSuccess = true;
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server.",
    };
  }

  if (isSuccess) {
    redirect("/dashboard");
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

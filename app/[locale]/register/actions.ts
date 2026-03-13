"use server";

import bcrypt from "bcryptjs";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";

const messages = {
  ru: {
    required: "Email и пароль обязательны",
    min: "Пароль должен быть минимум 6 символов",
    exists: "Пользователь с таким email уже существует"
  },
  en: {
    required: "Email and password are required",
    min: "Password must be at least 6 characters",
    exists: "A user with this email already exists"
  },
  de: {
    required: "E-Mail und Passwort sind erforderlich",
    min: "Das Passwort muss mindestens 6 Zeichen lang sein",
    exists: "Ein Benutzer mit dieser E-Mail existiert bereits"
  }
} as const;

export async function registerAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "ru") as "ru" | "en" | "de";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const t = messages[locale] ?? messages.ru;

  if (!email || !password) {
    redirect(`/${locale}/register?error=${encodeURIComponent(t.required)}`);
  }

  if (password.length < 6) {
    redirect(`/${locale}/register?error=${encodeURIComponent(t.min)}`);
  }

  const existingUser = await prisma.user.findUnique({
    where: {email}
  });

  if (existingUser) {
    redirect(`/${locale}/register?error=${encodeURIComponent(t.exists)}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
      role: "USER"
    }
  });

  redirect(`/${locale}/login`);
}

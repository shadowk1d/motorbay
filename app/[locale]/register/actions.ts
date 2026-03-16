"use server";

import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";
import {requestOtpCode, verifyOtpCode} from "@/lib/otp";
import type {OtpLocale} from "@/lib/otp";

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

export async function sendRegisterCodeAction(params: {
  locale: OtpLocale;
  email: string;
  password: string;
}) {
  const locale = params.locale;
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const t = messages[locale] ?? messages.ru;

  if (!email || !password) {
    return {ok: false as const, error: t.required};
  }

  if (password.length < 6) {
    return {ok: false as const, error: t.min};
  }

  const existingUser = await prisma.user.findUnique({
    where: {email}
  });

  if (existingUser) {
    return {ok: false as const, error: t.exists};
  }

  const result = await requestOtpCode({email, locale, purpose: "register"});
  if (!result.ok) {
    if (result.reason === "cooldown") {
      return {ok: false as const, error: "codeCooldown" as const};
    }
    return {ok: false as const, error: "sendFailed" as const};
  }

  return {ok: true as const};
}

export async function completeRegisterAction(params: {
  locale: OtpLocale;
  name: string;
  email: string;
  password: string;
  code: string;
}) {
  const locale = params.locale;
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const code = params.code.trim();
  const t = messages[locale] ?? messages.ru;

  if (!email || !password || !code) {
    return {ok: false as const, error: t.required};
  }

  if (password.length < 6) {
    return {ok: false as const, error: t.min};
  }

  const verify = await verifyOtpCode({email, code, purpose: "register"});
  if (!verify.ok) {
    if (verify.reason === "too_many_attempts") {
      return {ok: false as const, error: "tooManyAttempts" as const};
    }
    return {ok: false as const, error: "invalidCode" as const};
  }

  const existingUser = await prisma.user.findUnique({
    where: {email}
  });

  if (existingUser) {
    return {ok: false as const, error: t.exists};
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

  return {ok: true as const};
}

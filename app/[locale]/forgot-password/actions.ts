"use server";

import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";
import {requestOtpCode, verifyOtpCode} from "@/lib/otp";
import type {OtpLocale} from "@/lib/otp";

export async function sendResetCodeAction(email: string, locale: OtpLocale) {
  const normalised = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({where: {email: normalised}});
  if (!user) {
    return {ok: false as const, error: "userNotFound" as const};
  }

  const result = await requestOtpCode({email: normalised, locale, purpose: "reset_password"});
  if (!result.ok) {
    return {ok: false as const, error: result.reason === "cooldown" ? ("cooldown" as const) : ("sendFailed" as const)};
  }

  return {ok: true as const};
}

export async function resetPasswordAction(params: {
  email: string;
  code: string;
  newPassword: string;
  locale: OtpLocale;
}) {
  const email = params.email.trim().toLowerCase();

  if (params.newPassword.length < 6) {
    return {ok: false as const, error: "passwordMin" as const};
  }

  const verify = await verifyOtpCode({email, code: params.code, purpose: "reset_password"});
  if (!verify.ok) {
    const errorMap = {
      not_found: "invalidCode",
      too_many_attempts: "tooManyAttempts",
      invalid: "invalidCode"
    } as const;
    return {ok: false as const, error: errorMap[verify.reason]};
  }

  const passwordHash = await bcrypt.hash(params.newPassword, 10);
  await prisma.user.update({where: {email}, data: {passwordHash}});

  return {ok: true as const};
}

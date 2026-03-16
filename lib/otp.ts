import bcrypt from "bcryptjs";
import {randomInt} from "node:crypto";
import {prisma} from "@/lib/prisma";
import {sendOtpEmail} from "@/lib/otp-mail";

export type OtpLocale = "ru" | "en" | "de";
export type OtpPurpose = "login" | "register" | "reset_password";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

function generateOtpCode() {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export async function requestOtpCode(params: {
  email: string;
  locale: OtpLocale;
  purpose: OtpPurpose;
}) {
  const email = params.email.trim().toLowerCase();
  const now = new Date();

  const cooldownBoundary = new Date(now.getTime() - OTP_COOLDOWN_SECONDS * 1000);
  const recentCode = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose: params.purpose,
      createdAt: {
        gt: cooldownBoundary
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (recentCode) {
    return {ok: false as const, reason: "cooldown" as const};
  }

  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, 10);

  const otpRecord = await prisma.emailOtp.create({
    data: {
      email,
      purpose: params.purpose,
      codeHash,
      expiresAt: new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000)
    }
  });

  const sent = await sendOtpEmail({
    to: email,
    code,
    locale: params.locale,
    purpose: params.purpose
  });

  if (!sent) {
    await prisma.emailOtp.delete({where: {id: otpRecord.id}});
    return {ok: false as const, reason: "send_failed" as const};
  }

  return {ok: true as const};
}

export async function verifyOtpCode(params: {
  email: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<{ok: true} | {ok: false; reason: "not_found" | "too_many_attempts" | "invalid"}> {
  const email = params.email.trim().toLowerCase();
  const now = new Date();

  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose: params.purpose,
      usedAt: null,
      expiresAt: {gt: now}
    },
    orderBy: {createdAt: "desc"}
  });

  if (!record) {
    return {ok: false, reason: "not_found"};
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return {ok: false, reason: "too_many_attempts"};
  }

  await prisma.emailOtp.update({
    where: {id: record.id},
    data: {attempts: record.attempts + 1}
  });

  const match = await bcrypt.compare(params.code, record.codeHash);
  if (!match) {
    return {ok: false, reason: "invalid"};
  }

  await prisma.emailOtp.update({
    where: {id: record.id},
    data: {usedAt: now}
  });

  return {ok: true};
}

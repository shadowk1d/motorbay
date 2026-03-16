"use client";

import {useRef, useState, useTransition} from "react";
import {sendResetCodeAction, resetPasswordAction} from "./actions";
import type {OtpLocale} from "@/lib/otp";

const OTP_LENGTH = 6;

type Strings = {
  text: string;
  email: string;
  sendCode: string;
  code: string;
  newPassword: string;
  resetPassword: string;
  passwordReset: string;
  goLogin: string;
  userNotFound: string;
  invalidCode: string;
  tooManyAttempts: string;
  codeCooldown: string;
  sendFailed: string;
  codeSentTo: string;
  passwordMin: string;
};

export default function ForgotPasswordForm({locale, s}: {locale: OtpLocale; s: Strings}) {
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({length: OTP_LENGTH}, () => ""));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = otpDigits.join("");

  function setDigitAt(index: number, value: string) {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleDigitChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      setDigitAt(index, "");
      return;
    }

    const chars = clean.slice(0, OTP_LENGTH).split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      let pointer = index;
      for (const char of chars) {
        if (pointer >= OTP_LENGTH) {
          break;
        }
        next[pointer] = char;
        pointer += 1;
      }
      return next;
    });

    const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    otpRefs.current[nextIndex]?.focus();
  }

  function handleDigitKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleDigitPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }

    setOtpDigits(() => {
      const next = Array.from({length: OTP_LENGTH}, (_, i) => pasted[i] ?? "");
      return next;
    });

    const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    if (lastIndex >= 0) {
      otpRefs.current[lastIndex]?.focus();
    }
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendResetCodeAction(email.trim().toLowerCase(), locale);
      if (!result.ok) {
        const map: Record<string, string> = {
          userNotFound: s.userNotFound,
          cooldown: s.codeCooldown,
          sendFailed: s.sendFailed
        };
        setError(map[result.error] ?? result.error);
        return;
      }
      setOtpDigits(Array.from({length: OTP_LENGTH}, () => ""));
      setStep("code");
    });
  }

  function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const code = String(fd.get("code") ?? "").trim() || otpValue;
    const newPassword = String(fd.get("newPassword") ?? "");
    startTransition(async () => {
      const result = await resetPasswordAction({email, code, newPassword, locale});
      if (!result.ok) {
        const map: Record<string, string> = {
          invalidCode: s.invalidCode,
          tooManyAttempts: s.tooManyAttempts,
          passwordMin: s.passwordMin,
          sendFailed: s.sendFailed
        };
        setError(map[result.error] ?? result.error);
        return;
      }
      setStep("done");
    });
  }

  if (step === "done") {
    return (
      <p className="form-success">
        {s.passwordReset}{" "}
        <a href={`/${locale}/login`}>{s.goLogin}</a>
      </p>
    );
  }

  if (step === "code") {
    return (
      <>
        <p className="form-success" style={{marginBottom: "1rem"}}>
          {s.codeSentTo.replace("{email}", email)}
        </p>
        <form onSubmit={handleReset} className="auth-form">
          <input type="hidden" name="code" value={otpValue} readOnly required />
          <p className="otp-label">{s.code}</p>
          <div className="otp-grid" aria-label={s.code}>
            {Array.from({length: OTP_LENGTH}, (_, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                value={otpDigits[index]}
                onChange={(event) => handleDigitChange(index, event.target.value)}
                onKeyDown={(event) => handleDigitKeyDown(index, event)}
                onPaste={handleDigitPaste}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                className="otp-input"
                aria-label={`${s.code} ${index + 1}`}
                required
              />
            ))}
          </div>
          <input type="password" name="newPassword" placeholder={s.newPassword} required minLength={6} />
          <button type="submit" className="primary-button wide-button" disabled={isPending}>
            {s.resetPassword}
          </button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </>
    );
  }

  return (
    <>
      <p>{s.text}</p>
      <form onSubmit={handleSend} className="auth-form">
        <input
          type="email"
          placeholder={s.email}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" className="primary-button wide-button" disabled={isPending}>
          {s.sendCode}
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </>
  );
}

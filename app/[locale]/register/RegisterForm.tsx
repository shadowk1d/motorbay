"use client";

import {useRef, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {completeRegisterAction, sendRegisterCodeAction} from "./actions";
import type {OtpLocale} from "@/lib/otp";

const OTP_LENGTH = 6;

type Strings = {
  name: string;
  email: string;
  password: string;
  signUp: string;
  sendCode: string;
  code: string;
  invalidCode: string;
  tooManyAttempts: string;
  codeCooldown: string;
  sendFailed: string;
  codeSentTo: string;
};

export default function RegisterForm({locale, s}: {locale: OtpLocale; s: Strings}) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    setOtpDigits(() => Array.from({length: OTP_LENGTH}, (_, i) => pasted[i] ?? ""));

    const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    if (lastIndex >= 0) {
      otpRefs.current[lastIndex]?.focus();
    }
  }

  function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalEmail = email.trim().toLowerCase();

    startTransition(async () => {
      const result = await sendRegisterCodeAction({
        locale,
        email: normalEmail,
        password
      });

      if (!result.ok) {
        const map: Record<string, string> = {
          invalidCode: s.invalidCode,
          tooManyAttempts: s.tooManyAttempts,
          codeCooldown: s.codeCooldown,
          sendFailed: s.sendFailed
        };
        setError(map[result.error] ?? result.error);
        return;
      }

      setEmail(normalEmail);
      setOtpDigits(Array.from({length: OTP_LENGTH}, () => ""));
      setStep("code");
    });
  }

  function handleComplete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await completeRegisterAction({
        locale,
        name,
        email,
        password,
        code: otpValue
      });

      if (!result.ok) {
        const map: Record<string, string> = {
          invalidCode: s.invalidCode,
          tooManyAttempts: s.tooManyAttempts,
          codeCooldown: s.codeCooldown,
          sendFailed: s.sendFailed
        };
        setError(map[result.error] ?? result.error);
        return;
      }

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (login?.error) {
        setError(s.sendFailed);
        return;
      }

      router.push(`/${locale}`);
      router.refresh();
    });
  }

  if (step === "code") {
    return (
      <>
        <p className="form-success" style={{marginBottom: "1rem"}}>
          {s.codeSentTo.replace("{email}", email)}
        </p>
        <form className="auth-form" onSubmit={handleComplete}>
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
          <button type="submit" className="primary-button wide-button" disabled={isPending}>
            {s.signUp}
          </button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </>
    );
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSendCode}>
        <input type="text" name="name" placeholder={s.name} value={name} onChange={(event) => setName(event.target.value)} />
        <input
          type="email"
          name="email"
          placeholder={s.email}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder={s.password}
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className="primary-button wide-button" disabled={isPending}>
          {s.sendCode}
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}
    </>
  );
}

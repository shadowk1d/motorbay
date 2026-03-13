"use server";

import {AuthError} from "next-auth";
import {signIn} from "@/auth";
import {redirect} from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "ru");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: `/${locale}`
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/${locale}/login?error=${encodeURIComponent(locale === "de" ? "Ungültige E-Mail oder falsches Passwort" : locale === "en" ? "Invalid email or password" : "Неверный email или пароль")}`);
    }

    throw error;
  }
}

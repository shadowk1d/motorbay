import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {getLocale} from "next-intl/server";

function localePrefix(locale: string) {
  return locale || "ru";
}

export async function requireAdmin() {
  const [session, locale] = await Promise.all([auth(), getLocale().catch(() => "ru")]);
  const currentLocale = localePrefix(locale);

  if (!session) {
    redirect(`/${currentLocale}/login`);
  }

  if (session.user?.role !== "ADMIN") {
    redirect(`/${currentLocale}`);
  }

  return session;
}

export async function requireUser() {
  const [session, locale] = await Promise.all([auth(), getLocale().catch(() => "ru")]);
  const currentLocale = localePrefix(locale);

  if (!session) {
    redirect(`/${currentLocale}/login`);
  }

  return session;
}

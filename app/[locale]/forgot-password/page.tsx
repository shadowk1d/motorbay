import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";
import ForgotPasswordForm from "./ForgotPasswordForm";
import type {OtpLocale} from "@/lib/otp";

export default async function ForgotPasswordPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations("Auth");

  return (
    <section className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("forgotPasswordTitle")}</h1>

          <ForgotPasswordForm
            locale={locale as OtpLocale}
            s={{
              text: t("forgotPasswordText"),
              email: t("email"),
              sendCode: t("sendCode"),
              code: t("code"),
              newPassword: t("newPassword"),
              resetPassword: t("resetPassword"),
              passwordReset: t("passwordReset"),
              goLogin: t("goLogin"),
              userNotFound: t("userNotFound"),
              invalidCode: t("invalidCode"),
              tooManyAttempts: t("tooManyAttempts"),
              codeCooldown: t("codeCooldown"),
              sendFailed: t("sendFailed"),
              codeSentTo: t.raw("codeSentTo") as string,
              passwordMin: t("passwordMin")
            }}
          />

          <p className="auth-bottom-text">
            <Link href="/login">{t("goLogin")}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

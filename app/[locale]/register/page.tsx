import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import RegisterForm from "./RegisterForm";
import type {OtpLocale} from "@/lib/otp";

export default async function RegisterPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const [{locale}, t] = await Promise.all([
    params,
    getTranslations("Auth")
  ]);

  return (
    <section className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("registerTitle")}</h1>
          <p>{t("registerText")}</p>

          <RegisterForm
            locale={locale as OtpLocale}
            s={{
              name: t("name"),
              email: t("email"),
              password: t("password"),
              signUp: t("signUp"),
              sendCode: t("sendCode"),
              code: t("code"),
              invalidCode: t("invalidCode"),
              tooManyAttempts: t("tooManyAttempts"),
              codeCooldown: t("codeCooldown"),
              sendFailed: t("sendFailed"),
              codeSentTo: t.raw("codeSentTo") as string
            }}
          />

          <p className="auth-bottom-text">
            {t("haveAccount")} <Link href="/login">{t("goLogin")}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

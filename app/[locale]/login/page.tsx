import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {loginAction} from "./actions";

export default async function LoginPage({
  searchParams,
  params
}: {
  searchParams?: Promise<{error?: string}>;
  params: Promise<{locale: string}>;
}) {
  const [{locale}, rawSearchParams, t] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("Auth")
  ]);
  const resolvedSearchParams = rawSearchParams as {error?: string};

  const error = resolvedSearchParams.error ? decodeURIComponent(resolvedSearchParams.error) : "";

  return (
    <section className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("loginTitle")}</h1>
          <p>{t("loginText")}</p>

          <form action={loginAction} className="auth-form">
            <input type="hidden" name="locale" value={locale} />
            <input type="email" name="email" placeholder={t("email")} required />
            <input type="password" name="password" placeholder={t("password")} required />
            <button type="submit" className="primary-button wide-button">
              {t("signIn")}
            </button>
          </form>

          {error ? <p className="form-error">{error}</p> : null}

          <p className="auth-bottom-text">
            {t("noAccount")} <Link href="/register">{t("goRegister")}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

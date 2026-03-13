import {auth, signOut} from "@/auth";
import {Link} from "@/i18n/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const session = await auth();
  const t = await getTranslations("Header");
  const locale = await getLocale();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          MotorBay
        </Link>

        <nav className="main-nav">
          <Link href="/">{t("home")}</Link>
          <Link href="/cars">{t("catalog")}</Link>
          <Link href="/contact">{t("contact")}</Link>
          <Link href="/about">{t("about")}</Link>
          {session?.user?.role === "ADMIN" && <Link href="/admin">{t("admin")}</Link>}
          {session?.user && <Link href="/profile">{t("profile")}</Link>}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />

          {!session ? (
            <>
              <Link href="/login" className="lang-button">
                {t("login")}
              </Link>
              <Link href="/register" className="profile-link">
                {t("register")}
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signOut({redirectTo: `/${locale}`});
              }}
            >
              <button type="submit" className="profile-link">
                {t("logout")}
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

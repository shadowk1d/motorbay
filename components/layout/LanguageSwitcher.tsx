"use client";

import {useLocale, useTranslations} from "next-intl";
import {usePathname, useRouter} from "@/i18n/navigation";

const locales = ["ru", "en", "de"] as const;

export default function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="language-switcher" aria-label={t("label")}>
      {locales.map((item) => {
        const active = item === locale;

        return (
          <button
            key={item}
            type="button"
            className={active ? "lang-button lang-button-active" : "lang-button"}
            onClick={() => router.replace(pathname, {locale: item})}
          >
            {t(item)}
          </button>
        );
      })}
    </div>
  );
}

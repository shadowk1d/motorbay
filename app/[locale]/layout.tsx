import {NextIntlClientProvider} from "next-intl";
import {getMessages, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {Suspense} from "react";
import {routing} from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import HtmlLang from "@/components/layout/HtmlLang";
import LogoutToast from "@/components/layout/LogoutToast";

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as "ru" | "en" | "de")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLang locale={locale} />
      <div className="site-shell">
        <Header />
        <Suspense fallback={null}>
          <LogoutToast
            title={messages.Header.loggedOutTitle as string}
            text={messages.Header.loggedOutText as string}
            close={messages.Header.loggedOutClose as string}
          />
        </Suspense>
        <div className="site-content">{children}</div>
        <Footer />
        <CookieBanner
          title={messages.Cookie.title as string}
          text={messages.Cookie.text as string}
          accept={messages.Cookie.accept as string}
          decline={messages.Cookie.decline as string}
          policy={messages.Cookie.policy as string}
          settings={messages.Cookie.settings as string}
          save={messages.Cookie.save as string}
          necessaryTitle={messages.Cookie.necessaryTitle as string}
          necessaryText={messages.Cookie.necessaryText as string}
          optionalTitle={messages.Cookie.optionalTitle as string}
          optionalText={messages.Cookie.optionalText as string}
        />
      </div>
    </NextIntlClientProvider>
  );
}

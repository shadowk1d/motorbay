import {getTranslations} from "next-intl/server";

type Props = {params: Promise<{locale: string}>};

const content = {
  de: {
    introTitle: "Angaben gemäß §5 TMG",
    company: ["MotorBay UG (haftungsbeschränkt)", "Verkehrshof 2–4", "14478 Potsdam", "Deutschland"],
    registerTitle: "Registereintrag",
    register: ["Registergericht: Amtsgericht Potsdam", "Handelsregister: HRB 409699"],
    taxTitle: "Steuerangaben",
    tax: ["Steuernummer: 046/114/01553", "Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: DE456467546", "EORI-Nummer: DE282111176465577"],
    managerTitle: "Vertreten durch den Geschäftsführer",
    manager: "Aleksandr Stelmakh",
    contactTitle: "Kontakt",
    contact: ["Telefon: +49 173 6601635", "E-Mail: motor.bay.de@gmail.com"],
    liabilityContentTitle: "Haftung für Inhalte",
    liabilityContent: "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.",
    liabilityLinksTitle: "Haftung für Links",
    liabilityLinks: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.",
    copyrightTitle: "Urheberrecht",
    copyright: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht."
  },
  en: {
    introTitle: "Information pursuant to Section 5 TMG",
    company: ["MotorBay UG (haftungsbeschränkt)", "Verkehrshof 2–4", "14478 Potsdam", "Germany"],
    registerTitle: "Commercial register",
    register: ["Register court: Amtsgericht Potsdam", "Commercial register number: HRB 409699"],
    taxTitle: "Tax information",
    tax: ["Tax number: 046/114/01553", "VAT ID pursuant to Section 27a UStG: DE456467546", "EORI number: DE282111176465577"],
    managerTitle: "Represented by the Managing Director",
    manager: "Aleksandr Stelmakh",
    contactTitle: "Contact",
    contact: ["Phone: +49 173 6601635", "Email: motor.bay.de@gmail.com"],
    liabilityContentTitle: "Liability for content",
    liabilityContent: "The contents of our pages were created with the greatest care. However, we cannot guarantee the accuracy, completeness or timeliness of the content.",
    liabilityLinksTitle: "Liability for links",
    liabilityLinks: "Our website contains links to external third-party websites. We have no influence on the content of those websites and therefore cannot assume any liability for such external content.",
    copyrightTitle: "Copyright",
    copyright: "The content and works created by the site operators on these pages are subject to German copyright law."
  },
  ru: {
    introTitle: "Информация согласно §5 TMG",
    company: ["MotorBay UG (haftungsbeschränkt)", "Verkehrshof 2–4", "14478 Potsdam", "Германия"],
    registerTitle: "Регистрационные данные",
    register: ["Регистрирующий суд: Amtsgericht Potsdam", "Торговый реестр: HRB 409699"],
    taxTitle: "Налоговые данные",
    tax: ["Steuernummer: 046/114/01553", "Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: DE456467546", "EORI-Nummer: DE282111176465577"],
    managerTitle: "Представлено управляющим директором",
    manager: "Aleksandr Stelmakh",
    contactTitle: "Контакты",
    contact: ["Телефон: +49 173 6601635", "E-Mail: motor.bay.de@gmail.com"],
    liabilityContentTitle: "Ответственность за контент",
    liabilityContent: "Содержимое наших страниц создано с максимальной тщательностью. Однако мы не можем гарантировать правильность, полноту и актуальность материалов.",
    liabilityLinksTitle: "Ответственность за ссылки",
    liabilityLinks: "Наше предложение содержит ссылки на внешние сайты третьих лиц, на содержание которых мы не имеем влияния. Поэтому мы не можем нести ответственность за это внешнее содержание.",
    copyrightTitle: "Авторское право",
    copyright: "Материалы и работы, созданные операторами сайта, подпадают под действие немецкого авторского права."
  }
} as const;

export default async function ImpressumPage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations("Impressum");
  const c = content[(locale as keyof typeof content) || "de"] ?? content.de;

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card legal-page">
          <h1>{t("title")}</h1>

          <section>
            <h2>{c.introTitle}</h2>
            {c.company.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section>
            <h2>{c.registerTitle}</h2>
            {c.register.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section>
            <h2>{c.taxTitle}</h2>
            {c.tax.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section>
            <h2>{c.managerTitle}</h2>
            <p>{c.manager}</p>
          </section>

          <section>
            <h2>{c.contactTitle}</h2>
            {c.contact.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>

          <section>
            <h2>{c.liabilityContentTitle}</h2>
            <p>{c.liabilityContent}</p>
          </section>

          <section>
            <h2>{c.liabilityLinksTitle}</h2>
            <p>{c.liabilityLinks}</p>
          </section>

          <section>
            <h2>{c.copyrightTitle}</h2>
            <p>{c.copyright}</p>
          </section>
        </div>
      </div>
    </main>
  );
}

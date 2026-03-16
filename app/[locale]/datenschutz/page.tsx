import {getTranslations} from "next-intl/server";

type Props = {params: Promise<{locale: string}>};

const content = {
  de: {
    sections: [
      {
        title: "1. Verantwortlicher",
        body: [
          "MotorBay UG (haftungsbeschränkt)",
          "Verkehrshof 2–4, 14478 Potsdam, Deutschland",
          "Geschäftsführer: Aleksandr Stelmakh",
          "Telefon: +49 173 6601635",
          "E-Mail: motor.bay.de@gmail.com"
        ]
      },
      {
        title: "2. Allgemeine Hinweise",
        body: [
          "Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).",
          "Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können."
        ]
      },
      {
        title: "3. Datenerfassung beim Besuch der Website",
        body: [
          "Beim Besuch unserer Website werden automatisch technische Informationen durch den Server erfasst.",
          "Dazu gehören insbesondere: IP-Adresse, Datum und Uhrzeit der Anfrage, Browsertyp und Browserversion, verwendetes Betriebssystem sowie Referrer URL.",
          "Diese Daten werden zur Gewährleistung eines sicheren und stabilen Betriebs der Website verarbeitet.",
          "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO."
        ]
      },
      {
        title: "4. Hosting",
        body: [
          "Unsere Website wird auf Servern der Hetzner Online GmbH gehostet.",
          "Anbieter: Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Deutschland.",
          "Der Hosting-Anbieter verarbeitet personenbezogene Daten der Websitebesucher, insbesondere IP-Adressen, um den sicheren Betrieb der Website zu gewährleisten.",
          "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
          "Weitere Informationen: https://www.hetzner.com/de/legal/privacy-policy"
        ]
      },
      {
        title: "5. Server-Log-Dateien",
        body: [
          "Der Hosting-Anbieter erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien.",
          "Diese Informationen umfassen: Browsertyp, Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage sowie IP-Adresse.",
          "Diese Daten werden nicht mit anderen Datenquellen zusammengeführt."
        ]
      },
      {
        title: "6. Registrierung und Benutzerkonto",
        body: [
          "Auf unserer Website können Nutzer ein Benutzerkonto erstellen.",
          "Dabei werden insbesondere Name, E-Mail-Adresse und Authentifizierungsdaten verarbeitet.",
          "Passwörter werden ausschließlich in gehashter Form gespeichert und nicht im Klartext verarbeitet.",
          "Für Login, Registrierung und Passwort-Zurucksetzen konnen Einmalcodes (OTP) verarbeitet werden.",
          "Die Verarbeitung erfolgt zur Bereitstellung des Benutzerkontos, zur Missbrauchspravention und zur Nutzung der Plattform.",
          "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO."
        ]
      },
      {
        title: "7. Datenbank (Neon PostgreSQL)",
        body: [
          "Zur Speicherung von Nutzerdaten verwenden wir eine Datenbanklösung von Neon.",
          "Dabei konnen personenbezogene Daten wie Name, E-Mail-Adresse, inseratsbezogene Daten und sicherheitsrelevante OTP-Metadaten gespeichert werden, um Benutzerkonten und Plattformfunktionen bereitzustellen."
        ]
      },
      {
        title: "8. Cookies und Consent-Management",
        body: [
          "Unsere Website verwendet technisch notwendige Cookies fur Login, Sicherheit und Sitzungsverwaltung.",
          "Zusatzlich speichern wir Ihre Cookie-Auswahl (Einwilligungsstatus) im Local Storage und als Cookie, damit der Hinweis nicht bei jedem Seitenaufruf erneut angezeigt wird.",
          "Optionale Cookies werden nur nach Ihrer aktiven Auswahl gespeichert."
        ]
      },
      {
        title: "9. Cloudinary (Bereitstellung von Bildern)",
        body: [
          "Zur Darstellung von Bildern verwenden wir den Dienst Cloudinary.",
          "Anbieter: Cloudinary Ltd., 3400 Central Expressway, Santa Clara, CA 95051, USA.",
          "Beim Aufruf von Seiten mit Bildern kann Ihre IP-Adresse an die Server von Cloudinary übertragen werden.",
          "Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO."
        ]
      },
      {
        title: "10. E-Mail-Kommunikation und externe Dienste",
        body: [
          "Fur transaktionale E-Mails (z. B. OTP-Codes fur Login/Registrierung/Passwort-Zurucksetzen sowie Benachrichtigungen zu Besichtigungsanfragen) verwenden wir den Dienst Resend.",
          "Dabei werden insbesondere Empfangeradresse, E-Mail-Inhalt und technische Versanddaten verarbeitet.",
          "Unsere Website kann au?erdem externe Links (z. B. WhatsApp oder Instagram) enthalten. Beim Anklicken gelten die Datenschutzbestimmungen des jeweiligen Anbieters."
        ]
      },
      {
        title: "11. Speicherdauer",
        body: [
          "Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen."
        ]
      },
      {
        title: "12. Rechte der betroffenen Personen",
        body: [
          "Sie haben das Recht auf Auskunft über Ihre gespeicherten Daten, auf Berichtigung unrichtiger Daten, auf Löschung Ihrer Daten, auf Einschränkung der Verarbeitung, auf Widerspruch gegen die Verarbeitung sowie auf Datenübertragbarkeit."
        ]
      },
      {
        title: "13. Beschwerderecht",
        body: [
          "Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren."
        ]
      },
      {
        title: "14. SSL-Verschlüsselung",
        body: [
          "Diese Website nutzt SSL-Verschlüsselung, um die sichere Übertragung von Daten zu gewährleisten."
        ]
      }
    ]
  },

  en: {
    sections: [
      {
        title: "1. Controller",
        body: [
          "MotorBay UG (haftungsbeschränkt)",
          "Verkehrshof 2–4, 14478 Potsdam, Germany",
          "Managing Director: Aleksandr Stelmakh",
          "Phone: +49 173 6601635",
          "Email: motor.bay.de@gmail.com"
        ]
      },
      {
        title: "2. General Information",
        body: [
          "We treat personal data confidentially and in accordance with applicable data protection laws, especially the GDPR.",
          "Personal data means any information that can identify an individual."
        ]
      },
      {
        title: "3. Data Collection When Visiting the Website",
        body: [
          "When visiting the website, technical data may be automatically collected such as IP address, browser type, device information, access time and requested pages.",
          "This processing is based on Art. 6(1)(f) GDPR."
        ]
      },
      {
        title: "4. Hosting",
        body: [
          "This website is hosted by Hetzner Online GmbH.",
          "Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany.",
          "The hosting provider processes visitor data such as IP addresses to ensure the secure operation of the website."
        ]
      },
      {
        title: "5. Server Log Files",
        body: [
          "The hosting provider automatically stores information in server log files.",
          "These include browser type, operating system, referrer URL, hostname, time of request and IP address."
        ]
      },
      {
        title: "6. User Accounts",
        body: [
          "Users may create accounts on the website.",
          "The following data may be processed: name, email address and authentication data.",
          "Passwords are stored in hashed form only.",
          "For login, registration and password reset, one-time codes (OTP) may be processed for security reasons."
        ]
      },
      {
        title: "7. Database (Neon PostgreSQL)",
        body: [
          "User data is stored using Neon PostgreSQL database services, including account data, listing-related data and security-related OTP metadata."
        ]
      },
      {
        title: "8. Cookies and Consent Management",
        body: [
          "The website uses technically necessary cookies for login, security and session management.",
          "We also store your cookie consent choice in local storage and as a cookie so the banner does not reappear on every page view.",
          "Optional cookies are only stored after your explicit choice."
        ]
      },
      {
        title: "9. Cloudinary",
        body: [
          "Images are delivered using the Cloudinary service."
        ]
      },
      {
        title: "10. Email Communication and External Services",
        body: [
          "For transactional emails (e.g. OTP codes for login/registration/password reset and inspection request notifications) we use the Resend service.",
          "This may include processing of recipient email address, message content and technical delivery data.",
          "Our website may also contain links to third-party services such as WhatsApp or Instagram. Their privacy policies apply after you leave our website."
        ]
      },
      {
        title: "11. Data Retention",
        body: [
          "Personal data is stored only as long as necessary for the purposes described."
        ]
      },
      {
        title: "12. User Rights",
        body: [
          "Users have the right to access their data, correct inaccurate data, request deletion, restrict processing, object to processing and receive a copy of their data."
        ]
      },
      {
        title: "13. Right to Lodge a Complaint",
        body: [
          "Users have the right to complain to a data protection authority."
        ]
      },
      {
        title: "14. SSL Encryption",
        body: [
          "This website uses SSL encryption to secure data transmission."
        ]
      }
    ]
  },

  ru: {
    sections: [
      {
        title: "1. Ответственный за обработку данных",
        body: [
          "MotorBay UG (haftungsbeschränkt)",
          "Verkehrshof 2–4, 14478 Potsdam, Германия",
          "Директор: Aleksandr Stelmakh",
          "Телефон: +49 173 6601635",
          "Email: motor.bay.de@gmail.com"
        ]
      },
      {
        title: "2. Общая информация",
        body: [
          "Мы обрабатываем персональные данные в соответствии с законодательством о защите данных, в частности GDPR (DSGVO)."
        ]
      },
      {
        title: "3. Сбор данных при посещении сайта",
        body: [
          "При посещении сайта автоматически собирается техническая информация: IP-адрес, тип браузера, данные устройства, дата и время доступа и запрашиваемые страницы."
        ]
      },
      {
        title: "4. Хостинг",
        body: [
          "Сайт размещается на серверах Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Германия.",
          "Хостинг-провайдер может обрабатывать IP-адреса посетителей для обеспечения работы сайта."
        ]
      },
      {
        title: "5. Server Log Files",
        body: [
          "Сервер автоматически сохраняет технические данные доступа: тип браузера, операционная система, referrer URL, имя хоста, время запроса и IP-адрес."
        ]
      },
      {
        title: "6. Аккаунты пользователей",
        body: [
          "Пользователи могут создать аккаунт на сайте.",
          "Обрабатываются имя, email и данные аутентификации.",
          "Пароли хранятся только в виде хеша.",
          "Для входа, регистрации и сброса пароля могут обрабатываться одноразовые коды (OTP) в целях безопасности."
        ]
      },
      {
        title: "7. База данных (Neon PostgreSQL)",
        body: [
          "Данные пользователей хранятся в базе данных Neon PostgreSQL, включая данные аккаунта, данные объявлений и технические метаданные OTP."
        ]
      },
      {
        title: "8. Cookie и управление согласием",
        body: [
          "Сайт использует технически необходимые cookie для входа, безопасности и управления сессией.",
          "Также мы сохраняем ваш выбор по cookie (статус согласия) в localStorage и в cookie, чтобы баннер не показывался при каждом открытии страницы.",
          "Необязательные cookie сохраняются только после вашего явного выбора."
        ]
      },
      {
        title: "9. Cloudinary",
        body: [
          "Для отображения изображений используется Cloudinary."
        ]
      },
      {
        title: "10. Email-коммуникация и внешние сервисы",
        body: [
          "Для транзакционных писем (например, OTP-коды для входа/регистрации/сброса пароля и уведомления по записи на осмотр) мы используем сервис Resend.",
          "При этом могут обрабатываться адрес получателя, содержимое письма и технические данные доставки.",
          "Сайт также может содержать ссылки на внешние сервисы, например WhatsApp и Instagram. После перехода действуют правила конфиденциальности соответствующего сервиса."
        ]
      },
      {
        title: "11. Срок хранения данных",
        body: [
          "Данные хранятся только столько времени, сколько необходимо для работы сервиса."
        ]
      },
      {
        title: "12. Права пользователей",
        body: [
          "Пользователь имеет право получить информацию о своих данных, исправить данные, удалить данные, ограничить обработку и возразить против обработки."
        ]
      },
      {
        title: "13. Право подать жалобу",
        body: [
          "Пользователь имеет право обратиться в орган по защите данных."
        ]
      },
      {
        title: "14. SSL-шифрование",
        body: [
          "Сайт использует SSL-шифрование для защиты передаваемых данных."
        ]
      }
    ]
  }
} as const;

export default async function DatenschutzPage({params}: Props) {
  const {locale} = await params;
  const c = content[(locale as keyof typeof content) || "de"] ?? content.de;

  const titles = {
    de: "Datenschutzerklärung",
    en: "Privacy Policy",
    ru: "Политика конфиденциальности"
  } as const;

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card legal-page">
          <h1>{titles[locale as keyof typeof titles] ?? titles.de}</h1>
          {c.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
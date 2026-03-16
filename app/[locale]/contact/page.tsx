import {getTranslations} from "next-intl/server";

const WHATSAPP_URL = "https://wa.me/491736601635";
const INSTAGRAM_URL = "https://www.instagram.com/motorbay.de/";

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("text")}</p>

          <div className="contact-list">
            <p>
              <strong>{t("phoneLabel")}:</strong> <a href="tel:+491736601635">+49 173 6601635</a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                +49 173 6601635
              </a>
            </p>
            <p>
              <strong>{t("emailLabel")}:</strong> <a href="mailto:motor.bay.de@gmail.com">motor.bay.de@gmail.com</a>
            </p>
            <p>
              <strong>{t("instagramLabel")}:</strong>{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                @motorbay.de
              </a>
            </p>
          </div>

          <div className="contact-buttons">
            <a href="tel:+491736601635" className="secondary-button">
              {t("call")}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="primary-button">
              {t("whatsapp")}
            </a>
            <a href="mailto:motor.bay.de@gmail.com" className="secondary-button">
              {t("email")}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="secondary-button">
              {t("instagram")}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

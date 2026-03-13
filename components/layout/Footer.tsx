import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";

const WHATSAPP_URL = "https://wa.me/491736601635";
const INSTAGRAM_URL = "https://www.instagram.com/motorbay.de/";

export default async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand-column">
          <h3>MotorBay</h3>
          <p>{t("description")}</p>
        </div>

        <div className="footer-column">
          <h4>{t("navigation")}</h4>
          <div className="footer-links">
            <Link href="/cars">{t("catalog")}</Link>
            <Link href="/contact">{t("contact")}</Link>
            <Link href="/about">{t("about")}</Link>
            <Link href="/impressum">{t("impressum")}</Link>
            <Link href="/datenschutz">{t("privacy")}</Link>
          </div>
        </div>

        <div className="footer-column">
          <h4>{t("contactTitle")}</h4>
          <div className="footer-links footer-contact-list">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              {t("whatsapp")}: +49 173 6601635
            </a>
            <a href="mailto:motor.bay.de@gmail.com">{t("email")}: motor.bay.de@gmail.com</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              {t("instagram")}: @motorbay.de
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>{t("copyright")}</span>
          <div className="footer-bottom-links">
            <Link href="/impressum">{t("impressum")}</Link>
            <Link href="/datenschutz">{t("privacy")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

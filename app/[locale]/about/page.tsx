import {getTranslations} from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>
      </div>
    </main>
  );
}

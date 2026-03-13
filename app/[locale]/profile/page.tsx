import {requireUser} from "@/lib/access";
import {getTranslations} from "next-intl/server";

export default async function ProfilePage() {
  const session = await requireUser();
  const t = await getTranslations("Profile");

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("loggedInAs", {email: session.user.email ?? ""})}</p>
        </div>
      </div>
    </main>
  );
}

import CarCard from "@/components/cars/CarCard";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";
import {Link} from "@/i18n/navigation";

export default async function ProfilePage({params}: {params: Promise<{locale: string}>}) {
  const [{locale}, session, t] = await Promise.all([params, auth(), getTranslations("Profile")]);

  if (!session?.user?.id) {
    return (
      <main className="page-section profile-page">
        <div className="container narrow profile-shell">
          <section className="content-card profile-summary-card">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1>{t("guestTitle")}</h1>
            <p>{t("guestText")}</p>
            <div className="profile-guest-actions">
              <Link href="/login" className="primary-button">
                {t("guestLogin")}
              </Link>
              <Link href="/register" className="secondary-button">
                {t("guestRegister")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const userId = Number(session.user.id);

  const favorites = await prisma.savedCar.findMany({
    where: {userId},
    orderBy: {createdAt: "desc"},
    include: {
      car: {
        include: {
          images: {
            orderBy: {order: "asc"},
            take: 1
          }
        }
      }
    }
  });

  return (
    <main className="page-section profile-page">
      <div className="container narrow profile-shell">
        <section className="content-card profile-summary-card">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("loggedInAs", {email: session.user.email ?? ""})}</p>
        </section>

        <section className="content-card profile-favorites-card">
          <div className="section-header centered">
            <h2>{t("savedListings")}</h2>
            <p>{t("savedCount", {count: favorites.length})}</p>
          </div>

          {favorites.length === 0 ? (
            <p>{t("empty")}</p>
          ) : (
            <div className="cars-grid profile-cars-grid">
              {favorites.map(({car}: any) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  title={`${car.brand} ${car.model}`}
                  subtitle={`${car.year} • ${formatMileage(car.mileage, locale)}`}
                  price={formatPrice(car.price, locale)}
                  fuel={car.fuel}
                  transmission={car.transmission}
                  imageUrl={car.images[0]?.url || car.imageUrl}
                  detailsLabel={t("details")}
                  saveLabel={t("remove")}
                  savedLabel={t("remove")}
                  loginToSaveLabel={t("remove")}
                  noPhotoLabel={t("noPhoto")}
                  locale={locale}
                  currentPath={`/${locale}/profile`}
                  isSaved
                  isAuthenticated
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

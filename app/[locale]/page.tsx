import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import CarCard from "@/components/cars/CarCard";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";
import {getCurrentUserFavoriteIds} from "@/lib/favorites";

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const [{locale}, t, session, favoriteIds, cars] = await Promise.all([
    params,
    getTranslations("Home"),
    auth(),
    getCurrentUserFavoriteIds(),
    prisma.car.findMany({
      orderBy: {createdAt: "desc"},
      take: 4,
      include: {
        images: {
          orderBy: {order: "asc"},
          take: 1
        }
      }
    })
  ]);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-box">
            <div>
              <p className="eyebrow">{t("eyebrow")}</p>
              <h1>{t("title")}</h1>
              <p className="hero-text">{t("text")}</p>
            </div>

            <div className="hero-actions hero-actions-home">
              <Link href="/cars" className="primary-button">
                {t("browse")}
              </Link>

              <Link href="/contact" className="secondary-button">
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="container">
          <div className="section-header">
            <h2>{t("latest")}</h2>
            <p>{t("fresh")}</p>
          </div>

          <div className="cars-grid">
            {cars.map((car: any) => (
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
                saveLabel={t("save")}
                savedLabel={t("saved")}
                loginToSaveLabel={t("loginToSave")}
                noPhotoLabel={t("noPhoto")}
                locale={locale}
                currentPath={`/${locale}`}
                isSaved={favoriteIds.includes(car.id)}
                isAuthenticated={Boolean(session?.user)}
              />
            ))}
          </div>

          <div style={{marginTop: "24px"}}>
            <Link href="/cars" className="primary-button">
              {t("allCars")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

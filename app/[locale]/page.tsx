import {prisma} from "@/lib/prisma";
import CarCard from "@/components/cars/CarCard";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";

export default async function HomePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations("Home");
  const cars = await prisma.car.findMany({
    orderBy: {createdAt: "desc"},
    take: 4,
    include: {
      images: {
        orderBy: {order: "asc"},
        take: 1
      }
    }
  });

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

            <div className="hero-actions">
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
            {cars.map((car) => (
              <CarCard
                key={car.id}
                id={car.id}
                title={`${car.brand} ${car.model}`}
                price={formatPrice(car.price, locale)}
                year={String(car.year)}
                mileage={formatMileage(car.mileage, locale)}
                fuel={car.fuel}
                imageUrl={car.images[0]?.url || car.imageUrl}
                detailsLabel={t("details")}
                noPhotoLabel={t("noPhoto")}
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

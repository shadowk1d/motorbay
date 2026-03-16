// @ts-nocheck
import {Link} from "@/i18n/navigation";
import {prisma} from "@/lib/prisma";
import {getLocale, getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";

export default async function AdminCarsPage() {
  const [cars, t, locale] = await Promise.all([
    prisma.car.findMany({orderBy: {createdAt: "desc"}}),
    getTranslations("Admin"),
    getLocale()
  ]);

  return (
    <main className="page-section">
      <div className="container">
        <div className="section-header admin-topbar">
          <div>
            <h2>{t("title")}</h2>
            <p>{t("subtitle")}</p>
          </div>

          <Link href="/admin/cars/new" className="primary-button">
            {t("addCar")}
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="content-card">
            <h1>{t("emptyTitle")}</h1>
            <p>{t("emptyText")}</p>
          </div>
        ) : (
          <div className="admin-cars-list">
            {cars.map((car) => (
              <div key={car.id} className="admin-car-row">
                <div>
                  <strong>
                    {car.brand} {car.model}
                  </strong>
                  <div className="admin-car-meta">
                    {formatPrice(car.price, locale)} • {car.year} • {formatMileage(car.mileage, locale)}
                  </div>
                </div>

                <div className="admin-actions">
                  <Link href={`/cars/${car.id}`} className="secondary-button">
                    {t("open")}
                  </Link>
                  <Link href={`/admin/cars/${car.id}/edit`} className="lang-button">
                    {t("edit")}
                  </Link>
                  <form action={`/admin/cars/${car.id}/delete`} method="POST">
                    <button type="submit" className="danger-button">
                      {t("delete")}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

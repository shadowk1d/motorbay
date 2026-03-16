import {auth} from "@/auth";
import CarCard from "@/components/cars/CarCard";
import {prisma} from "@/lib/prisma";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";
import {buildCatalogQueryString, buildCatalogWhere, parseCatalogFilters, type RawCatalogSearchParams} from "@/lib/catalog";
import {CAR_BRANDS, getModelsForBrand} from "@/lib/filter-options";
import BrandModelSelect from "@/components/filters/BrandModelSelect";
import {getFuelChoices, getTransmissionChoices} from "@/lib/vehicle-labels";
import {getCurrentUserFavoriteIds} from "@/lib/favorites";

type CarsPageProps = {
  searchParams?: Promise<RawCatalogSearchParams>;
  params: Promise<{locale: string}>;
};

const PAGE_SIZE = 9;

export default async function CarsPage({searchParams, params}: CarsPageProps) {
  const [{locale}, rawSearchParams, t, session, favoriteIds] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("Catalog"),
    auth(),
    getCurrentUserFavoriteIds()
  ]);

  const filters = parseCatalogFilters(rawSearchParams);
  const where = buildCatalogWhere(filters);
  const modelOptions = getModelsForBrand(filters.brand);

  const [cars, totalCars] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: {createdAt: "desc"},
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        images: {
          orderBy: {order: "asc"},
          take: 1
        }
      }
    }),
    prisma.car.count({where})
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCars / PAGE_SIZE));

  function buildPageLink(nextPage: number) {
    const queryString = buildCatalogQueryString({...filters, page: nextPage});
    return queryString ? `/cars?${queryString}` : "/cars";
  }

  const advancedLinkQuery = buildCatalogQueryString(filters);

  return (
    <main className="page-section">
      <div className="container">
        <div className="section-header section-header-row">
          <div>
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>
          <Link href={advancedLinkQuery ? `/cars/filters?${advancedLinkQuery}` : "/cars/filters"} className="secondary-button">
            {t("advancedFilters")}
          </Link>
        </div>

        <form className="catalog-filters catalog-filters-quick" method="GET">
          <input type="text" name="query" placeholder={t("search")} defaultValue={filters.query} />

          <BrandModelSelect
            brand={filters.brand}
            model={filters.model}
            brandPlaceholder={t("allBrands")}
            modelPlaceholder={filters.brand ? t("allModels") : "Сначала выберите марку"}
          />

          <select name="fuel" defaultValue={filters.fuels[0] ?? ""}>
            <option value="">{t("anyFuel")}</option>
            {getFuelChoices(locale).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select name="transmission" defaultValue={filters.transmissions[0] ?? ""}>
            <option value="">{t("anyTransmission")}</option>
            {getTransmissionChoices(locale).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input type="number" name="minPrice" placeholder={t("priceFrom")} defaultValue={filters.minPrice} />
          <input type="number" name="maxPrice" placeholder={t("priceTo")} defaultValue={filters.maxPrice} />

          <div className="catalog-filter-actions">
            <button type="submit" className="primary-button">
              {t("apply")}
            </button>
            <Link href="/cars" className="secondary-button">
              {t("reset")}
            </Link>
          </div>
        </form>

        {cars.length === 0 ? (
          <p>{t("empty")}</p>
        ) : (
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
                currentPath={`/${locale}/cars`}
                isSaved={favoriteIds.includes(car.id)}
                isAuthenticated={Boolean(session?.user)}
              />
            ))}
          </div>
        )}

        <div className="pagination">
          <Link
            href={buildPageLink(Math.max(1, filters.page - 1))}
            className={filters.page <= 1 ? "pagination-button disabled" : "pagination-button"}
          >
            {t("prev")}
          </Link>

          <span className="pagination-info">{t("page", {page: filters.page, totalPages})}</span>

          <Link
            href={buildPageLink(Math.min(totalPages, filters.page + 1))}
            className={filters.page >= totalPages ? "pagination-button disabled" : "pagination-button"}
          >
            {t("next")}
          </Link>
        </div>
      </div>
    </main>
  );
}

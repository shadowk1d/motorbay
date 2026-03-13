import {prisma} from "@/lib/prisma";
import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";
import {CAR_BRANDS, FUEL_OPTIONS} from "@/lib/filter-options";

type CarsPageProps = {
  searchParams?: Promise<{
    page?: string;
    query?: string;
    brand?: string;
    fuel?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
  params: Promise<{locale: string}>;
};

const PAGE_SIZE = 6;

export default async function CarsPage({searchParams, params}: CarsPageProps) {
  const [{locale}, rawSearchParams, t] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("Catalog")
  ]);

  const resolvedSearchParams = rawSearchParams as {
    page?: string;
    query?: string;
    brand?: string;
    fuel?: string;
    minPrice?: string;
    maxPrice?: string;
  };

  const page = Number(resolvedSearchParams.page) > 0 ? Number(resolvedSearchParams.page) : 1;
  const query = resolvedSearchParams.query?.trim() || "";
  const brand = resolvedSearchParams.brand?.trim() || "";
  const fuel = resolvedSearchParams.fuel?.trim() || "";
  const minPrice = Number(resolvedSearchParams.minPrice) || undefined;
  const maxPrice = Number(resolvedSearchParams.maxPrice) || undefined;

  const where = {
    AND: [
      query
        ? {
            OR: [
              {brand: {contains: query, mode: "insensitive" as const}},
              {model: {contains: query, mode: "insensitive" as const}},
              {description: {contains: query, mode: "insensitive" as const}}
            ]
          }
        : {},
      brand ? {brand: {equals: brand, mode: "insensitive" as const}} : {},
      fuel ? {fuel: {equals: fuel, mode: "insensitive" as const}} : {},
      minPrice !== undefined ? {price: {gte: minPrice}} : {},
      maxPrice !== undefined ? {price: {lte: maxPrice}} : {}
    ]
  };

  const [cars, totalCars] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: {createdAt: "desc"},
      skip: (page - 1) * PAGE_SIZE,
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
    const sp = new URLSearchParams();

    if (query) sp.set("query", query);
    if (brand) sp.set("brand", brand);
    if (fuel) sp.set("fuel", fuel);
    if (minPrice !== undefined) sp.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) sp.set("maxPrice", String(maxPrice));
    sp.set("page", String(nextPage));

    return `/cars?${sp.toString()}`;
  }

  return (
    <main className="page-section">
      <div className="container">
        <h1>{t("title")}</h1>

        <form className="catalog-filters" method="GET">
          <input type="text" name="query" placeholder={t("search")} defaultValue={query} />

          <select name="brand" defaultValue={brand}>
            <option value="">{t("allBrands")}</option>
            {CAR_BRANDS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select name="fuel" defaultValue={fuel}>
            <option value="">{t("anyFuel")}</option>
            {FUEL_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input type="number" name="minPrice" placeholder={t("priceFrom")} defaultValue={minPrice} />
          <input type="number" name="maxPrice" placeholder={t("priceTo")} defaultValue={maxPrice} />

          <button type="submit" className="primary-button">
            {t("apply")}
          </button>
        </form>

        {cars.length === 0 ? (
          <p>{t("empty")}</p>
        ) : (
          <div className="cars-grid">
            {cars.map((car) => (
              <Link key={car.id} href={`/cars/${car.id}`} className="car-card">
                <div className="car-card-image-wrap">
                  {car.images[0]?.url ? (
                    <img
                      src={car.images[0].url}
                      alt={`${car.brand} ${car.model}`}
                      className="car-card-image"
                    />
                  ) : car.imageUrl ? (
                    <img
                      src={car.imageUrl}
                      alt={`${car.brand} ${car.model}`}
                      className="car-card-image"
                    />
                  ) : (
                    <div className="car-card-placeholder">{t("noPhoto")}</div>
                  )}
                </div>

                <div className="car-card-body">
                  <p className="eyebrow">{t("listing", {id: car.id})}</p>

                  <h2>
                    {car.brand} {car.model}
                  </h2>

                  <p className="car-details-price">{formatPrice(car.price, locale)}</p>

                  <div className="car-card-meta">
                    <span>{car.year}</span>
                    <span>{formatMileage(car.mileage, locale)}</span>
                    <span>{car.fuel}</span>
                    <span>{car.transmission}</span>
                  </div>

                  <p className="car-card-description">
                    {car.description.length > 110
                      ? `${car.description.slice(0, 110)}...`
                      : car.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="pagination">
          <Link
            href={buildPageLink(Math.max(1, page - 1))}
            className={page <= 1 ? "pagination-button disabled" : "pagination-button"}
          >
            {t("prev")}
          </Link>

          <span className="pagination-info">{t("page", {page, totalPages})}</span>

          <Link
            href={buildPageLink(Math.min(totalPages, page + 1))}
            className={page >= totalPages ? "pagination-button disabled" : "pagination-button"}
          >
            {t("next")}
          </Link>
        </div>
      </div>
    </main>
  );
}
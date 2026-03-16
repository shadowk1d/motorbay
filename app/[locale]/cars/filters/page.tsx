import {Link} from "@/i18n/navigation";
import {getTranslations} from "next-intl/server";
import {parseCatalogFilters, type RawCatalogSearchParams} from "@/lib/catalog";
import {
  DOOR_OPTIONS
} from "@/lib/filter-options";
import BrandModelSelect from "@/components/filters/BrandModelSelect";
import {
  getBodyTypeChoices,
  getCo2ClassChoices,
  getConditionChoices,
  getDriveTypeChoices,
  getEmissionStickerChoices,
  getFuelChoices,
  getSellerChoices,
  getTransmissionChoices
} from "@/lib/vehicle-labels";

type AdvancedFiltersPageProps = {
  params: Promise<{locale: string}>;
  searchParams?: Promise<RawCatalogSearchParams>;
};

function CheckboxGroup({
  name,
  options,
  selected
}: {
  name: string;
  options: {value: string; label: string}[];
  selected: string[];
}) {
  return (
    <div className="filter-checkbox-grid">
      {options.map((option) => (
        <label key={option.value} className="filter-check-option">
          <input
            type="checkbox"
            name={name}
            value={option.value}
            defaultChecked={selected.includes(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export default async function AdvancedFiltersPage({
  params,
  searchParams
}: AdvancedFiltersPageProps) {
  const [{locale}, rawSearchParams, t] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("AdvancedFilters")
  ]);

  const filters = parseCatalogFilters(rawSearchParams);

  return (
    <main className="page-section">
      <div className="container narrow advanced-filters-container">
        <div className="section-header">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>

        <form method="GET" action={`/${locale}/cars`} className="advanced-filters-form">
          <section className="form-section-card">
            <div className="form-section-header">
              <h2>{t("basicData")}</h2>
            </div>

            <div className="advanced-grid three">
              <BrandModelSelect brand={filters.brand} model={filters.model} />

              <input
                name="query"
                defaultValue={filters.query}
                placeholder={t("variantOrKeyword")}
              />
            </div>

            <div className="advanced-grid four">
              <input
                name="minPrice"
                type="number"
                defaultValue={filters.minPrice}
                placeholder={t("priceFrom")}
              />
              <input
                name="maxPrice"
                type="number"
                defaultValue={filters.maxPrice}
                placeholder={t("priceTo")}
              />
              <input
                name="minYear"
                type="number"
                defaultValue={filters.minYear}
                placeholder={t("registrationFrom")}
              />
              <input
                name="maxYear"
                type="number"
                defaultValue={filters.maxYear}
                placeholder={t("registrationTo")}
              />
              <input
                name="minMileage"
                type="number"
                defaultValue={filters.minMileage}
                placeholder={t("mileageFrom")}
              />
              <input
                name="maxMileage"
                type="number"
                defaultValue={filters.maxMileage}
                placeholder={t("mileageTo")}
              />
              <input
                name="minSeats"
                type="number"
                defaultValue={filters.minSeats}
                placeholder={t("seatsFrom")}
              />
              <input
                name="maxSeats"
                type="number"
                defaultValue={filters.maxSeats}
                placeholder={t("seatsTo")}
              />
            </div>

            <div className="advanced-grid three">
              <select name="bodyType" defaultValue={filters.bodyType}>
                <option value="">{t("bodyType")}</option>
                {getBodyTypeChoices(locale).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select name="condition" defaultValue={filters.condition}>
                <option value="">{t("condition")}</option>
                {getConditionChoices(locale).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select name="sellerType" defaultValue={filters.sellerType}>
                <option value="">{t("sellerType")}</option>
                {getSellerChoices(locale).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select name="doors" defaultValue={filters.doors}>
                <option value="">{t("doors")}</option>
                {DOOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <input
                name="ownersCount"
                type="number"
                defaultValue={filters.ownersCount}
                placeholder={t("ownersMax")}
              />

              <input
                name="huUntil"
                defaultValue={filters.huUntil}
                placeholder={t("huUntil")}
              />
            </div>
          </section>

          <section className="form-section-card">
            <div className="form-section-header">
              <h2>{t("technicalData")}</h2>
            </div>

            <div className="advanced-group-block">
              <h3>{t("fuelType")}</h3>
              <CheckboxGroup
                name="fuel"
                options={getFuelChoices(locale)}
                selected={filters.fuels}
              />
            </div>

            <div className="advanced-group-block">
              <h3>{t("transmission")}</h3>
              <CheckboxGroup
                name="transmission"
                options={getTransmissionChoices(locale)}
                selected={filters.transmissions}
              />
            </div>

            <div className="advanced-group-block">
              <h3>{t("driveType")}</h3>
              <div className="filter-radio-row">
                <label className="filter-check-option">
                  <input
                    type="radio"
                    name="driveType"
                    value=""
                    defaultChecked={!filters.driveType}
                  />
                  <span>{t("any")}</span>
                </label>

                {getDriveTypeChoices(locale).map((option) => (
                  <label key={option.value} className="filter-check-option">
                    <input
                      type="radio"
                      name="driveType"
                      value={option.value}
                      defaultChecked={filters.driveType === option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="advanced-grid four">
              <input
                name="minPower"
                type="number"
                defaultValue={filters.minPower}
                placeholder={t("powerFrom")}
              />
              <input
                name="maxPower"
                type="number"
                defaultValue={filters.maxPower}
                placeholder={t("powerTo")}
              />
              <input
                name="minWeight"
                type="number"
                defaultValue={filters.minWeight}
                placeholder={t("weightFrom")}
              />
              <input
                name="maxWeight"
                type="number"
                defaultValue={filters.maxWeight}
                placeholder={t("weightTo")}
              />
            </div>

            <div className="advanced-grid three">
              <select name="emissionSticker" defaultValue={filters.emissionSticker}>
                <option value="">{t("emissionSticker")}</option>
                {getEmissionStickerChoices(locale).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select name="co2Class" defaultValue={filters.co2Class}>
                <option value="">{t("co2Class")}</option>
                {getCo2ClassChoices(locale).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <div className="advanced-actions">
            <Link href="/cars" className="secondary-button">
              {t("reset")}
            </Link>
            <button type="submit" className="primary-button">
              {t("showResults")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
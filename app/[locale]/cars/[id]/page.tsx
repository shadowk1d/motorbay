// @ts-nocheck
import {auth} from "@/auth";
import SaveListingButton from "@/components/cars/SaveListingButton";
import CarGallery from "@/components/cars/CarGallery";
import TechnicalSpecs from "@/components/cars/TechnicalSpecs";
import ExpandableDescription from "@/components/cars/ExpandableDescription";
import InspectionRequestModal from "@/components/cars/InspectionRequestModal";
import {prisma} from "@/lib/prisma";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice, getIntlLocale} from "@/lib/format";
import {getOptionLabel} from "@/lib/vehicle-labels";

const WHATSAPP_URL = "https://wa.me/491736601635";

type CarPageProps = {
  params: Promise<{locale: string; id: string}>;
};

function formatNumber(value: number | null | undefined, locale: string, suffix = "") {
  if (value === null || value === undefined) return "—";
  const formatted = new Intl.NumberFormat(getIntlLocale(locale)).format(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatText(value: string | null | undefined) {
  return value && value.trim() ? value : "—";
}

export default async function CarPage({params}: CarPageProps) {
  const [{locale, id}, t, session] = await Promise.all([params, getTranslations("Car"), auth()]);
  const carId = Number(id);

  if (Number.isNaN(carId)) {
    notFound();
  }

  const car = await prisma.car.findUnique({
    where: {id: carId},
    include: {
      images: {
        orderBy: {order: "asc"}
      }
    }
  });

  if (!car) {
    notFound();
  }

  const userId = Number(session?.user?.id ?? "");
  const favorite = userId
    ? await prisma.savedCar.findUnique({
        where: {
          userId_carId: {
            userId,
            carId
          }
        }
      })
    : null;

  const galleryImages = car.images.length > 0 ? car.images.map((image) => image.url) : car.imageUrl ? [car.imageUrl] : [];
  const inspectionRecipientEmail = process.env.INSPECTION_RECIPIENT_EMAIL || "motor.bay.de@gmail.com";

  const heroFacts = [
    {label: t("mileage"), value: formatMileage(car.mileage, locale)},
    {label: t("fuel"), value: getOptionLabel(locale, car.fuel)},
    {label: t("transmission"), value: getOptionLabel(locale, car.transmission)},
    {label: t("firstRegistration"), value: formatText(car.firstRegistration)},
    {label: t("ownersCount"), value: car.ownersCount ? String(car.ownersCount) : "—"},
    {label: t("weightKg"), value: formatNumber(car.weightKg, locale, "kg")}
  ];

  const technicalRows = [
    {label: t("technical.condition"), value: car.condition ? getOptionLabel(locale, car.condition) : "—"},
    {label: t("technical.category"), value: formatText(car.category)},
    {label: t("technical.trimLine"), value: formatText(car.trimLine)},
    {label: t("technical.origin"), value: formatText(car.origin)},
    {label: t("technical.bodyType"), value: car.bodyType ? getOptionLabel(locale, car.bodyType) : "—"},
    {label: t("technical.power"), value: car.powerKw || car.powerHp ? `${formatNumber(car.powerKw, locale, "kW")} / ${formatNumber(car.powerHp, locale, "PS")}` : "—"},
    {label: t("technical.driveType"), value: car.driveType ? getOptionLabel(locale, car.driveType) : "—"},
    {label: t("technical.fuelConsumption"), value: formatText(car.fuelConsumption)},
    {label: t("technical.co2Emission"), value: formatNumber(car.co2Emission, locale, "g/km")},
    {label: t("technical.co2Class"), value: formatText(car.co2Class)},
    {label: t("technical.emissionSticker"), value: formatText(car.emissionSticker)},
    {label: t("technical.seats"), value: formatNumber(car.seats, locale)},
    {label: t("technical.doors"), value: formatText(car.doors)},
    {label: t("technical.transmission"), value: getOptionLabel(locale, car.transmission)},
    {label: t("technical.firstRegistration"), value: formatText(car.firstRegistration)},
    {label: t("technical.ownersCount"), value: formatNumber(car.ownersCount, locale)},
    {label: t("technical.huUntil"), value: formatText(car.huUntil)},
    {label: t("technical.airConditioning"), value: formatText(car.airConditioning)},
    {label: t("technical.parkingAssist"), value: formatText(car.parkingAssist)},
    {label: t("technical.airbags"), value: formatText(car.airbags)},
    {label: t("technical.color"), value: formatText(car.color)},
    {label: t("technical.interior"), value: formatText(car.interior)},
    {label: t("technical.towingCapacityBrakedKg"), value: formatNumber(car.towingCapacityBrakedKg, locale, "kg")},
    {label: t("technical.towingCapacityUnbrakedKg"), value: formatNumber(car.towingCapacityUnbrakedKg, locale, "kg")},
    {label: t("technical.weightKg"), value: formatNumber(car.weightKg, locale, "kg")},
    {label: t("technical.cylinders"), value: formatNumber(car.cylinders, locale)},
    {label: t("technical.displacementCc"), value: formatNumber(car.displacementCc, locale, "cm³")},
    {label: t("technical.tankVolumeL"), value: formatNumber(car.tankVolumeL, locale, "l")}
  ];

  return (
    <main className="page-section">
      <div className="container narrow car-details-page">
        <div className="car-detail-shell">
          <div className="car-detail-gallery-card">
            <div className="car-detail-header">
              <div>
                <p className="eyebrow">{t("listing", {id: car.id})}</p>
                <h1>
                  {car.brand} {car.model}
                  {car.variant ? ` ${car.variant}` : ""}
                </h1>
                <div className="car-detail-price">{formatPrice(car.price, locale)}</div>
              </div>

              <div className="car-detail-cta-row">
                <SaveListingButton
                  carId={car.id}
                  locale={locale}
                  initialSaved={Boolean(favorite)}
                  isAuthenticated={Boolean(session?.user)}
                  loginHref={`/${locale}/login`}
                  currentPath={`/${locale}/cars/${car.id}`}
                  saveLabel={t("save")}
                  savedLabel={t("saved")}
                  loginToSaveLabel={t("loginToSave")}
                  className="secondary-button"
                />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="primary-button">
                  {t("whatsapp")}
                </a>
              </div>
            </div>

            <CarGallery images={galleryImages} alt={`${car.brand} ${car.model}`} emptyLabel={t("noPhoto")} />

            <div className="car-hero-facts">
              {heroFacts.map((item) => (
                <div key={item.label} className="car-hero-fact">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <section className="car-specs-card">
            <h2>{t("technicalTitle")}</h2>
            <TechnicalSpecs
              rows={technicalRows}
              initialVisibleCount={6}
              showMoreLabel={t("showMoreTechnical")}
              showLessLabel={t("showLessTechnical")}
            />
          </section>

          <section className="car-description-panel">
            <h2>{t("description")}</h2>
            <ExpandableDescription
              text={car.description}
              showMoreLabel={t("showMoreDescription")}
              showLessLabel={t("showLessDescription")}
            />
          </section>

          <div className="car-inspection-cta">
            <InspectionRequestModal
              locale={locale}
              carId={car.id}
              recipientEmail={inspectionRecipientEmail}
              userEmail={String(session?.user?.email ?? "")}
              isAuthenticated={Boolean(session?.user?.id)}
              loginHref={`/${locale}/login`}
              labels={{
                cta: t("inspectionCta"),
                title: t("inspectionTitle"),
                from: t("inspectionFrom"),
                to: t("inspectionTo"),
                date: t("inspectionDate"),
                message: t("inspectionMessage"),
                messagePlaceholder: t("inspectionMessagePlaceholder"),
                send: t("inspectionSend"),
                close: t("inspectionClose"),
                sent: t("inspectionSent"),
                sendError: t("inspectionSendError"),
                needLogin: t("inspectionNeedLogin"),
                goLogin: t("inspectionGoLogin")
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

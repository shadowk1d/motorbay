import {prisma} from "@/lib/prisma";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {formatMileage, formatPrice} from "@/lib/format";
import CarGallery from "@/components/cars/CarGallery";

const WHATSAPP_URL = "https://wa.me/491736601635";

type CarPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function CarPage({params}: CarPageProps) {
  const [{locale, id}, t] = await Promise.all([params, getTranslations("Car")]);

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

  const galleryImages =
    car.images.length > 0 ? car.images.map((image) => image.url) : car.imageUrl ? [car.imageUrl] : [];

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>
            {car.brand} {car.model}
          </h1>

          <CarGallery images={galleryImages} alt={`${car.brand} ${car.model}`} />

          <div className="car-detail-info">
            <p>
              <strong>{t("price")}:</strong> {formatPrice(car.price, locale)}
            </p>
            <p>
              <strong>{t("year")}:</strong> {car.year}
            </p>
            <p>
              <strong>{t("mileage")}:</strong> {formatMileage(car.mileage, locale)}
            </p>
            <p>
              <strong>{t("fuel")}:</strong> {car.fuel}
            </p>
            <p>
              <strong>{t("transmission")}:</strong> {car.transmission}
            </p>
            <p>
              <strong>{t("description")}:</strong> {car.description}
            </p>
          </div>

          <div className="contact-buttons" style={{marginTop: "24px"}}>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="primary-button">
              {t("whatsapp")}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

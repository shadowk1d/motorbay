import {Link} from "@/i18n/navigation";

type CarCardProps = {
  id: number;
  title: string;
  price: string;
  year: string;
  mileage: string;
  fuel: string;
  imageUrl?: string | null;
  detailsLabel: string;
  noPhotoLabel: string;
};

export default function CarCard({
  id,
  title,
  price,
  year,
  mileage,
  fuel,
  imageUrl,
  detailsLabel,
  noPhotoLabel
}: CarCardProps) {
  return (
    <article className="car-card">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="car-image-placeholder car-card-cover" />
      ) : (
        <div className="car-image-placeholder">{noPhotoLabel}</div>
      )}

      <div className="car-card-content">
        <div className="car-card-top">
          <h3>{title}</h3>
          <span className="car-price">{price}</span>
        </div>

        <div className="car-meta">
          <span>{year}</span>
          <span>{mileage}</span>
          <span>{fuel}</span>
        </div>

        <Link href={`/cars/${id}`} className="secondary-button wide-button car-link-button">
          {detailsLabel}
        </Link>
      </div>
    </article>
  );
}

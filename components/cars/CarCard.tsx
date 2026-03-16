import {Link} from "@/i18n/navigation";
import SaveListingButton from "@/components/cars/SaveListingButton";
import {getOptionLabel} from "@/lib/vehicle-labels";

type CarCardProps = {
  id: number;
  title: string;
  price: string;
  subtitle?: string;
  fuel: string;
  transmission: string;
  imageUrl?: string | null;
  detailsLabel: string;
  saveLabel: string;
  savedLabel: string;
  loginToSaveLabel: string;
  noPhotoLabel: string;
  locale: string;
  currentPath: string;
  isSaved?: boolean;
  isAuthenticated?: boolean;
};

export default function CarCard({
  id,
  title,
  price,
  subtitle,
  fuel,
  transmission,
  imageUrl,
  detailsLabel,
  saveLabel,
  savedLabel,
  loginToSaveLabel,
  noPhotoLabel,
  locale,
  currentPath,
  isSaved = false,
  isAuthenticated = false
}: CarCardProps) {
  return (
    <article className="listing-card">
      <div className="listing-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="listing-card-image" />
        ) : (
          <div className="listing-card-placeholder">{noPhotoLabel}</div>
        )}
      </div>

      <div className="listing-card-body">
        <div className="listing-card-main">
          <h3>{title}</h3>
          {subtitle ? <p className="listing-card-subtitle">{subtitle}</p> : null}
          <div className="listing-card-price">{price}</div>
        </div>

        <div className="listing-card-tags">
          <span>{getOptionLabel(locale, fuel)}</span>
          <span>{getOptionLabel(locale, transmission)}</span>
        </div>

        <div className="listing-card-actions">
          <Link href={`/cars/${id}`} className="secondary-button wide-button">
            {detailsLabel}
          </Link>
          <SaveListingButton
            carId={id}
            locale={locale}
            initialSaved={isSaved}
            isAuthenticated={isAuthenticated}
            loginHref={`/${locale}/login`}
            currentPath={currentPath}
            saveLabel={saveLabel}
            savedLabel={savedLabel}
            loginToSaveLabel={loginToSaveLabel}
            className="secondary-button wide-button"
          />
        </div>
      </div>
    </article>
  );
}

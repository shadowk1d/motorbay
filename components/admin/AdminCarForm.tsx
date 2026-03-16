"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {CAR_BRANDS, getModelsForBrand} from "@/lib/filter-options";
import {
  getBodyTypeChoices,
  getConditionChoices,
  getDriveTypeChoices,
  getEmissionStickerChoices,
  getFuelChoices,
  getSellerChoices,
  getTransmissionChoices
} from "@/lib/vehicle-labels";

type ExistingImage = {
  id: number;
  url: string;
};

type Labels = {
  brand: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  mileage: string;
  fuel: string;
  transmission: string;
  description: string;
  create: string;
  save: string;
  uploadHint: string;
  existingPhotos: string;
  newPhotos: string;
  setPrimary: string;
  primaryBadge: string;
  remove: string;
  restore: string;
  addPhotos: string;
  maxPhotosHint: string;
  technicalSection: string;
  baseSection: string;
  powerHp: string;
  powerKw: string;
  bodyType: string;
  driveType: string;
  condition: string;
  sellerType: string;
  firstRegistration: string;
  ownersCount: string;
  weightKg: string;
  displacementCc: string;
  seats: string;
  doors: string;
  huUntil: string;
  airConditioning: string;
  parkingAssist: string;
  airbags: string;
  color: string;
  interior: string;
  towingCapacityBrakedKg: string;
  towingCapacityUnbrakedKg: string;
  cylinders: string;
  tankVolumeL: string;
  fuelConsumption: string;
  co2Emission: string;
  co2Class: string;
  emissionSticker: string;
  category: string;
  trimLine: string;
  origin: string;
};

type AdminCarFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "create" | "edit";
  locale: string;
  labels: Labels;
  defaults?: {
    brand?: string;
    model?: string;
    variant?: string;
    year?: number;
    price?: number;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    description?: string;
    bodyType?: string | null;
    driveType?: string | null;
    condition?: string | null;
    sellerType?: string | null;
    firstRegistration?: string | null;
    ownersCount?: number | null;
    weightKg?: number | null;
    powerHp?: number | null;
    powerKw?: number | null;
    displacementCc?: number | null;
    seats?: number | null;
    doors?: string | null;
    huUntil?: string | null;
    airConditioning?: string | null;
    parkingAssist?: string | null;
    airbags?: string | null;
    color?: string | null;
    interior?: string | null;
    towingCapacityBrakedKg?: number | null;
    towingCapacityUnbrakedKg?: number | null;
    cylinders?: number | null;
    tankVolumeL?: number | null;
    fuelConsumption?: string | null;
    co2Emission?: number | null;
    co2Class?: string | null;
    emissionSticker?: string | null;
    category?: string | null;
    trimLine?: string | null;
    origin?: string | null;
  };
  existingImages?: ExistingImage[];
  error?: string;
};

type NewImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export default function AdminCarForm({
  action,
  mode,
  locale,
  labels,
  defaults,
  existingImages = [],
  error
}: AdminCarFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const newImageId = useRef(0);
  const [brandValue, setBrandValue] = useState(defaults?.brand ?? "");
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [removedExistingIds, setRemovedExistingIds] = useState<number[]>([]);
  const [primaryChoice, setPrimaryChoice] = useState<string>(
    existingImages[0] ? `existing:${existingImages[0].id}` : ""
  );

  const visibleExistingImages = useMemo(
    () => existingImages.filter((image) => !removedExistingIds.includes(image.id)),
    [existingImages, removedExistingIds]
  );

  useEffect(() => {
    if (!primaryChoice) {
      if (visibleExistingImages[0]) {
        setPrimaryChoice(`existing:${visibleExistingImages[0].id}`);
        return;
      }

      if (newImages[0]) {
        setPrimaryChoice(`new:${newImages[0].id}`);
      }

      return;
    }

    const hasExisting = visibleExistingImages.some((image) => `existing:${image.id}` === primaryChoice);
    const hasNew = newImages.some((image) => `new:${image.id}` === primaryChoice);

    if (!hasExisting && !hasNew) {
      if (visibleExistingImages[0]) {
        setPrimaryChoice(`existing:${visibleExistingImages[0].id}`);
      } else if (newImages[0]) {
        setPrimaryChoice(`new:${newImages[0].id}`);
      } else {
        setPrimaryChoice("");
      }
    }
  }, [primaryChoice, visibleExistingImages, newImages]);

  useEffect(() => {
    return () => {
      newImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [newImages]);

  function syncInputFiles(nextImages: NewImage[]) {
    if (!fileInputRef.current) return;
    const transfer = new DataTransfer();
    nextImages.forEach((image) => transfer.items.add(image.file));
    fileInputRef.current.files = transfer.files;
  }

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.size > 0);
    if (!files.length) {
      syncInputFiles(newImages);
      return;
    }

    const availableSlots = Math.max(0, 10 - visibleExistingImages.length - newImages.length);
    const filesToAdd = files.slice(0, availableSlots);
    const prepared = filesToAdd.map((file) => ({
      id: String(newImageId.current++),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    const nextImages = [...newImages, ...prepared];
    setNewImages(nextImages);
    syncInputFiles(nextImages);

    if (!primaryChoice && prepared[0]) {
      setPrimaryChoice(`new:${prepared[0].id}`);
    }
  }

  function removeExistingImage(imageId: number) {
    setRemovedExistingIds((current) => [...current, imageId]);
  }

  function restoreExistingImage(imageId: number) {
    setRemovedExistingIds((current) => current.filter((id) => id !== imageId));
  }

  function removeNewImage(imageId: string) {
    const image = newImages.find((item) => item.id === imageId);
    if (image) URL.revokeObjectURL(image.previewUrl);
    const nextImages = newImages.filter((item) => item.id !== imageId);
    setNewImages(nextImages);
    syncInputFiles(nextImages);
  }

  const totalVisibleImages = visibleExistingImages.length + newImages.length;
  const modelOptions = getModelsForBrand(brandValue);

  return (
    <form action={action} className="auth-form admin-car-form">
      <div className="form-section-card">
        <div className="form-section-header">
          <h2>{labels.baseSection}</h2>
        </div>

        <div className="admin-form-grid">
          <input
            name="brand"
            list="admin-car-brands"
            defaultValue={defaults?.brand}
            placeholder={labels.brand}
            onChange={(event) => setBrandValue(event.target.value)}
            required
          />
          <datalist id="admin-car-brands">
            {CAR_BRANDS.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>

          <input name="model" list="admin-car-models" defaultValue={defaults?.model} placeholder={labels.model} required />
          <datalist id="admin-car-models">
            {modelOptions.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>

          <input name="variant" defaultValue={defaults?.variant ?? ""} placeholder={labels.variant} />
          <input name="year" type="number" defaultValue={defaults?.year} placeholder={labels.year} required />
          <input name="price" type="number" defaultValue={defaults?.price} placeholder={labels.price} required />
          <input name="mileage" type="number" defaultValue={defaults?.mileage} placeholder={labels.mileage} required />

          <select name="fuel" defaultValue={defaults?.fuel ?? ""} required>
            <option value="" disabled>
              {labels.fuel}
            </option>
            {getFuelChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select name="transmission" defaultValue={defaults?.transmission ?? ""} required>
            <option value="" disabled>
              {labels.transmission}
            </option>
            {getTransmissionChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select name="bodyType" defaultValue={defaults?.bodyType ?? ""}>
            <option value="">{labels.bodyType}</option>
            {getBodyTypeChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select name="driveType" defaultValue={defaults?.driveType ?? ""}>
            <option value="">{labels.driveType}</option>
            {getDriveTypeChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select name="condition" defaultValue={defaults?.condition ?? ""}>
            <option value="">{labels.condition}</option>
            {getConditionChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select name="sellerType" defaultValue={defaults?.sellerType ?? ""}>
            <option value="">{labels.sellerType}</option>
            {getSellerChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input name="firstRegistration" defaultValue={defaults?.firstRegistration ?? ""} placeholder={labels.firstRegistration} />
          <input name="ownersCount" type="number" defaultValue={defaults?.ownersCount ?? undefined} placeholder={labels.ownersCount} />
          <input name="doors" defaultValue={defaults?.doors ?? ""} placeholder={labels.doors} />
          <input name="seats" type="number" defaultValue={defaults?.seats ?? undefined} placeholder={labels.seats} />
          <input name="category" defaultValue={defaults?.category ?? ""} placeholder={labels.category} />
          <input name="trimLine" defaultValue={defaults?.trimLine ?? ""} placeholder={labels.trimLine} />
          <input name="origin" defaultValue={defaults?.origin ?? ""} placeholder={labels.origin} />
        </div>
      </div>

      <div className="form-section-card">
        <div className="form-section-header">
          <h2>{labels.technicalSection}</h2>
        </div>

        <div className="admin-form-grid">
          <input name="powerHp" type="number" defaultValue={defaults?.powerHp ?? undefined} placeholder={labels.powerHp} />
          <input name="powerKw" type="number" defaultValue={defaults?.powerKw ?? undefined} placeholder={labels.powerKw} />
          <input name="displacementCc" type="number" defaultValue={defaults?.displacementCc ?? undefined} placeholder={labels.displacementCc} />
          <input name="weightKg" type="number" defaultValue={defaults?.weightKg ?? undefined} placeholder={labels.weightKg} />
          <input name="fuelConsumption" defaultValue={defaults?.fuelConsumption ?? ""} placeholder={labels.fuelConsumption} />
          <input name="co2Emission" type="number" defaultValue={defaults?.co2Emission ?? undefined} placeholder={labels.co2Emission} />
          <input name="co2Class" defaultValue={defaults?.co2Class ?? ""} placeholder={labels.co2Class} />
          <select name="emissionSticker" defaultValue={defaults?.emissionSticker ?? ""}>
            <option value="">{labels.emissionSticker}</option>
            {getEmissionStickerChoices(locale).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input name="huUntil" defaultValue={defaults?.huUntil ?? ""} placeholder={labels.huUntil} />
          <input name="airConditioning" defaultValue={defaults?.airConditioning ?? ""} placeholder={labels.airConditioning} />
          <input name="parkingAssist" defaultValue={defaults?.parkingAssist ?? ""} placeholder={labels.parkingAssist} />
          <input name="airbags" defaultValue={defaults?.airbags ?? ""} placeholder={labels.airbags} />
          <input name="color" defaultValue={defaults?.color ?? ""} placeholder={labels.color} />
          <input name="interior" defaultValue={defaults?.interior ?? ""} placeholder={labels.interior} />
          <input name="towingCapacityBrakedKg" type="number" defaultValue={defaults?.towingCapacityBrakedKg ?? undefined} placeholder={labels.towingCapacityBrakedKg} />
          <input name="towingCapacityUnbrakedKg" type="number" defaultValue={defaults?.towingCapacityUnbrakedKg ?? undefined} placeholder={labels.towingCapacityUnbrakedKg} />
          <input name="cylinders" type="number" defaultValue={defaults?.cylinders ?? undefined} placeholder={labels.cylinders} />
          <input name="tankVolumeL" type="number" defaultValue={defaults?.tankVolumeL ?? undefined} placeholder={labels.tankVolumeL} />
        </div>
      </div>

      <div className="admin-upload-block">
        <div className="admin-upload-topline">
          <strong>{labels.uploadHint}</strong>
          <span>{labels.maxPhotosHint}</span>
        </div>

        <input ref={fileInputRef} name="images" type="file" accept="image/*" multiple onChange={handleFilesChange} />
        <input type="hidden" name="primaryChoice" value={primaryChoice} />

        {removedExistingIds.map((id) => (
          <input key={id} type="hidden" name="removedImageIds" value={String(id)} />
        ))}

        {error ? <p className="form-error admin-form-error">{error}</p> : null}

        {existingImages.length > 0 ? (
          <div className="admin-images-section">
            <p className="admin-images-title">{labels.existingPhotos}</p>
            <div className="admin-image-grid">
              {existingImages.map((image) => {
                const removed = removedExistingIds.includes(image.id);
                const choice = `existing:${image.id}`;
                const isPrimary = primaryChoice === choice && !removed;

                return (
                  <div key={image.id} className={removed ? "admin-image-card is-removed" : "admin-image-card"}>
                    <img src={image.url} alt="Car" className="admin-image-preview" />

                    <div className="admin-image-actions">
                      <label className="admin-primary-option">
                        <input
                          type="radio"
                          name="primaryPreview"
                          value={choice}
                          checked={isPrimary}
                          onChange={() => setPrimaryChoice(choice)}
                          disabled={removed}
                        />
                        <span>{labels.setPrimary}</span>
                      </label>

                      {isPrimary ? <span className="admin-primary-badge">{labels.primaryBadge}</span> : null}

                      {removed ? (
                        <button type="button" className="secondary-button" onClick={() => restoreExistingImage(image.id)}>
                          {labels.restore}
                        </button>
                      ) : (
                        <button type="button" className="danger-button" onClick={() => removeExistingImage(image.id)}>
                          {labels.remove}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {newImages.length > 0 ? (
          <div className="admin-images-section">
            <p className="admin-images-title">{labels.newPhotos}</p>
            <div className="admin-image-grid">
              {newImages.map((image) => {
                const choice = `new:${image.id}`;
                const isPrimary = primaryChoice === choice;

                return (
                  <div key={image.id} className="admin-image-card">
                    <img src={image.previewUrl} alt="Preview" className="admin-image-preview" />

                    <div className="admin-image-actions">
                      <label className="admin-primary-option">
                        <input
                          type="radio"
                          name="primaryPreview"
                          value={choice}
                          checked={isPrimary}
                          onChange={() => setPrimaryChoice(choice)}
                        />
                        <span>{labels.setPrimary}</span>
                      </label>

                      {isPrimary ? <span className="admin-primary-badge">{labels.primaryBadge}</span> : null}

                      <button type="button" className="danger-button" onClick={() => removeNewImage(image.id)}>
                        {labels.remove}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {totalVisibleImages === 0 ? <p className="admin-upload-empty">{labels.addPhotos}</p> : null}
      </div>

      <textarea
        name="description"
        defaultValue={defaults?.description}
        placeholder={labels.description}
        rows={6}
        className="admin-textarea"
        required
      />

      <button type="submit" className="primary-button wide-button">
        {mode === "create" ? labels.create : labels.save}
      </button>
    </form>
  );
}

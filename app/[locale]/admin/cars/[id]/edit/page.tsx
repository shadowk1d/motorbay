// @ts-nocheck
import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/access";
import {getTranslations} from "next-intl/server";
import AdminCarForm from "@/components/admin/AdminCarForm";
import {buildImageOrder, destroyCarImage, uploadCarImage} from "@/lib/car-images";
import {parseCarFormData} from "@/lib/car-form";

type PageProps = {
  params: Promise<{id: string; locale: string}>;
  searchParams?: Promise<{error?: string}>;
};

export default async function EditCarPage({params, searchParams}: PageProps) {
  await requireAdmin();

  const [{id, locale}, rawSearchParams, t] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("Admin")
  ]);
  const resolvedSearchParams = rawSearchParams as {error?: string};
  const carId = Number(id);

  if (Number.isNaN(carId)) {
    redirect(`/${locale}/admin`);
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
    redirect(`/${locale}/admin`);
  }

  async function updateCar(formData: FormData) {
    "use server";

    await requireAdmin();
    const t = await getTranslations({locale, namespace: "Admin"});

    const currentCar = await prisma.car.findUnique({
      where: {id: carId},
      include: {
        images: {
          orderBy: {order: "asc"}
        }
      }
    });

    if (!currentCar) {
      redirect(`/${locale}/admin`);
    }

    const parsed = parseCarFormData(formData);
    const removedImageIds = formData
      .getAll("removedImageIds")
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value));

    const files = formData.getAll("images") as File[];
    const validFiles = files.filter((file) => file && file.size > 0);

    if (
      !parsed.brand ||
      !parsed.model ||
      !parsed.fuel ||
      !parsed.transmission ||
      !parsed.description ||
      parsed.year === undefined ||
      parsed.price === undefined ||
      parsed.mileage === undefined
    ) {
      redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent(t("requiredFields"))}`);
    }

    const remainingExistingImages = currentCar.images.filter((image) => !removedImageIds.includes(image.id));
    const totalImagesAfterUpdate = remainingExistingImages.length + validFiles.length;

    if (totalImagesAfterUpdate > 10) {
      redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent(t("maxStoredPhotosError"))}`);
    }

    const uploadedImages: {url: string; publicId: string; order: number}[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      if (!file.type.startsWith("image/")) {
        redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent(t("needImage"))}`);
      }

      const uploaded = await uploadCarImage(file);
      uploadedImages.push({url: uploaded.secure_url, publicId: uploaded.public_id, order: i});
    }

    const {orderedExisting, orderedNew} = buildImageOrder(remainingExistingImages, uploadedImages, parsed.primaryChoice);
    const mergedImages: {id?: number; url: string; publicId: string | null; order: number}[] = [
      ...orderedExisting.map((image, index) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        order: index
      })),
      ...orderedNew.map((image, index) => ({
        url: image.url,
        publicId: image.publicId,
        order: orderedExisting.length + index
      }))
    ];

    await prisma.$transaction(async (tx) => {
      if (removedImageIds.length > 0) {
        const imagesToDelete = currentCar.images.filter((image) => removedImageIds.includes(image.id));

        await tx.carImage.deleteMany({
          where: {
            carId,
            id: {in: removedImageIds}
          }
        });

        for (const image of imagesToDelete) {
          await destroyCarImage(image.publicId);
        }
      }

      for (const image of orderedExisting) {
        const nextOrder = mergedImages.find((item) => item.id === image.id)?.order ?? image.order;
        await tx.carImage.update({
          where: {id: image.id},
          data: {order: nextOrder}
        });
      }

      if (orderedNew.length > 0) {
        await tx.carImage.createMany({
          data: orderedNew.map((image) => ({
            carId,
            url: image.url,
            publicId: image.publicId,
            order: mergedImages.find((item) => item.publicId === image.publicId)?.order ?? image.order
          }))
        });
      }

      await tx.car.update({
        where: {id: carId},
        data: {
          ...parsed,
          year: parsed.year,
          price: parsed.price,
          mileage: parsed.mileage,
          imageUrl: mergedImages[0]?.url || null,
          imagePublicId: mergedImages[0]?.publicId || null
        }
      });
    });

    redirect(`/${locale}/admin`);
  }

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("editTitle")}</h1>
          <p>{t("editText")}</p>

          <AdminCarForm
            action={updateCar}
            mode="edit"
            locale={locale}
            error={resolvedSearchParams.error}
            defaults={{
              brand: car.brand,
              model: car.model,
              variant: car.variant ?? undefined,
              year: car.year,
              price: car.price,
              mileage: car.mileage,
              fuel: car.fuel,
              transmission: car.transmission,
              description: car.description,
              bodyType: car.bodyType,
              driveType: car.driveType,
              condition: car.condition,
              sellerType: car.sellerType,
              firstRegistration: car.firstRegistration,
              ownersCount: car.ownersCount,
              weightKg: car.weightKg,
              powerHp: car.powerHp,
              powerKw: car.powerKw,
              displacementCc: car.displacementCc,
              seats: car.seats,
              doors: car.doors,
              huUntil: car.huUntil,
              airConditioning: car.airConditioning,
              parkingAssist: car.parkingAssist,
              airbags: car.airbags,
              color: car.color,
              interior: car.interior,
              towingCapacityBrakedKg: car.towingCapacityBrakedKg,
              towingCapacityUnbrakedKg: car.towingCapacityUnbrakedKg,
              cylinders: car.cylinders,
              tankVolumeL: car.tankVolumeL,
              fuelConsumption: car.fuelConsumption,
              co2Emission: car.co2Emission,
              co2Class: car.co2Class,
              emissionSticker: car.emissionSticker,
              category: car.category,
              trimLine: car.trimLine,
              origin: car.origin
            }}
            existingImages={car.images.map((image) => ({id: image.id, url: image.url}))}
            labels={{
              brand: t("brand"),
              model: t("model"),
              variant: t("variant"),
              year: t("year"),
              price: t("price"),
              mileage: t("mileage"),
              fuel: t("fuel"),
              transmission: t("transmission"),
              description: t("description"),
              create: t("create"),
              save: t("save"),
              uploadHint: t("uploadHint"),
              existingPhotos: t("existingPhotos"),
              newPhotos: t("newPhotos"),
              setPrimary: t("setPrimary"),
              primaryBadge: t("primaryBadge"),
              remove: t("removePhoto"),
              restore: t("restore"),
              addPhotos: t("addPhotosHint"),
              maxPhotosHint: t("maxPhotosHint"),
              technicalSection: t("technicalSection"),
              baseSection: t("baseSection"),
              powerHp: t("powerHp"),
              powerKw: t("powerKw"),
              bodyType: t("bodyType"),
              driveType: t("driveType"),
              condition: t("condition"),
              sellerType: t("sellerType"),
              firstRegistration: t("firstRegistration"),
              ownersCount: t("ownersCount"),
              weightKg: t("weightKg"),
              displacementCc: t("displacementCc"),
              seats: t("seats"),
              doors: t("doors"),
              huUntil: t("huUntil"),
              airConditioning: t("airConditioning"),
              parkingAssist: t("parkingAssist"),
              airbags: t("airbags"),
              color: t("color"),
              interior: t("interior"),
              towingCapacityBrakedKg: t("towingCapacityBrakedKg"),
              towingCapacityUnbrakedKg: t("towingCapacityUnbrakedKg"),
              cylinders: t("cylinders"),
              tankVolumeL: t("tankVolumeL"),
              fuelConsumption: t("fuelConsumption"),
              co2Emission: t("co2Emission"),
              co2Class: t("co2Class"),
              emissionSticker: t("emissionSticker"),
              category: t("category"),
              trimLine: t("trimLine"),
              origin: t("origin")
            }}
          />
        </div>
      </div>
    </main>
  );
}

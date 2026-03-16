import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/access";
import {getTranslations} from "next-intl/server";
import AdminCarForm from "@/components/admin/AdminCarForm";
import {buildImageOrder, uploadCarImage} from "@/lib/car-images";
import {parseCarFormData} from "@/lib/car-form";

type PageProps = {
  params: Promise<{locale: string}>;
  searchParams?: Promise<{error?: string}>;
};

export default async function NewCarPage({params, searchParams}: PageProps) {
  await requireAdmin();
  const [{locale}, rawSearchParams, t] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
    getTranslations("Admin")
  ]);
  const resolvedSearchParams = rawSearchParams as {error?: string};

  async function createCar(formData: FormData) {
    "use server";

    await requireAdmin();

    const t = await getTranslations({locale, namespace: "Admin"});
    const parsed = parseCarFormData(formData);
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
      redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent(t("requiredFields"))}`);
    }

    if (validFiles.length > 10) {
      redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent(t("maxPhotosError"))}`);
    }

    const uploadedImages: {url: string; publicId: string; order: number}[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      if (!file.type.startsWith("image/")) {
        redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent(t("needImage"))}`);
      }

      const uploaded = await uploadCarImage(file);
      uploadedImages.push({url: uploaded.secure_url, publicId: uploaded.public_id, order: i});
    }

    const {orderedNew} = buildImageOrder([], uploadedImages, parsed.primaryChoice);
    const imagesToCreate = orderedNew.map((image, index) => ({...image, order: index}));
    const mainImage = imagesToCreate[0];

    await prisma.car.create({
      data: {
        ...parsed,
        year: parsed.year,
        price: parsed.price,
        mileage: parsed.mileage,
        imageUrl: mainImage?.url || null,
        imagePublicId: mainImage?.publicId || null,
        images: {
          create: imagesToCreate
        }
      }
    });

    redirect(`/${locale}/admin`);
  }

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("newTitle")}</h1>
          <p>{t("newText")}</p>

          <AdminCarForm
            action={createCar}
            mode="create"
            locale={locale}
            error={resolvedSearchParams.error}
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

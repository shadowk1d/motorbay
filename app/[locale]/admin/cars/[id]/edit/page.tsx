import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/access";
import {cloudinary} from "@/lib/cloudinary";
import {getTranslations} from "next-intl/server";

type PageProps = {
  params: Promise<{id: string; locale: string}>;
};

export default async function EditCarPage({params}: PageProps) {
  await requireAdmin();

  const {id, locale} = await params;
  const t = await getTranslations({locale, namespace: "Admin"});
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

  const existingCar = car;

  async function updateCar(formData: FormData) {
    "use server";

    await requireAdmin();
    const t = await getTranslations({locale, namespace: "Admin"});

    const brand = String(formData.get("brand") ?? "").trim();
    const model = String(formData.get("model") ?? "").trim();
    const year = Number(formData.get("year"));
    const price = Number(formData.get("price"));
    const mileage = Number(formData.get("mileage"));
    const fuel = String(formData.get("fuel") ?? "").trim();
    const transmission = String(formData.get("transmission") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    const files = formData.getAll("images") as File[];
    const validFiles = files.filter((file) => file && file.size > 0);

    if (
      !brand ||
      !model ||
      !fuel ||
      !transmission ||
      !description ||
      Number.isNaN(year) ||
      Number.isNaN(price) ||
      Number.isNaN(mileage)
    ) {
      redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent(t("requiredFields"))}`);
    }

    const existingImagesCount = existingCar.images.length;
    const totalImagesAfterUpload = existingImagesCount + validFiles.length;

    if (totalImagesAfterUpload > 10) {
      redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent("Можно хранить не более 10 фото")}`);
    }

    const uploadedImages: {url: string; publicId: string; order: number}[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      if (!file.type.startsWith("image/")) {
        redirect(`/${locale}/admin/cars/${carId}/edit?error=${encodeURIComponent(t("needImage"))}`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploaded = await new Promise<{secure_url: string; public_id: string}>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "motorbay/cars",
              resource_type: "image"
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error("Cloudinary upload failed"));
                return;
              }

              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id
              });
            }
          );

          stream.end(buffer);
        }
      );

      uploadedImages.push({
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        order: existingImagesCount + i
      });
    }

    if (uploadedImages.length > 0) {
      await prisma.car.update({
        where: {id: carId},
        data: {
          brand,
          model,
          year,
          price,
          mileage,
          fuel,
          transmission,
          description,
          imageUrl: existingCar.images[0]?.url || uploadedImages[0]?.url || existingCar.imageUrl,
          imagePublicId:
            existingCar.images[0]?.publicId || uploadedImages[0]?.publicId || existingCar.imagePublicId,
          images: {
            create: uploadedImages
          }
        }
      });
    } else {
      await prisma.car.update({
        where: {id: carId},
        data: {
          brand,
          model,
          year,
          price,
          mileage,
          fuel,
          transmission,
          description
        }
      });
    }

    redirect(`/${locale}/admin`);
  }

  return (
    <main className="page-section">
      <div className="container narrow">
        <div className="content-card">
          <h1>{t("editTitle")}</h1>
          <p>{t("editText")}</p>

          <form action={updateCar} className="auth-form">
            <input name="brand" defaultValue={existingCar.brand} placeholder={t("brand")} required />
            <input name="model" defaultValue={existingCar.model} placeholder={t("model")} required />
            <input name="year" type="number" defaultValue={existingCar.year} placeholder={t("year")} required />
            <input name="price" type="number" defaultValue={existingCar.price} placeholder={t("price")} required />
            <input
              name="mileage"
              type="number"
              defaultValue={existingCar.mileage}
              placeholder={t("mileage")}
              required
            />
            <input name="fuel" defaultValue={existingCar.fuel} placeholder={t("fuel")} required />
            <input
              name="transmission"
              defaultValue={existingCar.transmission}
              placeholder={t("transmission")}
              required
            />

            {existingCar.images.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px"
                }}
              >
                {existingCar.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${existingCar.brand} ${existingCar.model}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "1px solid var(--border)"
                    }}
                  />
                ))}
              </div>
            ) : existingCar.imageUrl ? (
              <img
                src={existingCar.imageUrl}
                alt={`${existingCar.brand} ${existingCar.model}`}
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "16px",
                  border: "1px solid var(--border)"
                }}
              />
            ) : null}

            <input name="images" type="file" accept="image/*" multiple />

            <textarea
              name="description"
              defaultValue={existingCar.description}
              placeholder={t("description")}
              rows={5}
              className="admin-textarea"
              required
            />

            <button type="submit" className="primary-button wide-button">
              {t("save")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
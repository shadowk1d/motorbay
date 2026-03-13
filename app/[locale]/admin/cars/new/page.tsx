import {prisma} from "@/lib/prisma";
import {redirect} from "next/navigation";
import {requireAdmin} from "@/lib/access";
import {cloudinary} from "@/lib/cloudinary";
import {getTranslations} from "next-intl/server";

export default async function NewCarPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  await requireAdmin();
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Admin"});

  async function createCar(formData: FormData) {
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
      redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent(t("requiredFields"))}`);
    }

    if (validFiles.length > 10) {
      redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent("Можно загрузить не более 10 фото")}`);
    }

    const uploadedImages: {url: string; publicId: string; order: number}[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      if (!file.type.startsWith("image/")) {
        redirect(`/${locale}/admin/cars/new?error=${encodeURIComponent(t("needImage"))}`);
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
        order: i
      });
    }

    await prisma.car.create({
      data: {
        brand,
        model,
        year,
        price,
        mileage,
        fuel,
        transmission,
        description,
        imageUrl: uploadedImages[0]?.url || null,
        imagePublicId: uploadedImages[0]?.publicId || null,
        images: {
          create: uploadedImages
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

          <form action={createCar} className="auth-form">
            <input name="brand" placeholder={t("brand")} required />
            <input name="model" placeholder={t("model")} required />
            <input name="year" type="number" placeholder={t("year")} required />
            <input name="price" type="number" placeholder={t("price")} required />
            <input name="mileage" type="number" placeholder={t("mileage")} required />
            <input name="fuel" placeholder={t("fuel")} required />
            <input name="transmission" placeholder={t("transmission")} required />
            <input name="images" type="file" accept="image/*" multiple />
            <textarea
              name="description"
              placeholder={t("description")}
              rows={5}
              className="admin-textarea"
              required
            />
            <button type="submit" className="primary-button wide-button">
              {t("create")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
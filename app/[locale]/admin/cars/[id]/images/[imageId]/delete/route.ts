import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/access";
import {cloudinary} from "@/lib/cloudinary";
import {NextResponse} from "next/server";

type Props = {
  params: Promise<{
    id: string;
    imageId: string;
    locale: string;
  }>;
};

export async function POST(_: Request, {params}: Props) {
  await requireAdmin();

  const {id, imageId} = await params;
  const carId = Number(id);
  const parsedImageId = Number(imageId);

  if (Number.isNaN(carId) || Number.isNaN(parsedImageId)) {
    return NextResponse.json({error: "Invalid id"}, {status: 400});
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
    return NextResponse.json({error: "Car not found"}, {status: 404});
  }

  const image = car.images.find((item) => item.id === parsedImageId);

  if (!image) {
    return NextResponse.json({error: "Image not found"}, {status: 404});
  }

  if (car.images.length <= 1) {
    return NextResponse.json(
      {error: "Нельзя удалить последнее фото"},
      {status: 400}
    );
  }

  if (image.publicId) {
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error("CLOUDINARY_DELETE_ERROR", error);
    }
  }

  await prisma.carImage.delete({
    where: {id: parsedImageId}
  });

  const remainingImages = await prisma.carImage.findMany({
    where: {carId},
    orderBy: {order: "asc"}
  });

  await prisma.car.update({
    where: {id: carId},
    data: {
      imageUrl: remainingImages[0]?.url || null,
      imagePublicId: remainingImages[0]?.publicId || null
    }
  });

  return NextResponse.json({ok: true});
}
// @ts-nocheck
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {auth} from "@/auth";
import {destroyCarImage} from "@/lib/car-images";

export async function POST(
  request: Request,
  context: {params: Promise<{id: string; locale: string}>}
) {
  const session = await auth();
  const {id, locale} = await context.params;

  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const carId = Number(id);

  if (!Number.isNaN(carId)) {
    const car = await prisma.car.findUnique({
      where: {id: carId},
      include: {
        images: true
      }
    });

    if (car) {
      await prisma.car.delete({
        where: {id: carId}
      });

      for (const image of car.images) {
        await destroyCarImage(image.publicId);
      }

      if (car.imagePublicId && !car.images.some((image) => image.publicId === car.imagePublicId)) {
        await destroyCarImage(car.imagePublicId);
      }
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
}

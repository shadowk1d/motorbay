import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {auth} from "@/auth";

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
    await prisma.car.delete({
      where: {id: carId}
    });
  }

  return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
}

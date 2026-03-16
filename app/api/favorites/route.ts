import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {revalidatePath} from "next/cache";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  const userId = Number(session?.user?.id ?? "");

  if (!userId) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const body = (await request.json()) as {carId?: number; locale?: string; pathname?: string};
  const carId = Number(body.carId);
  const locale = typeof body.locale === "string" && body.locale ? body.locale : "ru";

  if (!Number.isFinite(carId)) {
    return NextResponse.json({error: "Invalid car id"}, {status: 400});
  }

  const existing = await prisma.savedCar.findUnique({
    where: {
      userId_carId: {
        userId,
        carId
      }
    }
  });

  let saved = false;

  if (existing) {
    await prisma.savedCar.delete({where: {id: existing.id}});
  } else {
    await prisma.savedCar.create({
      data: {
        userId,
        carId
      }
    });
    saved = true;
  }

  const pathname = typeof body.pathname === "string" && body.pathname ? body.pathname : `/${locale}/cars/${carId}`;

  revalidatePath(pathname);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/cars`);
  revalidatePath(`/${locale}/profile`);

  return NextResponse.json({saved});
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Нужен вход в аккаунт" }, { status: 401 });
  }

  if (session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  const { id } = await params;
  const carId = Number(id);

  if (!Number.isInteger(carId) || carId <= 0) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  await prisma.car.delete({
    where: { id: carId },
  });

  return NextResponse.redirect(new URL("/admin", req.url));
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Нужен вход в аккаунт" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const brand = String(body?.brand ?? "").trim();
    const model = String(body?.model ?? "").trim();
    const year = Number(body?.year);
    const price = Number(body?.price);
    const mileage = Number(body?.mileage);
    const fuel = String(body?.fuel ?? "").trim();
    const transmission = String(body?.transmission ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const imageUrl = String(body?.imageUrl ?? "").trim();

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
      return NextResponse.json({ error: "Все обязательные поля должны быть заполнены" }, { status: 400 });
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year,
        price,
        mileage,
        fuel,
        transmission,
        description,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error("CREATE_CAR_ERROR", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

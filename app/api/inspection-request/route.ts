import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {sendInspectionRequestEmail} from "@/lib/inspection-mail";

type RequestBody = {
  carId?: number;
  preferredDate?: string;
  message?: string;
  locale?: string;
};

function normalizeLocale(value: string | undefined): "ru" | "en" | "de" {
  if (value === "en" || value === "de") {
    return value;
  }

  return "ru";
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = String(session?.user?.email ?? "").trim().toLowerCase();

  if (!session?.user?.id || !userEmail) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({error: "Invalid payload"}, {status: 400});
  }

  const carId = Number(body.carId);
  const preferredDate = String(body.preferredDate ?? "").trim();
  const message = String(body.message ?? "").trim();
  const locale = normalizeLocale(typeof body.locale === "string" ? body.locale : undefined);

  if (!Number.isFinite(carId) || carId <= 0) {
    return NextResponse.json({error: "Invalid car id"}, {status: 400});
  }

  if (!isIsoDate(preferredDate)) {
    return NextResponse.json({error: "Invalid date"}, {status: 400});
  }

  if (message.length < 5) {
    return NextResponse.json({error: "Message too short"}, {status: 400});
  }

  const car = await prisma.car.findUnique({
    where: {id: carId},
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true
    }
  });

  if (!car) {
    return NextResponse.json({error: "Car not found"}, {status: 404});
  }

  const recipientEmail = process.env.INSPECTION_RECIPIENT_EMAIL || "motor.bay.de@gmail.com";

  const sent = await sendInspectionRequestEmail({
    to: recipientEmail,
    locale,
    userEmail,
    preferredDate,
    message,
    car
  });

  if (!sent) {
    return NextResponse.json({error: "Send failed"}, {status: 500});
  }

  return NextResponse.json({ok: true});
}
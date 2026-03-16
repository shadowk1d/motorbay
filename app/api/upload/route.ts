import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { auth } from "@/auth";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Нужен вход в аккаунт" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Допустимы только изображения (JPEG, PNG, WebP, GIF)" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Файл превышает допустимый размер 10 МБ" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "motorbay/cars",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Upload failed"));
              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        )
        .end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json(
      { error: "Ошибка загрузки изображения" },
      { status: 500 }
    );
  }
}
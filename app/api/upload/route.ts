import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
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
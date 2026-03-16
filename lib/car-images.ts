import {cloudinary} from "@/lib/cloudinary";

export type PersistedCarImage = {
  id: number;
  url: string;
  publicId: string | null;
  order: number;
};

export type UploadedImage = {
  url: string;
  publicId: string;
  order: number;
};

export async function uploadCarImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
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
  });
}

export async function destroyCarImage(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {resource_type: "image"});
  } catch (error) {
    console.error("CLOUDINARY_DESTROY_ERROR", error);
  }
}

export function buildImageOrder<T extends {id: number}>(
  existingImages: T[],
  uploadedImages: UploadedImage[],
  primaryChoice: string,
  existingPrefix = "existing:",
  newPrefix = "new:"
) {
  const orderedExisting = [...existingImages];
  const orderedNew = [...uploadedImages];

  if (primaryChoice.startsWith(existingPrefix)) {
    const imageId = Number(primaryChoice.slice(existingPrefix.length));
    const index = orderedExisting.findIndex((image) => image.id === imageId);

    if (index > 0) {
      const [primary] = orderedExisting.splice(index, 1);
      orderedExisting.unshift(primary);
    }
  }

  if (primaryChoice.startsWith(newPrefix)) {
    const newIndex = Number(primaryChoice.slice(newPrefix.length));

    if (!Number.isNaN(newIndex) && newIndex >= 0 && newIndex < orderedNew.length) {
      const [primary] = orderedNew.splice(newIndex, 1);
      orderedNew.unshift(primary);
    }
  }

  return {
    orderedExisting,
    orderedNew
  };
}

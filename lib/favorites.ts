import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function getCurrentUserFavoriteIds() {
  const session = await auth();
  const userId = Number(session?.user?.id ?? "");

  if (!userId) {
    return [] as number[];
  }

  const favorites = await prisma.savedCar.findMany({
    where: {userId},
    select: {carId: true}
  });

  return favorites.map((item: any) => item.carId);
}

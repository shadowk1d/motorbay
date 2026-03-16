import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://motor-bay.de";
const LOCALES = ["de", "ru", "en"] as const;

const STATIC_ROUTES = [
  "",
  "/cars",
  "/about",
  "/contact",
  "/impressum",
  "/datenschutz",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for all locales
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic car pages
  const cars = await prisma.car.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  for (const car of cars) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/cars/${car.id}`,
        lastModified: car.createdAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  return entries;
}

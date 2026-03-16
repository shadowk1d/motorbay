import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/ru/admin", "/en/admin", "/de/admin"],
    },
    sitemap: "https://motor-bay.de/sitemap.xml",
  };
}

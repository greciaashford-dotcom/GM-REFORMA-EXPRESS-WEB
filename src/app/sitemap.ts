import { MetadataRoute } from "next";
import db from "@/lib/db";
import { BRAND, LOCALES } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BRAND.siteUrl;

  const staticRoutes = [
    "",
    "/servicios",
    "/reservar",
    "/presupuesto",
    "/blog",
    "/como-trabajamos",
    "/sobre-nosotros",
    "/zonas-servicio",
    "/contacto",
    "/aviso-legal",
    "/privacidad",
    "/cookies",
    "/condiciones-contratacion",
    "/desistimiento",
    "/accesibilidad",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static routes for each locale
  for (const route of staticRoutes) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" || route === "/servicios" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route.startsWith("/servicios") ? 0.9 : 0.7,
      });
    }
  }

  // Dynamic Service pages
  try {
    const services = await db.service.findMany({
      include: { translations: true },
    });

    for (const service of services) {
      for (const t of service.translations) {
        sitemapEntries.push({
          url: `${baseUrl}/${t.locale}/servicios/${t.slug}`,
          lastModified: service.updatedAt,
          changeFrequency: "weekly",
          priority: 0.85,
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap Services Error]", err);
  }

  // Dynamic Blog pages
  try {
    const posts = await db.post.findMany({
      where: { status: "APPROVED" },
      include: { translations: true },
    });



    for (const post of posts) {
      for (const t of post.translations) {
        sitemapEntries.push({
          url: `${baseUrl}/${t.locale}/blog/${t.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: "monthly",
          priority: 0.75,
        });
      }
    }
  } catch (err) {
    console.error("[Sitemap Blog Error]", err);
  }

  return sitemapEntries;
}

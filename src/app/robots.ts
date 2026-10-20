import { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api/*",
        "/*/cliente",
        "/*/cliente/*",
      ],
    },
    sitemap: `${BRAND.siteUrl}/sitemap.xml`,
  };
}

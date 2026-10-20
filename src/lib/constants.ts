export const BRAND = {
  name: "GM REFORMA EXPRESS",
  commercialName: "GM REFORMA EXPRESS",
  legalName: "ANDERSON BEJARANO VASQUEZ",
  fiscalAddress: "Calle Ramon Lujan 53, Madrid",
  logoUrl:
    "https://assets.zyrosite.com/AE0aqQkQ26ukrZyD/whatsapp_image_2025-09-09_at_21.53.36-removebg-preview-A0xv36rxqlHrX8j2.png",
  taxId: "Y90137803D",
  taxIdVerified: false,
  taxIdWarning:
    "El identificador 'Y90137803D' tiene 10 caracteres y está en trámite de validación censal ante la AEAT. Razón Social: ANDERSON BEJARANO VASQUEZ, Domicilio Fiscal: Calle Ramon Lujan 53, Madrid.",
  phone: "+34640677948",
  phoneVisible: "+34 640 677 948",
  phoneTel: "tel:+34640677948",
  email: "notificaciones.info@reformaexpress.com",
  emailMailto: "mailto:notificaciones.info@reformaexpress.com",
  whatsappUrl: "https://wa.me/34640677948",
  canonicalDomain: "https://www.reformaexpress.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.reformaexpress.com",
  area: "Madrid, España",
  timezone: "Europe/Madrid",
  currency: "EUR",
  currencySymbol: "€",
} as const;

export const LOCALES = ["es", "fr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
};

// Madrid postal code coverage
export const COVERED_POSTAL_CODES_PREFIXES = ["280", "281", "282", "283", "284", "285", "286", "287", "288", "289"];

export function isPostalCodeCovered(postalCode: string): boolean {
  const clean = postalCode.trim();
  if (!/^\d{5}$/.test(clean)) return false;
  return COVERED_POSTAL_CODES_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

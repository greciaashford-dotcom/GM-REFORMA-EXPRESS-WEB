import React from "react";
import { notFound } from "next/navigation";
import { LOCALES, Locale, BRAND } from "@/lib/constants";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";
import ScrollToTop from "@/components/ScrollToTop";
import { getCurrentSession } from "@/lib/auth/session";


export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const session = await getCurrentSession();

  // JSON-LD structured data for Organization / HomeAndConstructionBusiness
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: BRAND.canonicalDomain,
    logo: BRAND.logoUrl,
    telephone: BRAND.phone,
    email: BRAND.email,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Comunidad de Madrid",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.fiscalAddress,
      addressLocality: "Madrid",
      addressRegion: "Madrid",
      addressCountry: "ES",
    },
    currenciesAccepted: "EUR",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
  };

  return (
    <html lang={locale} className="h-full overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-full font-sans antialiased bg-warm-50/50 dark:bg-graphite-950 text-graphite-900 dark:text-slate-100 overflow-x-hidden">
        <ScrollToTop />
        <Header locale={typedLocale} session={session} />
        <main className="flex-1">{children}</main>
        <Footer locale={typedLocale} />
        <WhatsAppButton />
        <CookieConsent locale={typedLocale} />
      </body>

    </html>
  );
}

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Locale, BRAND } from "@/lib/constants";
import db from "@/lib/db";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Phone,
  HelpCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface ServicePageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, slug } = params;

  const translation = await db.serviceTranslation.findFirst({
    where: {
      locale,
      slug,
    },
    include: {
      service: true,
    },
  });

  if (!translation) return {};

  const canonical = `${BRAND.canonicalDomain}/${locale}/servicios/${slug}`;

  // Fetch sibling translations for hreflang alternates
  const allTranslations = await db.serviceTranslation.findMany({
    where: { serviceId: translation.serviceId },
  });

  const languageAlternates: Record<string, string> = {};
  for (const t of allTranslations) {
    languageAlternates[t.locale] = `${BRAND.canonicalDomain}/${t.locale}/servicios/${t.slug}`;
  }
  languageAlternates["x-default"] = `${BRAND.canonicalDomain}/es/servicios/${
    allTranslations.find((t) => t.locale === "es")?.slug || slug
  }`;

  return {
    title: translation.seoTitle,
    description: translation.seoDesc,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title: translation.seoTitle,
      description: translation.seoDesc,
      url: canonical,
      siteName: BRAND.name,
      locale,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { locale, slug } = params;

  const translation = await db.serviceTranslation.findFirst({
    where: {
      locale,
      slug,
    },
    include: {
      service: true,
    },
  });

  if (!translation || translation.service.status !== "APPROVED") {
    notFound();
  }

  const s = translation;
  const includedList: string[] = JSON.parse(s.includedItems || "[]");
  const excludedList: string[] = JSON.parse(s.excludedItems || "[]");
  const variantsList: string[] = JSON.parse(s.serviceVariants || "[]");
  const processList: string[] = JSON.parse(s.processSteps || "[]");
  const priceFactorsList: string[] = JSON.parse(s.priceFactors || "[]");
  const technicalReqs: string[] = JSON.parse(s.technicalRequirements || "[]");
  const faqs: { q: string; a: string }[] = JSON.parse(s.faqs || "[]");
  const relatedSlugs: string[] = JSON.parse(s.relatedSlugs || "[]");

  // Fetch related services if any
  const relatedServices = await db.serviceTranslation.findMany({
    where: {
      locale,
      service: {
        key: { in: relatedSlugs },
      },
    },
    take: 3,
  });

  // Schema.org JSON-LD
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.h1,
    description: s.shortDesc,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: BRAND.name,
      telephone: BRAND.phone,
      url: BRAND.canonicalDomain,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Comunidad de Madrid",
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${BRAND.canonicalDomain}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Servicios",
        item: `${BRAND.canonicalDomain}/${locale}/servicios`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: s.navTitle,
        item: `${BRAND.canonicalDomain}/${locale}/servicios/${s.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Migas de pan" className="text-xs text-graphite-500 dark:text-slate-400 flex items-center gap-2">
          <Link href={`/${locale}`} className="hover:underline">Inicio</Link>
          <span>/</span>
          <Link href={`/${locale}/servicios`} className="hover:underline">Servicios</Link>
          <span>/</span>
          <span className="text-graphite-900 dark:text-white font-medium">{s.navTitle}</span>
        </nav>

        {/* 1. Header & Introduction */}
        <header className="space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-graphite-900 dark:text-white tracking-tight">
            {s.h1}
          </h1>

          <div className="p-6 rounded-2xl bg-warm-100/60 dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400">
                Diagnóstico de situación
              </span>
              <p className="text-sm sm:text-base text-graphite-700 dark:text-slate-300 mt-1 leading-relaxed">
                {s.introProblem}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400">
                Nuestra solución técnica
              </span>
              <p className="text-sm sm:text-base text-graphite-700 dark:text-slate-300 mt-1 leading-relaxed">
                {s.introSolution}
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-petroleum-800 dark:text-petroleum-400">
                Área y alcance de actuación
              </span>
              <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-400 mt-1">
                {s.introScope}
              </p>
            </div>
          </div>

          {/* Quick CTA buttons with pre-selected service */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/${locale}/presupuesto?servicio=${translation.service.key}`}
              className="px-6 py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm shadow transition-all flex items-center gap-2 min-h-[48px]"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>Solicitar presupuesto para este servicio</span>
            </Link>
            <Link
              href={`/${locale}/reservar?servicio=${translation.service.key}`}
              className="px-6 py-3.5 rounded-xl border border-petroleum-800 text-petroleum-800 hover:bg-petroleum-50 dark:border-petroleum-400 dark:text-petroleum-300 dark:hover:bg-petroleum-950/60 font-bold text-sm transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <Calendar className="w-5 h-5" />
              <span>Reservar visita técnica</span>
            </Link>
          </div>
        </header>

        {/* 2. Included vs Excluded Scope Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <h2>Qué incluye habitualmente la intervención</h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-graphite-700 dark:text-slate-300">
              {includedList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <h2>Qué no está incluido salvo presupuesto expreso</h2>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-graphite-700 dark:text-slate-300">
              {excludedList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. Service Variants */}
        {variantsList.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-graphite-900 dark:text-white">
              Modalidades y variantes habituales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {variantsList.map((variant, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 text-xs sm:text-sm font-medium text-graphite-800 dark:text-slate-200"
                >
                  {variant}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Process Steps */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-graphite-900 dark:text-white">
            Proceso de trabajo: paso a paso
          </h2>
          <div className="space-y-3">
            {processList.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-petroleum-100 dark:bg-petroleum-900 text-petroleum-800 dark:text-petroleum-300 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-graphite-800 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Pricing Conditioning Factors & Technical Requirements */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-graphite-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-petroleum-700" />
              Factores que condicionan precio y plazo
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-graphite-600 dark:text-slate-400">
              {priceFactorsList.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-petroleum-700">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-graphite-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-petroleum-700" />
              Requisitos técnicos y normativos en Madrid
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-graphite-600 dark:text-slate-400">
              {technicalReqs.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-petroleum-700">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Frequently Asked Questions */}
        {faqs.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-graphite-200 dark:border-graphite-800">
            <h2 className="text-xl font-bold text-graphite-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-petroleum-700" />
              Preguntas frecuentes sobre este servicio
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 space-y-2"
                >
                  <h3 className="font-bold text-sm sm:text-base text-graphite-900 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-graphite-600 dark:text-slate-300 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Related Services */}
        {relatedServices.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-graphite-200 dark:border-graphite-800">
            <h2 className="text-xl font-bold text-graphite-900 dark:text-white">
              Servicios relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedServices.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${locale}/servicios/${rel.slug}`}
                  className="p-4 rounded-xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 hover:border-petroleum-600 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-xs sm:text-sm text-graphite-800 dark:text-white">
                    {rel.navTitle}
                  </span>
                  <ArrowRight className="w-4 h-4 text-petroleum-700" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA Banner */}
        <div className="p-8 rounded-3xl bg-petroleum-900 text-white space-y-4 text-center">
          <h2 className="text-2xl font-bold">¿Tienes un proyecto de {s.navTitle.toLowerCase()} en Madrid?</h2>
          <p className="text-sm text-petroleum-100 max-w-xl mx-auto">
            Explícanos tu caso o solicita una visita técnica en tu domicilio para recibir una propuesta desglosada y sin compromiso.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/presupuesto?servicio=${translation.service.key}`}
              className="px-6 py-3 rounded-xl bg-white text-petroleum-900 font-bold text-sm shadow hover:bg-warm-50 transition-colors"
            >
              Solicitar presupuesto
            </Link>
            <a
              href={BRAND.phoneTel}
              className="px-6 py-3 rounded-xl border border-petroleum-300 text-white font-bold text-sm hover:bg-petroleum-800 transition-colors flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{BRAND.phoneVisible}</span>
            </a>
          </div>
        </div>
      </article>
    </>
  );
}

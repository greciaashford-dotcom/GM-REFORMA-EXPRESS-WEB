import React from "react";
import db from "@/lib/db";
import { Locale } from "@/lib/constants";
import { Cookie } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function CookiesPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "cookies" },
    });
  } catch (err) {
    console.warn("[Cookies] Database query fallback:", err);
  }

  const content =
    locale === "en"
      ? doc?.contentEn
      : locale === "fr"
      ? doc?.contentFr
      : locale === "de"
      ? doc?.contentDe
      : doc?.contentEs;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-200 dark:bg-graphite-800 text-graphite-800 dark:text-slate-200 text-xs font-bold mb-4">
          <Cookie className="w-3.5 h-3.5 text-petroleum-700" /> Guía de Cookies AEPD
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Política de Cookies
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Transparencia y control granular de cookies según las directrices de la Agencia Española de Protección de Datos.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
1. ¿QUÉ SON LAS COOKIES?
Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo.

2. TIPOS DE COOKIES UTILIZADAS EN ESTE SITIO WEB
- Cookies Técnicas y Estrictamente Necesarias: Indispensables para la navegación, autenticación de sesión y seguridad (no requieren consentimiento).
- Cookies de Preferencias: Guardan el idioma seleccionado (es, en, fr, de) y el tema visual (claro/oscuro).
- Cookies Analíticas y de Medición: Permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico del uso que hacen los usuarios de la web (requieren consentimiento expreso).

3. GESTIÓN Y CONFIGURACIÓN DEL CONSENTIMIENTO
Puede modificar sus preferencias en cualquier momento o revocar el consentimiento previamente otorgado haciendo clic en el banner flotante o borrando las cookies en la configuración de su navegador habitual (Chrome, Firefox, Safari, Edge).
        `}
      </div>
    </div>
  );
}

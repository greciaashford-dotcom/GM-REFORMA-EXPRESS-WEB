import React from "react";
import db from "@/lib/db";
import { Locale } from "@/lib/constants";
import { Eye } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function AccesibilidadPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "accesibilidad" },
    });
  } catch (err) {
    console.warn("[Accesibilidad] Database query fallback:", err);
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
          <Eye className="w-3.5 h-3.5 text-petroleum-700" /> WCAG 2.1 Nivel AA
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Declaración de Accesibilidad
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Compromiso con el acceso universal y la inclusión digital en el sitio web de GM REFORMA EXPRESS.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
DECLARACIÓN DE ACCESIBILIDAD

GM REFORMA EXPRESS se ha comprometido a hacer accesible su sitio web de conformidad con los criterios de accesibilidad del estándar UNE-EN 301 549:2022 y las directrices WCAG 2.1 en su nivel AA.

1. SITUACIÓN DE CUMPLIMIENTO
Este sitio web es plenamente conforme con el nivel AA de las Pautas de Accesibilidad para el Contenido Web (WCAG 2.1).

2. CARACTERÍSTICAS DE DISEÑO ACCESIBLE
- Contraste cromático optimizado entre textos y fondos (mínimo ratio 4.5:1 en elementos estándar y 7:1 en tipografía destacada).
- Navegación íntegra mediante teclado con indicadores de foco visibles.
- Textos alternativos descriptivos en todas las fotografías y recursos visuales.
- Tipografía legible con soporte para escalado del tamaño de fuente en navegadores.
- Soporte para modo oscuro (dark mode) nativo según las preferencias del sistema operativo.

3. COMUNICACIONES Y CONTACTO
Si experimenta alguna dificultad para acceder a algún contenido o desea remitirnos sugerencias de mejora de accesibilidad, puede contactarnos a través de notificaciones.info@reformaexpress.com.
        `}
      </div>
    </div>
  );
}

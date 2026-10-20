import React from "react";
import db from "@/lib/db";
import { BRAND, Locale } from "@/lib/constants";
import { Shield, AlertTriangle } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function AvisoLegalPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "aviso-legal" },
    });
  } catch (err) {
    console.warn("[AvisoLegal] Database query fallback:", err);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-petroleum-100 dark:bg-petroleum-950/60 text-petroleum-800 dark:text-petroleum-300 text-xs font-bold mb-4">
          <Shield className="w-3.5 h-3.5" /> Marco Legal y Regulatorio LSSI-CE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Aviso Legal e Información Societaria
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Última actualización: Versión {doc?.version || "1.0"} - Madrid, España
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 flex items-start gap-3 text-xs text-graphite-700 dark:text-slate-300">
        <Shield className="w-5 h-5 flex-shrink-0 text-secondary" />
        <div>
          <strong>Identificación Fiscal y Titularidad:</strong> Actividad comercial bajo el nombre <strong>{BRAND.name}</strong>, titularidad legal a nombre de <strong>{BRAND.legalName}</strong> con NIF/NIE <strong>{BRAND.taxId}</strong> y domicilio fiscal en <strong>{BRAND.fiscalAddress}</strong>.
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
1. DATOS IDENTIFICATIVOS DEL TITULAR
En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:
- Razón Social / Titular: ${BRAND.legalName}
- Nombre Comercial: ${BRAND.name}
- NIF/NIE: ${BRAND.taxId}
- Domicilio Fiscal: ${BRAND.fiscalAddress}
- Teléfono de contacto: ${BRAND.phoneVisible}
- Correo electrónico de notificaciones: ${BRAND.email}
- Sitio Web: ${BRAND.canonicalDomain}

2. OBJETO Y ÁMBITO DE APLICACIÓN
El presente Aviso Legal regula el acceso, navegación y uso del sitio web oficial de GM REFORMA EXPRESS, así como las responsabilidades derivadas del uso de sus contenidos e interactividad (solicitud de presupuestos, reservas técnicas y portal de clientes).

3. CONDICIONES DE ACCESO Y USO
El acceso a la web es libre y gratuito para el usuario. El usuario se compromete a hacer un uso lícito y ético de la plataforma, absteniéndose de incurrir en actividades ilícitas o contrarias a la buena fe y al orden público.

4. DERECHOS DE PROPIEDAD INTELECTUAL E INDUSTRIAL
Todos los contenidos del sitio (textos, fotografías, logotipos, código fuente, diseño gráfico y arquitectura) son propiedad de GM REFORMA EXPRESS o de terceros autorizados, quedando expresamente prohibida su reproducción o distribución sin consentimiento previo.

5. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web, será de aplicación la legislación española, siendo competentes los Juzgados y Tribunales de la ciudad de Madrid.
        `}
      </div>
    </div>
  );
}

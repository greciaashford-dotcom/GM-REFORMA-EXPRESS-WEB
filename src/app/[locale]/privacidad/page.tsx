import React from "react";
import db from "@/lib/db";
import { BRAND, Locale } from "@/lib/constants";
import { Lock, ShieldCheck } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function PrivacidadPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "privacidad" },
    });
  } catch (err) {
    console.warn("[Privacidad] Database query fallback:", err);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> RGPD (UE 2016/679) & LOPDGDD 3/2018
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Política de Privacidad y Protección de Datos
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Responsable del Tratamiento: GM REFORMA EXPRESS (Madrid, España) · Versión {doc?.version || "1.0"}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
1. RESPONSABLE DEL TRATAMIENTO
El responsable del tratamiento de sus datos personales es GM REFORMA EXPRESS, con actividad en la Comunidad de Madrid.
Correo electrónico de contacto RGPD: notificaciones.info@reformaexpress.com.

2. FINALIDADES DEL TRATAMIENTO Y BASE JURÍDICA
Sus datos personales son tratados con las siguientes finalidades:
- Gestión de presupuestos y solicitudes técnicas: Ejecución de medidas precontractuales (Art. 6.1.b RGPD).
- Gestión de citas técnicas y reservas: Ejecución de la relación de servicio (Art. 6.1.b RGPD).
- Facturación y cobro: Cumplimiento de obligaciones legales tributarias (Art. 6.1.c RGPD).
- Envío de newsletter y promociones: Consentimiento explícito mediante doble opt-in (Art. 6.1.a RGPD). Frecuencia limitada a un máximo de 2 envíos semanales.

3. CONSERVACIÓN DE LOS DATOS
Los datos se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades legales que se pudieran derivar.

4. DERECHOS ARCO-POL
Usted tiene derecho a acceder, rectificar, suprimir, oponerse al tratamiento, limitar el tratamiento y solicitar la portabilidad de sus datos enviando un correo electrónico a notificaciones.info@reformaexpress.com junto con copia de su documento de identidad. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD, www.aepd.es).
        `}
      </div>
    </div>
  );
}

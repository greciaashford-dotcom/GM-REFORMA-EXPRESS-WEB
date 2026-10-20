import React from "react";
import db from "@/lib/db";
import { BRAND, Locale } from "@/lib/constants";
import { Undo2 } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function DesistimientoPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "desistimiento" },
    });
  } catch (err) {
    console.warn("[Desistimiento] Database query fallback:", err);
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
          <Undo2 className="w-3.5 h-3.5 text-petroleum-700" /> Derecho de los Consumidores
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Derecho de Desistimiento
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Información relativa al ejercicio del derecho de desistimiento conforme a la normativa española de consumo.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
INFORMACIÓN SOBRE EL EJERCICIO DEL DERECHO DE DESISTIMIENTO

1. PLAZO DE EJERCICIO
Usted tiene derecho a desistir del contrato en un plazo de 14 días naturales sin necesidad de justificación. El plazo de desistimiento expirará a los 14 días naturales desde el día de la celebración del contrato.

2. COMUNICACIÓN DEL DESISTIMIENTO
Para ejercer el derecho de desistimiento, deberá notificarnos su decisión de desistir del contrato a través de una declaración inequívoca enviada a:
- Correo electrónico: notificaciones.info@reformaexpress.com
- Dirección postal: GM REFORMA EXPRESS, Comunidad de Madrid, España.
- Teléfono: +34 640 677 948

3. EXCEPCIONES AL DERECHO DE DESISTIMIENTO
Conforme al artículo 103 del Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios, el derecho de desistimiento no será aplicable a:
a) La prestación de servicios, una vez que el servicio haya sido completamente ejecutado con previo consentimiento expreso del consumidor.
b) El suministro de bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados (por ejemplo, carpinterías a medida, mármoles cortados o mobiliario específico).
c) Los contratos en los que el consumidor haya solicitado específicamente al empresario que le visite para efectuar operaciones de reparación o mantenimiento urgente.
        `}
      </div>
    </div>
  );
}

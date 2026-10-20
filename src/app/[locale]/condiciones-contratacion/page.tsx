import React from "react";
import db from "@/lib/db";
import { Locale } from "@/lib/constants";
import { FileText, CheckCircle } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function CondicionesContratacionPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "condiciones-contratacion" },
    });
  } catch (err) {
    console.warn("[CondicionesContratacion] Database query fallback:", err);
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
          <FileText className="w-3.5 h-3.5" /> Marco Contractual de Reformas
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Condiciones Generales de Contratación
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Garantías, hitos de pago, validación de presupuesto y ejecución de obras en Madrid · Versión {doc?.version || "1.0"}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
1. ÁMBITO DE APLICACIÓN
Las presentes Condiciones Generales de Contratación regulan la prestación de servicios de reformas y obras por parte de GM REFORMA EXPRESS en el territorio de la Comunidad de Madrid.

2. PRESUPUESTOS Y VALIDACIÓN DEL IMPORTE ACORDADO
- Los presupuestos emitidos por GM REFORMA EXPRESS son vinculantes durante el período de validez estipulado en los mismos (generalmente 30 días naturales).
- Para la contratación a través de la pasarela electrónica, rige el principio antifraude de verificación estricta: el importe a abonar debe coincidir exactamente con el presupuesto aprobado registrado en el sistema. Cualquier discrepancia o modificación requiere autorización expresa.

3. FORMA DE PAGO E HITOS
Salvo acuerdo específico formalizado por escrito, el abono de los trabajos se estructura por hitos de ejecución:
- Anticipo inicial para acopio de materiales y planificación.
- Pagos intermedios según certificaciones de avance de obra.
- Liquidación final a la entrega y firma del acta de recepción conforme.

4. DERECHO DE DESISTIMIENTO
Conforme al Real Decreto Legislativo 1/2007, el cliente consumidor dispone de un plazo de 14 días naturales para ejercer su derecho de desistimiento, salvo en los supuestos de bienes confeccionados conforme a las especificaciones del consumidor (materiales a medida) o servicios completamente ejecutados con consentimiento expreso.

5. GARANTÍA DE LAS OBRAS
GM REFORMA EXPRESS responde de los defectos de ejecución conforme a los plazos previstos en la Ley de Ordenación de la Edificación (LOE) y el Código Civil español.
        `}
      </div>
    </div>
  );
}

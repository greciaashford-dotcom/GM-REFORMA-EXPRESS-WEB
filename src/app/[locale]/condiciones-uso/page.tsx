import React from "react";
import db from "@/lib/db";
import { BRAND, Locale } from "@/lib/constants";
import { Shield, FileCheck2 } from "lucide-react";

interface Props {
  params: { locale: string };
}

export default async function CondicionesUsoPage({ params }: Props) {
  const locale = (params.locale as Locale) || "es";
  let doc = null;
  try {
    doc = await db.legalDocument.findUnique({
      where: { type: "condiciones-uso" },
    });
  } catch (err) {
    console.warn("[CondicionesUso] Database query fallback:", err);
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
          <FileCheck2 className="w-3.5 h-3.5" /> Normativa de Uso de la Plataforma Digital
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-graphite-900 dark:text-white tracking-tight">
          Condiciones Generales de Uso del Sitio Web
        </h1>
        <p className="text-xs text-graphite-500 mt-2">
          Última actualización: Versión {doc?.version || "1.0"} · {BRAND.name} (Madrid)
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 flex items-start gap-3 text-xs text-graphite-700 dark:text-slate-300">
        <Shield className="w-5 h-5 flex-shrink-0 text-secondary" />
        <div>
          <strong>Titularidad:</strong> Plataforma operada por <strong>{BRAND.legalName}</strong> ({BRAND.name}), NIF/NIE <strong>{BRAND.taxId}</strong>, con domicilio fiscal en <strong>{BRAND.fiscalAddress}</strong>.
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm text-sm text-graphite-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
        {content || `
1. OBJETO DE LAS CONDICIONES DE USO
Las presentes Condiciones Generales regulan el acceso, navegación y utilización de la plataforma web de ${BRAND.name} (${BRAND.canonicalDomain}), incluyendo el uso del catálogo técnico de servicios, el sistema de solicitud de presupuestos, la agenda de reservas de visitas técnicas y el portal privado de clientes.

2. CONDICIÓN DE USUARIO Y USO CORRECTO DE LA PLATAFORMA
El acceso o utilización del sitio web atribuye la condición de Usuario e implica la aceptación plena de estas Condiciones de Uso. El Usuario se compromete a utilizar la web, sus formularios y herramientas de reserva conforme a la ley, la buena fe y el orden público, proporcionando datos veraces y exactos en las solicitudes de presupuesto o citas técnicas en la Comunidad de Madrid.

3. FUNCIONAMIENTO DEL SISTEMA DE RESERVAS Y PRESUPUESTOS ONLINE
- Las solicitudes de presupuesto enviadas a través de la web tienen carácter informativo previo y están sujetas a validación y replanteo técnico presencial en el inmueble.
- Las reservas de llamadas de orientación y visitas técnicas están destinadas a inmuebles ubicados dentro de nuestra zona de cobertura operativa en la Comunidad de Madrid (códigos postales 28001 a 28991).

4. SEGURIDAD Y ACCESO AL ÁREA PRIVADA DE CLIENTES
El acceso al Área de Clientes requiere autenticación mediante credenciales personales. El Usuario es responsable de custodiar su contraseña y notificar a ${BRAND.email} cualquier uso no autorizado de su cuenta.

5. PROPIEDAD INTELECTUAL Y ENLACES
Todos los contenidos técnicos, guías editoriales, imágenes, logotipos y software del sitio web están protegidos por derechos de propiedad intelectual e industrial.

6. LEGISLACIÓN APLICABLE
Las presentes Condiciones de Uso se rigen por la legislación española, sometiéndose las partes a los Juzgados y Tribunales de Madrid capital.
        `}
      </div>
    </div>
  );
}

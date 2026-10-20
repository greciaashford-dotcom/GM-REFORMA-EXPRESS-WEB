import React from "react";
import db from "@/lib/db";
import { Settings, ShieldAlert, AlertTriangle, CheckCircle2, Lock, Save } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminConfiguracionPage() {
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  async function updateSettingsAction(formData: FormData) {
    "use server";
    const legalName = (formData.get("legalName") as string)?.trim() || null;
    const taxAddress = (formData.get("taxAddress") as string)?.trim() || null;
    const taxIdVerified = formData.get("taxIdVerified") === "on";
    const whatsappEnabled = formData.get("whatsappEnabled") === "on";
    const publicBookingsEnabled = formData.get("publicBookingsEnabled") === "on";

    // Strict validation safety: Live payments and fiscal issuance can ONLY be enabled
    // if taxIdVerified is true, legalName is filled, and taxAddress is filled!
    const canEnableRealFiscal = taxIdVerified && Boolean(legalName) && Boolean(taxAddress);
    const livePaymentsEnabled = canEnableRealFiscal && formData.get("livePaymentsEnabled") === "on";
    const fiscalIssuanceEnabled = canEnableRealFiscal && formData.get("fiscalIssuanceEnabled") === "on";

    await db.siteSettings.update({
      where: { id: "default" },
      data: {
        legalName,
        taxAddress,
        taxIdVerified,
        whatsappEnabled,
        publicBookingsEnabled,
        livePaymentsEnabled,
        fiscalIssuanceEnabled,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          22. Configuración General y Verificación Fiscal del Emisor
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Validación documental preceptiva del titular antes de habilitar cobros reales y facturación fiscal en producción.
        </p>
      </div>

      {/* Tax Verification Notice */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Validaciones previas al lanzamiento en producción</span>
        </div>
        <ul className="text-xs text-amber-900 dark:text-amber-300 space-y-1.5 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Identificador facilitado:</strong> Se conserva literalmente como <code>{settings?.taxId || "Y90137803D"}</code>, marcado como pendiente de verificación.
          </li>
          <li>
            <strong>Longitud y estructura:</strong> El valor facilitado tiene diez caracteres y no coincide con la estructura de nueve caracteres de los NIE de la AEAT. Se requiere confirmación documental de la tarjeta de identidad y naturaleza jurídica del titular (persona física vs jurídica).
          </li>
          <li>
            <strong>Diferenciación:</strong> &quot;GM REFORMA EXPRESS&quot; es el nombre comercial, no la razón social del titular.
          </li>
          <li>
            <strong>Bloqueo de seguridad:</strong> La activación de cobros reales y la emisión fiscal quedan estrictamente bloqueadas en el servidor hasta validar estos datos.
          </li>
        </ul>
      </div>

      {/* Settings Form */}
      <form action={updateSettingsAction} className="space-y-6 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-8 rounded-3xl shadow-sm">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white border-b border-graphite-100 dark:border-graphite-800 pb-3">
          Datos de la Entidad Emisora
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Nombre comercial
              </label>
              <input
                type="text"
                disabled
                value={settings?.commercialName || "GM REFORMA EXPRESS"}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-200 dark:border-graphite-700 bg-graphite-100 dark:bg-graphite-800 text-xs font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Identificador fiscal facilitado
              </label>
              <input
                type="text"
                disabled
                value={settings?.taxId || "Y90137803D"}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-200 dark:border-graphite-700 bg-graphite-100 dark:bg-graphite-800 text-xs font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Razón Social / Nombre legal completo del titular *
              </label>
              <input
                type="text"
                name="legalName"
                defaultValue={settings?.legalName || ""}
                placeholder="Pendiente de confirmación documental"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs focus:ring-2 focus:ring-petroleum-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1">
                Domicilio fiscal completo *
              </label>
              <input
                type="text"
                name="taxAddress"
                defaultValue={settings?.taxAddress || ""}
                placeholder="Calle, número, código postal, Madrid"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs focus:ring-2 focus:ring-petroleum-600"
              />
            </div>
          </div>

          {/* Verification Checkbox */}
          <div className="p-4 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 flex items-start gap-3">
            <input
              id="tax-verified-check"
              type="checkbox"
              name="taxIdVerified"
              defaultChecked={settings?.taxIdVerified}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-0.5 cursor-pointer"
            />
            <label htmlFor="tax-verified-check" className="text-xs text-graphite-700 dark:text-slate-300 leading-relaxed cursor-pointer">
              <strong>Confirmación documental realizada:</strong> Certifico que he comprobado la tarjeta del NIF/NIE expedida por la Agencia Tributaria y que los datos legales y domicilio fiscal son veraces y corresponden a la titularidad jurídica del negocio.
            </label>
          </div>
        </div>

        {/* Security Feature Flags */}
        <h2 className="text-base font-bold text-graphite-900 dark:text-white border-b border-graphite-100 dark:border-graphite-800 pt-4 pb-3">
          Interruptores de Operativa y Producción
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700">
            <div>
              <span className="font-bold text-xs block text-graphite-900 dark:text-white">
                Acceso flotante a WhatsApp (+34 640 677 948)
              </span>
              <span className="text-[11px] text-graphite-500">
                Enlace directo https://wa.me/34640677948 sin rastreadores externos
              </span>
            </div>
            <input
              type="checkbox"
              name="whatsappEnabled"
              defaultChecked={settings?.whatsappEnabled}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700">
            <div>
              <span className="font-bold text-xs block text-graphite-900 dark:text-white">
                Reservas y Citas públicas habilitadas
              </span>
              <span className="text-[11px] text-graphite-500">
                Permite a los visitantes reservar llamadas de orientación y visitas técnicas
              </span>
            </div>
            <input
              type="checkbox"
              name="publicBookingsEnabled"
              defaultChecked={settings?.publicBookingsEnabled}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700">
            <div>
              <span className="font-bold text-xs block text-graphite-900 dark:text-white">
                Cobros reales con Stripe (Live Payments)
              </span>
              <span className="text-[11px] text-graphite-500">
                Bloqueado si los datos fiscales del emisor están pendientes de verificación
              </span>
            </div>
            <input
              type="checkbox"
              name="livePaymentsEnabled"
              defaultChecked={settings?.livePaymentsEnabled}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700">
            <div>
              <span className="font-bold text-xs block text-graphite-900 dark:text-white">
                Emisión fiscal activa (VERI*FACTU / Proveedor)
              </span>
              <span className="text-[11px] text-graphite-500">
                En modo pruebas se generan documentos marcados como PRUEBA / NO FISCAL
              </span>
            </div>
            <input
              type="checkbox"
              name="fiscalIssuanceEnabled"
              defaultChecked={settings?.fiscalIssuanceEnabled}
              className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Guardar configuración y bloqueos</span>
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Locale } from "@/lib/constants";
import { UserCheck, MapPin, Receipt, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface PerfilClientePageProps {
  params: { locale: string };
}

export default function PerfilClientePage({ params }: PerfilClientePageProps) {
  const locale = params.locale as Locale;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    workAddress: "",
    workPostalCode: "",
    workCity: "Madrid",
    billingName: "",
    billingTaxId: "",
    billingAddress: "",
    billingPostalCode: "",
    billingCity: "Madrid",
    electronicInvoiceConsent: true,
    marketingConsent: false,
    preferredLocale: locale,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.customerProfile?.phone || "",
          workAddress: data.user.customerProfile?.workAddress || "",
          workPostalCode: data.user.customerProfile?.workPostalCode || "",
          workCity: data.user.customerProfile?.workCity || "Madrid",
          billingName: data.user.customerProfile?.billingName || "",
          billingTaxId: data.user.customerProfile?.billingTaxId || "",
          billingAddress: data.user.customerProfile?.billingAddress || "",
          billingPostalCode: data.user.customerProfile?.billingPostalCode || "",
          billingCity: data.user.customerProfile?.billingCity || "Madrid",
          electronicInvoiceConsent: Boolean(data.user.customerProfile?.electronicInvoiceConsent),
          marketingConsent: Boolean(data.user.customerProfile?.marketingConsent),
          preferredLocale: data.user.customerProfile?.preferredLocale || locale,
        });
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Error al guardar los datos del perfil");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "No fue posible guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-graphite-500">Cargando datos del perfil...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 dark:text-white">
          Datos Personales y Fiscales
        </h1>
        <p className="text-sm text-graphite-600 dark:text-slate-300">
          Gestione su dirección de obra y sus datos de facturación con total separación legal.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Datos actualizados con éxito.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-petroleum-700" />
            Datos de contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Nombre y apellidos
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Work address */}
        <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-petroleum-700" />
            Domicilio de la obra (Inmueble de Madrid)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Calle, número, piso y puerta
              </label>
              <input
                type="text"
                value={profile.workAddress}
                onChange={(e) => setProfile({ ...profile, workAddress: e.target.value })}
                placeholder="Calle de Alcalá 120, 3º B"
                className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                  Código postal
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={profile.workPostalCode}
                  onChange={(e) => setProfile({ ...profile, workPostalCode: e.target.value })}
                  placeholder="28009"
                  className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                  Municipio
                </label>
                <input
                  type="text"
                  value={profile.workCity}
                  onChange={(e) => setProfile({ ...profile, workCity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing address */}
        <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-petroleum-700" />
            Datos fiscales para facturación
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                  Razón social o nombre completo del titular
                </label>
                <input
                  type="text"
                  value={profile.billingName}
                  onChange={(e) => setProfile({ ...profile, billingName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                  NIF / NIE fiscal
                </label>
                <input
                  type="text"
                  value={profile.billingTaxId}
                  onChange={(e) => setProfile({ ...profile, billingTaxId: e.target.value })}
                  placeholder="12345678Z"
                  className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Domicilio fiscal
              </label>
              <input
                type="text"
                value={profile.billingAddress}
                onChange={(e) => setProfile({ ...profile, billingAddress: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Consents & Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-petroleum-700" />
            Preferencias de comunicación y facturación
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                id="elec-inv-consent"
                type="checkbox"
                checked={profile.electronicInvoiceConsent}
                onChange={(e) => setProfile({ ...profile, electronicInvoiceConsent: e.target.checked })}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-1 cursor-pointer"
              />
              <label htmlFor="elec-inv-consent" className="text-xs text-graphite-700 dark:text-slate-300 leading-normal cursor-pointer">
                Consiento expresamente la recepción de facturas en formato electrónico descargable a través de esta plataforma privada.
              </label>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                id="mkt-consent"
                type="checkbox"
                checked={profile.marketingConsent}
                onChange={(e) => setProfile({ ...profile, marketingConsent: e.target.checked })}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-1 cursor-pointer"
              />
              <label htmlFor="mkt-consent" className="text-xs text-graphite-700 dark:text-slate-300 leading-normal cursor-pointer">
                Autorizo el envío de comunicaciones comerciales y técnicas sobre reformas (máximo 2 por semana).
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-sm shadow transition-all flex items-center gap-2 min-h-[44px] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <span>Guardar datos y preferencias</span>
          )}
        </button>
      </form>
    </div>
  );
}

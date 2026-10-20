"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Languages,
  ShieldCheck,
  FileText,
  ListPlus,
} from "lucide-react";

export interface TranslationData {
  locale: string;
  slug: string;
  h1: string;
  navTitle: string;
  shortDesc: string;
  seoTitle: string;
  seoDesc: string;
  introProblem: string;
  introSolution: string;
  introScope: string;
  includedItems: string;
  excludedItems: string;
}

export interface ServiceData {
  id: string;
  key: string;
  category: "REFORMAS_VIVIENDA" | "INSTALACIONES_CONFORT" | "ACCESIBILIDAD_COMUNIDADES";
  status: "DRAFT" | "APPROVED" | "ARCHIVED";
  orderIndex: number;
  featuredImage?: string | null;
  technicalReviewNotes?: string | null;
  isRegulated: boolean;
  qualifiedPartnerRequired: boolean;
  translations: Record<string, TranslationData>;
}

interface Props {
  initialService: ServiceData;
  onSaveAction: (data: ServiceData) => Promise<{ success: boolean; message?: string }>;
}

const LOCALES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function ServiceEditForm({ initialService, onSaveAction }: Props) {
  const router = useRouter();
  const [service, setService] = useState<ServiceData>(initialService);
  const [activeTab, setActiveTab] = useState<"general" | "es" | "en" | "fr" | "de">("general");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGeneralChange = (field: keyof ServiceData, value: any) => {
    setService((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTranslationChange = (locale: string, field: keyof TranslationData, value: string) => {
    setService((prev) => {
      const existing = prev.translations[locale] || {
        locale,
        slug: prev.key,
        h1: "",
        navTitle: "",
        shortDesc: "",
        seoTitle: "",
        seoDesc: "",
        introProblem: "",
        introSolution: "",
        introScope: "",
        includedItems: "[]",
        excludedItems: "[]",
      };
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            ...existing,
            [field]: value,
          },
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await onSaveAction(service);
        if (res.success) {
          setFeedback({
            type: "success",
            text: res.message || "Servicio y traducciones actualizados con éxito en base de datos.",
          });
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            text: res.message || "Error al actualizar el servicio.",
          });
        }
      } catch (err: any) {
        setFeedback({
          type: "error",
          text: err?.message || "Ocurrió un error inesperado al guardar los cambios.",
        });
      }
    });
  };

  const currentTranslation = service.translations[activeTab === "general" ? "es" : activeTab] || {
    locale: activeTab === "general" ? "es" : activeTab,
    slug: service.key,
    h1: "",
    navTitle: "",
    shortDesc: "",
    seoTitle: "",
    seoDesc: "",
    introProblem: "",
    introSolution: "",
    introScope: "",
    includedItems: "",
    excludedItems: "",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-200 dark:border-graphite-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/servicios"
              className="inline-flex items-center gap-1 text-xs font-semibold text-petroleum-800 dark:text-petroleum-300 hover:text-secondary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Catálogo de Servicios</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-graphite-900 dark:text-white flex items-center gap-2">
            <span>Editar Servicio:</span>
            <span className="font-mono text-secondary">{service.key}</span>
          </h1>
          <p className="text-xs text-graphite-500 dark:text-slate-400 mt-0.5">
            Actualización técnica, parámetros operativos y contenido multilingüe (ES, EN, FR, DE).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/es/servicios/${service.translations.es?.slug || service.key}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 hover:border-petroleum-600 dark:hover:border-slate-500 text-xs font-bold text-graphite-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Eye className="w-4 h-4 text-secondary" />
            <span>Ver en web pública</span>
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 min-h-[42px]"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>{isPending ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <span className="font-medium pt-0.5">{feedback.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-graphite-200 dark:border-graphite-800 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "general"
              ? "border-secondary text-secondary bg-warm-100/60 dark:bg-graphite-800/60"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-graphite-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Configuración Técnica & Estado</span>
        </button>

        {LOCALES.map((loc) => (
          <button
            key={loc.code}
            type="button"
            onClick={() => setActiveTab(loc.code as any)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === loc.code
                ? "border-secondary text-secondary bg-warm-100/60 dark:bg-graphite-800/60"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-graphite-900 dark:hover:text-white"
            }`}
          >
            <span>{loc.flag}</span>
            <span>{loc.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Configuración Técnica & Estado */}
      {activeTab === "general" && (
        <div className="space-y-6 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-6 sm:p-8 rounded-3xl shadow-sm">
          <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2 border-b border-graphite-100 dark:border-graphite-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span>Parámetros Operativos del Servicio</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Clave del servicio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Clave identificadora (Key)
              </label>
              <input
                type="text"
                disabled
                value={service.key}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-200 dark:border-graphite-700 bg-graphite-100 dark:bg-graphite-800 text-xs font-mono font-bold cursor-not-allowed text-graphite-600 dark:text-slate-400"
              />
              <span className="text-[11px] text-graphite-400 mt-1 block">
                Identificador permanente del servicio en código y base de datos.
              </span>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Categoría comercial
              </label>
              <select
                value={service.category}
                onChange={(e) => handleGeneralChange("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              >
                <option value="REFORMAS_VIVIENDA">REFORMAS_VIVIENDA (Baños, cocinas, integrales)</option>
                <option value="INSTALACIONES_CONFORT">INSTALACIONES_CONFORT (Fontanería, clima, electricidad)</option>
                <option value="ACCESIBILIDAD_COMUNIDADES">ACCESIBILIDAD_COMUNIDADES (Portales, rampas)</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Estado de publicación
              </label>
              <select
                value={service.status}
                onChange={(e) => handleGeneralChange("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              >
                <option value="APPROVED">APPROVED (Publicado y visible en la web)</option>
                <option value="DRAFT">DRAFT (Borrador / en revisión técnica)</option>
                <option value="ARCHIVED">ARCHIVED (Archivado / fuera de catálogo)</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Orden de visualización
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={service.orderIndex}
                onChange={(e) => handleGeneralChange("orderIndex", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
              <span className="text-[11px] text-graphite-400 mt-1 block">
                Posición relativa en listados (1 a 20).
              </span>
            </div>

            {/* Imagen destacada URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                URL de Imagen Destacada (HTTPS)
              </label>
              <input
                type="url"
                value={service.featuredImage || ""}
                onChange={(e) => handleGeneralChange("featuredImage", e.target.value)}
                placeholder="https://assets.zyrosite.com/... o https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
              {service.featuredImage && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-warm-50 dark:bg-graphite-800/50 border border-graphite-200 dark:border-graphite-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.featuredImage}
                    alt="Vista previa"
                    className="w-16 h-12 object-cover rounded-lg border border-slate-300"
                  />
                  <span className="text-[11px] text-slate-500">Vista previa de imagen vinculada</span>
                </div>
              )}
            </div>
          </div>

          {/* Requisitos y Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 dark:bg-graphite-800/50 border border-graphite-200 dark:border-graphite-700 cursor-pointer">
              <input
                type="checkbox"
                checked={service.isRegulated}
                onChange={(e) => handleGeneralChange("isRegulated", e.target.checked)}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-graphite-900 dark:text-white block">
                  Actividad Regulada / Boletín Oficial
                </span>
                <span className="text-[11px] text-graphite-500">
                  Requiere memorias técnicas, boletines oficiales o tramitación ante Industria (p. ej. gas, electricidad).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-warm-50 dark:bg-graphite-800/50 border border-graphite-200 dark:border-graphite-700 cursor-pointer">
              <input
                type="checkbox"
                checked={service.qualifiedPartnerRequired}
                onChange={(e) => handleGeneralChange("qualifiedPartnerRequired", e.target.checked)}
                className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-0.5 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-graphite-900 dark:text-white block">
                  Instalador Homologado Obligatorio
                </span>
                <span className="text-[11px] text-graphite-500">
                  Requiere operario con carné profesional acreditado y seguro de responsabilidad civil específico.
                </span>
              </div>
            </label>
          </div>

          {/* Notas de revisión técnica interna */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
              Notas de Revisión Técnica Interna
            </label>
            <textarea
              rows={3}
              value={service.technicalReviewNotes || ""}
              onChange={(e) => handleGeneralChange("technicalReviewNotes", e.target.value)}
              placeholder="Anotaciones para el equipo técnico: normativa aplicable en Madrid, tiempos mínimos de secado, tolerancias..."
              className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      )}

      {/* TAB 2, 3, 4, 5: Traducción e Idioma Seleccionado */}
      {activeTab !== "general" && (
        <div className="space-y-6 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between border-b border-graphite-100 dark:border-graphite-800 pb-3">
            <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              <span>Contenido y SEO en {LOCALES.find((l) => l.code === activeTab)?.label} ({activeTab.toUpperCase()})</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-petroleum-100 dark:bg-petroleum-950 text-petroleum-800 dark:text-petroleum-300">
              locale: {activeTab}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nav Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Título corto para Navegación / Menú *
              </label>
              <input
                type="text"
                required
                value={currentTranslation.navTitle || ""}
                onChange={(e) => handleTranslationChange(activeTab, "navTitle", e.target.value)}
                placeholder="p. ej. Reformas de Baños"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Slug URL amigable *
              </label>
              <input
                type="text"
                required
                value={currentTranslation.slug || ""}
                onChange={(e) => handleTranslationChange(activeTab, "slug", e.target.value)}
                placeholder="reformas-banos-madrid"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-mono font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
              <span className="text-[11px] text-graphite-400 mt-1 block">
                Ruta: /{activeTab}/servicios/{currentTranslation.slug || "..."}
              </span>
            </div>

            {/* H1 Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Encabezado Principal H1 (SEO y Landing) *
              </label>
              <input
                type="text"
                required
                value={currentTranslation.h1 || ""}
                onChange={(e) => handleTranslationChange(activeTab, "h1", e.target.value)}
                placeholder="p. ej. Reformas de Baños en Madrid · Calidad, Rapidez y Garantía"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-bold text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Descripción Breve (Tarjetas y Catálogos)
              </label>
              <textarea
                rows={2}
                value={currentTranslation.shortDesc || ""}
                onChange={(e) => handleTranslationChange(activeTab, "shortDesc", e.target.value)}
                placeholder="Resumen directo en 2-3 líneas para la página de inicio y tarjetas del catálogo."
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* SEO Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Meta Title (Google)
              </label>
              <input
                type="text"
                value={currentTranslation.seoTitle || ""}
                onChange={(e) => handleTranslationChange(activeTab, "seoTitle", e.target.value)}
                placeholder="Título para buscadores (50-60 caracteres)"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* SEO Desc */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                Meta Description (Google)
              </label>
              <input
                type="text"
                value={currentTranslation.seoDesc || ""}
                onChange={(e) => handleTranslationChange(activeTab, "seoDesc", e.target.value)}
                placeholder="Meta descripción para buscadores (140-160 caracteres)"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Diagnóstico del problema */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                1. Diagnóstico del Problema / Necesidad Habitual
              </label>
              <textarea
                rows={3}
                value={currentTranslation.introProblem || ""}
                onChange={(e) => handleTranslationChange(activeTab, "introProblem", e.target.value)}
                placeholder="¿Qué problema sufre el cliente en Madrid antes de contratarnos? Fugas, tuberías de plomo, falta de espacio, azulejos desgastados..."
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Solución Técnica */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                2. Solución Técnica Propuesta por GM REFORMA EXPRESS
              </label>
              <textarea
                rows={3}
                value={currentTranslation.introSolution || ""}
                onChange={(e) => handleTranslationChange(activeTab, "introSolution", e.target.value)}
                placeholder="Nuestra propuesta metodológica: demolición selectiva, materiales hidrófugos, fontanería multicapa, saneado..."
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Alcance del trabajo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-graphite-700 dark:text-slate-300 mb-1.5">
                3. Alcance de los Trabajos (Scope)
              </label>
              <textarea
                rows={3}
                value={currentTranslation.introScope || ""}
                onChange={(e) => handleTranslationChange(activeTab, "introScope", e.target.value)}
                placeholder="Detalle exacto de partidas y responsabilidades técnicas asumidas."
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs text-graphite-900 dark:text-white focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-2xl shadow-sm">
        <span className="text-xs text-slate-500">
          Modo Administrador · Los cambios se publican inmediatamente en la web.
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="px-7 py-3 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4 text-secondary" />
          <span>{isPending ? "Guardando..." : "Guardar todos los cambios"}</span>
        </button>
      </div>
    </form>
  );
}

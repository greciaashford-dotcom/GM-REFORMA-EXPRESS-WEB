"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

export default function AdminImagenesPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [httpsUrl, setHttpsUrl] = useState("");
  const [altEs, setAltEs] = useState("");
  const [altEn, setAltEn] = useState("");
  const [focalPoint, setFocalPoint] = useState("center");

  const [validating, setValidating] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (res.ok) setImages(data.images || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/media/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          httpsUrl,
          altEs: altEs || "GM REFORMA EXPRESS en Madrid",
          altEn: altEn || "GM REFORMA EXPRESS in Madrid",
          focalPoint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Validación de imagen fallida");
      }

      setFeedback({ success: true, message: "Imagen validada contra SSRF y registrada con éxito." });
      setHttpsUrl("");
      setAltEs("");
      fetchImages();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-graphite-900 dark:text-white">
          14. Biblioteca de Imágenes Externas (Protección SSRF)
        </h1>
        <p className="text-xs text-graphite-500 dark:text-slate-400 mt-1">
          Configuración de fotografías comerciales mediante URL HTTPS externa. Bloqueo estricto de redes privadas, localhost y metadatos de nube.
        </p>
      </div>

      {/* URL Ingestion Form with SSRF Check */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-petroleum-700" />
          Añadir y validar fotografía externa
        </h2>

        <form onSubmit={handleValidateAndAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
              URL HTTPS Externa de la imagen *
            </label>
            <input
              type="url"
              required
              value={httpsUrl}
              onChange={(e) => setHttpsUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Texto alternativo descriptivo (Español)
              </label>
              <input
                type="text"
                value={altEs}
                onChange={(e) => setAltEs(e.target.value)}
                placeholder="Ej. Cuarto de baño reformado con plato de ducha en Madrid"
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-graphite-700 dark:text-slate-300 mb-1">
                Punto focal de recorte
              </label>
              <select
                value={focalPoint}
                onChange={(e) => setFocalPoint(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-800 text-xs"
              >
                <option value="center">Centro</option>
                <option value="top">Superior</option>
                <option value="bottom">Inferior</option>
              </select>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                feedback.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={validating}
              className="px-6 py-2.5 rounded-xl bg-petroleum-800 hover:bg-petroleum-900 text-white font-bold text-xs shadow flex items-center gap-2"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Validar URL y Añadir a Biblioteca</span>
            </button>
          </div>
        </form>
      </div>

      {/* Images list */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-graphite-900 dark:text-white">
          Imágenes registradas y dominios aprobados
        </h2>
        <div className="p-4 rounded-2xl bg-warm-100 dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-xs text-graphite-600 space-y-1">
          <p className="font-bold text-graphite-900 dark:text-white">Dominios CDN autorizados:</p>
          <p className="font-mono text-[11px]">images.unsplash.com, res.cloudinary.com, imagedelivery.net, www.reformaexpress.com</p>
        </div>
      </div>
    </div>
  );
}

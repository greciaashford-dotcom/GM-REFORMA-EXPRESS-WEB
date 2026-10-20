"use client";

import React, { useState } from "react";
import { Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface NewsletterFormProps {
  locale: Locale;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({ locale }) => {
  const dict = getDictionary(locale).newsletter;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setErrorMessage("Debe aceptar la política de privacidad y autorizar el envío de comunicaciones comerciales.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, locale }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la suscripción");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Error al procesar la suscripción. Inténtelo más tarde.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-6 rounded-2xl bg-petroleum-50 dark:bg-petroleum-950/60 border border-petroleum-200 dark:border-petroleum-800 text-petroleum-900 dark:text-petroleum-200 space-y-2 text-center animate-in fade-in duration-200">
        <CheckCircle2 className="w-10 h-10 text-petroleum-700 mx-auto" />
        <h3 className="text-lg font-bold">{dict.successTitle}</h3>
        <p className="text-sm max-w-md mx-auto leading-relaxed">{dict.successDesc}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={dict.namePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-900 text-graphite-900 dark:text-white placeholder-graphite-400 text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.placeholder}
          className="w-full px-4 py-3 rounded-lg border border-graphite-300 dark:border-graphite-700 bg-white dark:bg-graphite-900 text-graphite-900 dark:text-white placeholder-graphite-400 text-sm focus:outline-none focus:ring-2 focus:ring-petroleum-600 min-h-[44px]"
        />
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="newsletter-consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="w-4 h-4 text-petroleum-800 rounded focus:ring-petroleum-600 mt-1 cursor-pointer flex-shrink-0"
        />
        <label htmlFor="newsletter-consent" className="text-xs text-graphite-600 dark:text-slate-400 leading-normal cursor-pointer">
          {dict.checkboxLegal}
        </label>
      </div>

      {status === "error" && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto px-7 py-3 rounded-lg bg-secondary hover:bg-gold-600 text-graphite-950 font-black text-sm transition-all hover:scale-[1.02] shadow flex items-center justify-center gap-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
      >

        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            <span>{dict.button}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;

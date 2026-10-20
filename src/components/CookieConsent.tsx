"use client";

import React, { useState, useEffect } from "react";
import { Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShieldCheck, Settings, Check, X } from "lucide-react";

interface CookieConsentProps {
  locale: Locale;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ locale }) => {
  const dict = getDictionary(locale).cookieBanner;
  const [isVisible, setIsVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gm_cookie_consent");
    if (!saved) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setAnalyticsConsent(Boolean(parsed.analytics));
        setMarketingConsent(Boolean(parsed.marketing));
      } catch {
        setIsVisible(true);
      }
    }

    const handleOpenPreferences = () => {
      setIsVisible(true);
      setShowConfig(true);
    };

    window.addEventListener("open_cookie_preferences", handleOpenPreferences);
    return () => window.removeEventListener("open_cookie_preferences", handleOpenPreferences);
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const consent = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("gm_cookie_consent", JSON.stringify(consent));
    setIsVisible(false);
    setShowConfig(false);

    // Notify listeners or load GA4 if consented
    if (analytics && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectAll = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsConsent, marketingConsent);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.title}
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 bg-white/95 dark:bg-graphite-900/95 backdrop-blur-md border-t border-graphite-200 dark:border-graphite-800 shadow-2xl animate-in slide-in-from-bottom duration-200"
    >
      <div className="max-w-6xl mx-auto">
        {!showConfig ? (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-petroleum-800 dark:text-petroleum-400 font-bold text-lg">
                <ShieldCheck className="w-5 h-5" />
                <h2>{dict.title}</h2>
              </div>
              <p className="text-sm text-graphite-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                {dict.desc}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-600 text-graphite-700 dark:text-slate-200 hover:bg-warm-100 dark:hover:bg-graphite-800 font-semibold text-sm transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-petroleum-600"
              >
                {dict.rejectAll}
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg border-2 border-primary dark:border-secondary text-primary dark:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/10 font-bold text-sm transition-colors min-h-[44px] flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <Settings className="w-4 h-4 text-secondary" />
                <span>{dict.configure}</span>
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-secondary hover:bg-gold-600 text-graphite-950 font-black text-sm shadow-md transition-all hover:scale-[1.02] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {dict.acceptAll}
              </button>

            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-graphite-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-petroleum-700 dark:text-petroleum-400" />
                {dict.title}
              </h2>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="p-1 rounded-md text-graphite-500 hover:text-graphite-800 dark:text-slate-400 dark:hover:text-white"
                aria-label="Cerrar configuración de cookies"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Necessary */}
              <div className="p-4 rounded-lg bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-graphite-900 dark:text-white text-sm flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {dict.necessary}
                  </div>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 leading-normal">
                    {dict.necessaryDesc}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-graphite-200 dark:bg-graphite-700 text-graphite-700 dark:text-slate-300">
                  Obligatorias
                </span>
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-lg bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="analytics-consent" className="font-semibold text-graphite-900 dark:text-white text-sm cursor-pointer">
                    {dict.analytics}
                  </label>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 leading-normal">
                    {dict.analyticsDesc}
                  </p>
                </div>
                <input
                  id="analytics-consent"
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="w-5 h-5 text-petroleum-800 rounded focus:ring-petroleum-600 mt-1 cursor-pointer"
                />
              </div>

              {/* Marketing */}
              <div className="p-4 rounded-lg bg-warm-50 dark:bg-graphite-800/60 border border-graphite-200 dark:border-graphite-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="marketing-consent" className="font-semibold text-graphite-900 dark:text-white text-sm cursor-pointer">
                    {dict.marketing}
                  </label>
                  <p className="text-xs text-graphite-600 dark:text-slate-400 leading-normal">
                    {dict.marketingDesc}
                  </p>
                </div>
                <input
                  id="marketing-consent"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="w-5 h-5 text-petroleum-800 rounded focus:ring-petroleum-600 mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-5 py-2.5 rounded-lg border border-graphite-300 dark:border-graphite-600 text-graphite-700 dark:text-slate-200 hover:bg-warm-100 dark:hover:bg-graphite-800 font-semibold text-sm transition-colors min-h-[44px]"
              >
                {dict.rejectAll}
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-6 py-2.5 rounded-lg bg-petroleum-800 hover:bg-petroleum-900 text-white font-semibold text-sm shadow-md transition-colors min-h-[44px]"
              >
                {dict.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;

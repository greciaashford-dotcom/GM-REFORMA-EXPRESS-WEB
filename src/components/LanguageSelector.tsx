"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, Locale } from "@/lib/constants";
import { Globe, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  currentLocale: Locale;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLocale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (targetLocale: Locale) => {
    setIsOpen(false);
    if (targetLocale === currentLocale) return;

    // Replace /[currentLocale]/... with /[targetLocale]/...
    const segments = pathname.split("/");
    if (segments[1] === currentLocale) {
      segments[1] = targetLocale;
    } else {
      segments.splice(1, 0, targetLocale);
    }
    const newPath = segments.join("/") || `/${targetLocale}`;
    router.push(newPath);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-[#04284d] hover:text-white transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Seleccionar idioma"
      >
        <Globe className="w-4 h-4 text-secondary" />
        <span className="hidden sm:inline">{LOCALE_LABELS[currentLocale].name}</span>
        <span className="sm:hidden">{currentLocale.toUpperCase()}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg bg-[#03203d] shadow-2xl border border-[#05386b] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {LOCALES.map((loc) => {
            const isSelected = loc === currentLocale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => switchLocale(loc)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between min-h-[44px] transition-colors ${
                  isSelected
                    ? "bg-[#04284d] text-secondary font-bold"
                    : "text-slate-200 hover:bg-[#04284d] hover:text-secondary"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{LOCALE_LABELS[loc].flag}</span>
                  <span>{LOCALE_LABELS[loc].name}</span>
                </span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

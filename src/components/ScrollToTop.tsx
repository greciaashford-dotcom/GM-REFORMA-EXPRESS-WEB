"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Scroll to top on route change
  useEffect(() => {
    // Instant scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Double-check on next animation frame in case DOM takes a tick to adjust height
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, searchParams]);

  // Global click handler on all link elements
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Ignore hash-only anchor jumps (e.g. #faq-section) unless it's just '#'
      if (href.startsWith("#") && href.length > 1) return;

      // If it's an internal route or absolute link matching current host
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin);

      if (isInternal) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    document.addEventListener("click", handleLinkClick, { passive: true, capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  return null;
}

export default ScrollToTop;

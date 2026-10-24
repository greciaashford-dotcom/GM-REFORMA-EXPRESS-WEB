import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import db from "@/lib/db";
import AdminNavigationShell from "@/components/admin/AdminNavigationShell";
import { AlertTriangle } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role === "CUSTOMER") {
    redirect("/es/login?callback=/admin");
  }

  // Fetch site settings to check tax verification status
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
  });

  const isTaxUnverified = !settings?.taxIdVerified || !settings?.legalName || !settings?.taxAddress;

  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-slate-50 dark:bg-[#020d1a] font-sans antialiased text-graphite-900 dark:text-slate-100">
        <div className="min-h-screen flex flex-col">
          {/* 1. MANDATORY TAX WARNING BANNER IF UNVERIFIED */}
          {isTaxUnverified && (
            <aside
              aria-label="Alerta de datos fiscales pendientes de verificación"
              className="bg-amber-500 text-graphite-950 px-4 py-2 text-xs font-semibold shadow-sm flex items-center justify-between z-50"
            >
              <div className="max-w-7xl mx-auto flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-graphite-950" />
                <span>
                  <strong>ATENCIÓN — VALIDACIÓN CENSAL AEAT EN CURSO:</strong> Titular:{" "}
                  <strong>{settings?.legalName || "ANDERSON BEJARANO VASQUEZ"}</strong> · Domicilio:{" "}
                  <strong>{settings?.taxAddress || "Calle Ramon Lujan 53, Madrid"}</strong> · NIF/NIE:{" "}
                  <code>{settings?.taxId || "Y90137803D"}</code>. Los cobros reales y la emisión fiscal formal están protegidos hasta activar la casilla de verificación en configuración.
                </span>
              </div>
              <Link
                href="/admin/configuracion"
                className="underline font-extrabold text-graphite-950 hover:text-black flex-shrink-0 ml-4 whitespace-nowrap"
              >
                Configuración fiscal →
              </Link>
            </aside>
          )}

          {/* 2. MODERN ADMIN SHELL */}
          <AdminNavigationShell
            user={{
              name: user.name,
              email: user.email,
              role: user.role,
            }}
          >
            {children}
          </AdminNavigationShell>
        </div>
      </body>
    </html>
  );
}

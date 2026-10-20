import React from "react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ServiceEditForm, { ServiceData } from "@/components/admin/ServiceEditForm";

interface Props {
  params: { id: string };
}

export default async function AdminServiceEditPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role === "CUSTOMER") {
    redirect("/es/login?callback=/admin/servicios");
  }

  const { id } = params;

  // Find service by ID or fallback by key
  const service = await db.service.findFirst({
    where: {
      OR: [{ id }, { key: id }],
    },
    include: {
      translations: true,
    },
  });

  if (!service) {
    notFound();
  }

  // Format translations as record by locale
  const translationsMap: Record<string, any> = {};
  for (const t of service.translations) {
    translationsMap[t.locale] = {
      locale: t.locale,
      slug: t.slug,
      h1: t.h1,
      navTitle: t.navTitle,
      shortDesc: t.shortDesc,
      seoTitle: t.seoTitle,
      seoDesc: t.seoDesc,
      introProblem: t.introProblem,
      introSolution: t.introSolution,
      introScope: t.introScope,
      includedItems: t.includedItems,
      excludedItems: t.excludedItems,
    };
  }

  // Fallback defaults for missing locales
  for (const loc of ["es", "en", "fr", "de"]) {
    if (!translationsMap[loc]) {
      const base = translationsMap.es || {};
      translationsMap[loc] = {
        locale: loc,
        slug: service.key,
        h1: base.h1 || service.key,
        navTitle: base.navTitle || service.key,
        shortDesc: base.shortDesc || "",
        seoTitle: base.seoTitle || "",
        seoDesc: base.seoDesc || "",
        introProblem: base.introProblem || "",
        introSolution: base.introSolution || "",
        introScope: base.introScope || "",
        includedItems: "[]",
        excludedItems: "[]",
      };
    }
  }

  const initialServiceData: ServiceData = {
    id: service.id,
    key: service.key,
    category: service.category as any,
    status: service.status as any,
    orderIndex: service.orderIndex,
    featuredImage: service.featuredImage,
    technicalReviewNotes: service.technicalReviewNotes,
    isRegulated: service.isRegulated,
    qualifiedPartnerRequired: service.qualifiedPartnerRequired,
    translations: translationsMap,
  };

  // Server Action for saving service updates
  async function saveServiceAction(data: ServiceData) {
    "use server";

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "CUSTOMER") {
      return { success: false, message: "No autorizado." };
    }

    try {
      await db.$transaction(async (tx) => {
        // 1. Update Service Base
        await tx.service.update({
          where: { id: data.id },
          data: {
            category: data.category,
            status: data.status,
            orderIndex: Number(data.orderIndex) || 0,
            featuredImage: data.featuredImage ? data.featuredImage.trim() : null,
            technicalReviewNotes: data.technicalReviewNotes ? data.technicalReviewNotes.trim() : null,
            isRegulated: Boolean(data.isRegulated),
            qualifiedPartnerRequired: Boolean(data.qualifiedPartnerRequired),
          },
        });

        // 2. Upsert Translations for each locale
        for (const [locale, t] of Object.entries(data.translations)) {
          if (!t) continue;
          await tx.serviceTranslation.upsert({
            where: {
              serviceId_locale: {
                serviceId: data.id,
                locale,
              },
            },
            create: {
              serviceId: data.id,
              locale,
              slug: t.slug ? t.slug.trim() : `${data.key}-${locale}`,
              h1: t.h1 ? t.h1.trim() : data.key,
              navTitle: t.navTitle ? t.navTitle.trim() : data.key,
              shortDesc: t.shortDesc ? t.shortDesc.trim() : "",
              seoTitle: t.seoTitle ? t.seoTitle.trim() : t.h1 || data.key,
              seoDesc: t.seoDesc ? t.seoDesc.trim() : t.shortDesc || "",
              introProblem: t.introProblem || "",
              introSolution: t.introSolution || "",
              introScope: t.introScope || "",
              includedItems: t.includedItems || "[]",
              excludedItems: t.excludedItems || "[]",
              serviceVariants: "[]",
              processSteps: "[]",
              priceFactors: "[]",
              technicalRequirements: "[]",
              faqs: "[]",
              relatedSlugs: "[]",
            },
            update: {
              slug: t.slug ? t.slug.trim() : `${data.key}-${locale}`,
              h1: t.h1 ? t.h1.trim() : data.key,
              navTitle: t.navTitle ? t.navTitle.trim() : data.key,
              shortDesc: t.shortDesc ? t.shortDesc.trim() : "",
              seoTitle: t.seoTitle ? t.seoTitle.trim() : t.h1 || data.key,
              seoDesc: t.seoDesc ? t.seoDesc.trim() : t.shortDesc || "",
              introProblem: t.introProblem || "",
              introSolution: t.introSolution || "",
              introScope: t.introScope || "",
              includedItems: t.includedItems || "[]",
              excludedItems: t.excludedItems || "[]",
            },
          });
        }

        // 3. Register Audit Log
        await tx.auditLog.create({
          data: {
            userId: currentUser.id,
            entityType: "Service",
            entityId: data.id,
            action: "UPDATE",
            details: JSON.stringify({
              key: data.key,
              status: data.status,
              category: data.category,
              updatedAt: new Date().toISOString(),
            }),
          },
        });
      });

      // 4. Revalidate cache
      revalidatePath("/admin/servicios");
      revalidatePath(`/admin/servicios/${data.id}/editar`);
      revalidatePath("/es/servicios");
      revalidatePath("/en/servicios");
      revalidatePath("/fr/servicios");
      revalidatePath("/de/servicios");
      revalidatePath("/");

      return {
        success: true,
        message: "¡Servicio y traducciones guardados correctamente en base de datos!",
      };
    } catch (err: any) {
      console.error("[saveServiceAction] Error updating service:", err);
      return {
        success: false,
        message: `Error al guardar: ${err?.message || "Error desconocido"}`,
      };
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <ServiceEditForm
        initialService={initialServiceData}
        onSaveAction={saveServiceAction}
      />
    </div>
  );
}

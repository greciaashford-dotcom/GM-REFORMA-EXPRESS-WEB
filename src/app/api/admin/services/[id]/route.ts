import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "CUSTOMER") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const service = await db.service.findFirst({
      where: {
        OR: [{ id }, { key: id }],
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Update service base
      await tx.service.update({
        where: { id: service.id },
        data: {
          category: body.category || service.category,
          status: body.status || service.status,
          orderIndex: body.orderIndex !== undefined ? Number(body.orderIndex) : service.orderIndex,
          featuredImage: body.featuredImage !== undefined ? body.featuredImage : service.featuredImage,
          technicalReviewNotes:
            body.technicalReviewNotes !== undefined ? body.technicalReviewNotes : service.technicalReviewNotes,
          isRegulated: body.isRegulated !== undefined ? Boolean(body.isRegulated) : service.isRegulated,
          qualifiedPartnerRequired:
            body.qualifiedPartnerRequired !== undefined
              ? Boolean(body.qualifiedPartnerRequired)
              : service.qualifiedPartnerRequired,
        },
      });

      // Update translations if provided
      if (body.translations && typeof body.translations === "object") {
        for (const [locale, t] of Object.entries(body.translations as Record<string, any>)) {
          if (!t) continue;
          await tx.serviceTranslation.upsert({
            where: {
              serviceId_locale: {
                serviceId: service.id,
                locale,
              },
            },
            create: {
              serviceId: service.id,
              locale,
              slug: t.slug || `${service.key}-${locale}`,
              h1: t.h1 || service.key,
              navTitle: t.navTitle || service.key,
              shortDesc: t.shortDesc || "",
              seoTitle: t.seoTitle || t.h1 || service.key,
              seoDesc: t.seoDesc || t.shortDesc || "",
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
              slug: t.slug || `${service.key}-${locale}`,
              h1: t.h1 || service.key,
              navTitle: t.navTitle || service.key,
              shortDesc: t.shortDesc || "",
              seoTitle: t.seoTitle || t.h1 || service.key,
              seoDesc: t.seoDesc || t.shortDesc || "",
              introProblem: t.introProblem || "",
              introSolution: t.introSolution || "",
              introScope: t.introScope || "",
              includedItems: t.includedItems || "[]",
              excludedItems: t.excludedItems || "[]",
            },
          });
        }
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          entityType: "Service",
          entityId: service.id,
          action: "UPDATE",
          details: JSON.stringify({
            updatedBy: user.email,
            updatedAt: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Servicio actualizado correctamente.",
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/services/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Error al actualizar el servicio." },
      { status: 500 }
    );
  }
}

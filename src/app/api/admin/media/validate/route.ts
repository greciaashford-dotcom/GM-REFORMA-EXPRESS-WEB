import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { validateExternalImageUrl } from "@/lib/security/ssrf";

const validateSchema = z.object({
  httpsUrl: z.string().url("Debe ser una URL válida"),
  altEs: z.string().optional().default("GM REFORMA EXPRESS Madrid"),
  altFr: z.string().optional().default("GM REFORMA EXPRESS Madrid"),
  altEn: z.string().optional().default("GM REFORMA EXPRESS Madrid"),
  altDe: z.string().optional().default("GM REFORMA EXPRESS Madrid"),
  focalPoint: z.string().optional().default("center"),
  credit: z.string().optional(),
  licenseNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role === "CUSTOMER") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }


    const body = await req.json();
    const parsed = validateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { httpsUrl, altEs, altFr, altEn, altDe, focalPoint, credit, licenseNotes } = parsed.data;

    // Run strict SSRF anti-spoofing and IP validation
    const check = await validateExternalImageUrl(httpsUrl);

    if (!check.valid) {
      return NextResponse.json(
        {
          success: false,
          error: check.error || "Validación de seguridad SSRF fallida",
        },
        { status: 422 }
      );
    }

    const urlObj = new URL(check.sanitizedUrl || httpsUrl);
    const domain = urlObj.hostname;

    const asset = await db.mediaAsset.upsert({
      where: { httpsUrl: check.sanitizedUrl || httpsUrl },
      create: {
        httpsUrl: check.sanitizedUrl || httpsUrl,
        domain,
        altEs,
        altFr,
        altEn,
        altDe,
        focalPoint,
        credit,
        licenseNotes,
      },
      update: {
        domain,
        altEs,
        altFr,
        altEn,
        altDe,
        focalPoint,
        credit,
        licenseNotes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Imagen verificada y registrada correctamente",
      asset,
    });
  } catch (error: any) {
    console.error("[Media Validate Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error al validar la imagen" },
      { status: 500 }
    );
  }
}

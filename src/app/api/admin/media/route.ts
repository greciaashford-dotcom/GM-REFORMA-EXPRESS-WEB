import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role === "CUSTOMER") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const images = await db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener imágenes" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }


    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID no proporcionado" }, { status: 400 });
    }

    await db.mediaAsset.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Imagen eliminada de la biblioteca" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al eliminar imagen" },
      { status: 500 }
    );
  }
}
